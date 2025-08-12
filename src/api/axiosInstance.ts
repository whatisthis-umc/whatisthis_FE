import axios from "axios";
import { ApiError } from "./errors";

const baseURL = import.meta.env.VITE_API_BASE_URL;

console.log("🌐 API Base URL:", baseURL);

export const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
    withCredentials: true,    
  },
});

// 요청 인터셉터: 경로별로 적절한 토큰 자동 주입
axiosInstance.interceptors.request.use(
  (config) => {
    const adminAccessToken = localStorage.getItem("adminAccessToken");
    const accessToken = localStorage.getItem("accessToken");

    const url = (config.url ?? "").toString();
    const isAdminApi = url.startsWith("/admin");

    const token = isAdminApi ? adminAccessToken : accessToken;

    if (token) {
      config.headers = config.headers ?? {};
      // Authorization 헤더가 이미 명시된 경우(개별 요청 override)는 건드리지 않음
      if (!config.headers["Authorization"]) {
        (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let requestQueue: Array<(token?: string) => void> = [];

const processQueue = (token?: string) => {
  requestQueue.forEach((cb) => cb(token));
  requestQueue = [];
};

// 응답 인터셉터: 401 재발급(스텁) + 도메인 에러 통일
axiosInstance.interceptors.response.use(
  (response) => {
    // 공통 isSuccess 통일 처리 (응답에 result 스키마가 있는 경우)
    const data = response?.data as any;
    if (data && typeof data === 'object' && 'isSuccess' in data) {
      if (!data.isSuccess) {
        throw new ApiError(data.message || 'API Error', {
          code: data.code,
          status: response.status,
          data,
        });
      }
    }
    return response;
  },
  async (error) => {
    // 401 토큰 재발급 플로우(후속 구현 필요 시 교체)
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const originalRequest: any = error.config;

      if (isRefreshing) {
        // 토큰 갱신 대기 후 재시도
        return new Promise((resolve) => {
          requestQueue.push((token) => {
            if (token) {
              originalRequest.headers = originalRequest.headers ?? {};
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
            }
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        // TODO: 실제 refresh API로 교체
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw error;

        // 가짜 재발급: 현재 accessToken 재사용 (데모용). 실제로는 /auth/refresh 호출해야 함
        const newAccessToken = localStorage.getItem('accessToken');
        if (!newAccessToken) throw error;

        localStorage.setItem('accessToken', newAccessToken);
        processQueue(newAccessToken);

        // 원 요청 재시도
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (e) {
        processQueue();
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    // 기타 에러는 ApiError로 래핑하여 통일
    if (axios.isAxiosError(error)) {
      const msg = error.response?.data?.message || error.message || 'Network Error';
      const code = error.response?.data?.code;
      const status = error.response?.status;
      throw new ApiError(msg, { code, status, data: error.response?.data });
    }
    return Promise.reject(error);
  }
);