////src/api/axiosInstance.ts
import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;
const ENABLE_LOG = String(import.meta.env.VITE_API_LOG) === "1";

export type PublicAxiosConfig = AxiosRequestConfig & {
  /** true면 Authorization 헤더를 강제로 제외 */
  isPublic?: boolean;
  /** true면 401/403 에러 시 토큰 재발급을 시도하지 않음 */
  skipTokenRefresh?: boolean;
};

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    // JSON은 axios가 자동, FormData는 브라우저가 자동으로 Content-Type 설정
    Accept: "application/json",
  },
  withCredentials: false, // JWT 헤더만 사용
});

let isRefreshing = false;
let waiters: Array<(token: string) => void> = [];

/* --------- 로깅 --------- */
function logRequest(config: AxiosRequestConfig) {
  if (!ENABLE_LOG) return;
  const method = config.method?.toUpperCase();
  const url = `${config.baseURL || ""}${config.url || ""}`;
  const auth = (config.headers as any)?.Authorization;
  const authShort = auth ? String(auth).slice(0, 25) + "..." : undefined;
  console.log("➡️", method, url, { params: config.params, auth: authShort });
}
function logResponse(res: AxiosResponse) {
  if (!ENABLE_LOG) return;
  const method = res.config.method?.toUpperCase();
  const url = `${res.config.baseURL || ""}${res.config.url || ""}`;
  console.log("✅", method, url, "->", res.status);
}
function logError(err: any) {
  if (!ENABLE_LOG) return;
  const cfg = err?.config;
  const method = cfg?.method?.toUpperCase?.();
  const url = `${cfg?.baseURL || ""}${cfg?.url || ""}`;
  const status = err?.response?.status;
  console.log("❌", method, url, "->", status, err?.message);
}

/* --------- 요청 인터셉터 --------- */
axiosInstance.interceptors.request.use((config: any) => {
  const isPublic = config.isPublic === true;

  // Authorization 주입/제거
  if (!isPublic) {
    const url = (config.url ?? "").toString();
    const isAdminApi = url.startsWith("/admin") || url.startsWith("/upload");
    
    // admin API는 admin 토큰 사용, 나머지는 일반 토큰 사용
    const token = isAdminApi 
      ? localStorage.getItem("adminAccessToken") 
      : localStorage.getItem("accessToken");
      
    if (token) {
      config.headers = config.headers ?? {};
      if (!(config.headers as any).Authorization) {
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    }
  } else {
    config.headers = config.headers ?? {};
    if ("Authorization" in (config.headers as any)) {
      delete (config.headers as any).Authorization;
    }
  }

  // FormData면 Content-Type 제거(대/소문자 모두)
  if (config.data instanceof FormData && config.headers) {
    delete (config.headers as any)["Content-Type"];
    delete (config.headers as any)["content-type"];
  }

  // 내부 플래그는 실제 전송 헤더에서 제거
  if ((config as any).__retry) {
    const { __retry, ...rest } = config as any;
    config = rest;
  }

  logRequest(config);
  return config;
});

/* --------- 토큰 재발급 --------- */
async function refreshToken(): Promise<string> {
  const refresh = localStorage.getItem("refreshToken");
  if (!refresh) throw new Error("로그인이 필요합니다.");

  // refresh는 순수 axios로(interceptor 영향 최소화)
  const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken: refresh });
  if (!res.data?.isSuccess) throw new Error(res.data?.message ?? "토큰 재발급 실패");

  const newAccess = res.data.result?.accessToken ?? res.data.data?.accessToken;
  if (!newAccess) throw new Error("액세스 토큰 없음");

  localStorage.setItem("accessToken", newAccess);
  return newAccess;
}

function retryOriginal(original: PublicAxiosConfig, newAccess: string) {
  const retryConfig: PublicAxiosConfig = {
    ...original,
    headers: {
      ...(original.headers as any),
      Authorization: `Bearer ${newAccess}`,
    },
  };
  (retryConfig as any).__retry = true; // 무한루프 방지
  return axiosInstance(retryConfig);
}

/* --------- 응답 인터셉터 --------- */
axiosInstance.interceptors.response.use(
  (res) => {
    logResponse(res);
    if (res?.data && typeof res.data === "object" && "isSuccess" in res.data) {
      if (res.data.isSuccess) return res;
      return Promise.reject(
        Object.assign(new Error(res.data?.message ?? "요청 실패"), { response: res })
      );
    }
    return res;
  },
  async (error) => {
    logError(error);

    const status = error?.response?.status;
    const original = (error?.config ?? {}) as PublicAxiosConfig;

    if (original?.isPublic) return Promise.reject(error);
    if ((original as any).__retry) return Promise.reject(error);
    if (original?.skipTokenRefresh) return Promise.reject(error);

    if (status === 401 || status === 403) {
      const refresh = localStorage.getItem("refreshToken");
      if (!refresh) return Promise.reject(error);

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          waiters.push(async (latestToken: string) => {
            try {
              const r = await retryOriginal(original, latestToken);
              resolve(r);
            } catch (e) {
              reject(e);
            }
          });
        });
      }

      isRefreshing = true;
      try {
        const newAccess = await refreshToken();
        waiters.forEach((fn) => {
          try {
            fn(newAccess);
          } catch {}
        });
        waiters = [];
        return retryOriginal(original, newAccess);
      } catch (e) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);