import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

console.log("🌐 API Base URL:", baseURL);

export const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
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

// 선택: 401 응답 처리(리프레시 토큰 로직이 준비될 때 확장)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 필요 시 여기서 401 처리 및 토큰 재발급 로직을 구현
    return Promise.reject(error);
  }
);