// 신고 관련 API 서비스
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 자동으로 인증 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // API Key가 있는 경우 추가
    const apiKey = import.meta.env.VITE_API_KEY;
    if (apiKey) {
      config.headers['X-API-Key'] = apiKey;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 에러 시 토큰 제거하고 로그인 페이지로 리다이렉트
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 신고 상세 조회 타입 정의 (스웨거 문서에 맞춰 나중에 수정 예정)
export interface ReportDetail {
  reportId: number;
  type: string;
  content: string;
  reportContent: string;
  // 상세 정보는 상세조회 API 스웨거 문서 확인 후 추가
}

export interface ReportDetailResponse extends ApiResponse<ReportDetail> {}

// 공통 API 응답 타입
export interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

// 신고 목록 조회 타입 정의 (실제 API 응답에 맞춤)
export interface ReportListItem {
  reportId: number;
  type: string; // "COMMENT", "POST" 등
  content: string; // 신고된 내용
  reportContent: string; // 신고 사유 ("ETC_CONTENT", "ABUSIVE_LANGUAGE" 등)
  reportedAt: string; // 신고 일시
  status: string; // "PROCESSED", "UNPROCESSED"
}

export interface ReportListResult {
  reportList: ReportListItem[];
  listSize: number; // 페이지 크기
  totalPage: number; // 전체 페이지 수
  totalElements: number; // 전체 요소 수
  isFirst: boolean; // 첫 페이지 여부
  isLast: boolean; // 마지막 페이지 여부
}

export interface ReportListResponse extends ApiResponse<ReportListResult> {}

// API 호출 함수들
export const reportApi = {
  // 신고 상세 조회
  getReportDetail: async (reportId: number): Promise<ReportDetailResponse> => {
    try {
      const response = await apiClient.get(`/admin/reports/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('신고 상세 조회 실패:', error);
      throw error;
    }
  },

  // 신고 목록 조회 (실제 API 파라미터에 맞춤)
  getReportList: async (
    page: number = 1,
    status: string = 'ALL', // PROCESSED, UNPROCESSED, ALL
    keyword?: string
  ): Promise<ReportListResponse> => {
    try {
      const params: Record<string, string | number> = {
        page,
        status,
      };

      if (keyword && keyword.trim()) {
        params.keyword = keyword.trim();
      }

      const response = await apiClient.get('/admin/reports', { params });
      return response.data;
    } catch (error) {
      console.error('신고 목록 조회 실패:', error);
      throw error;
    }
  },

  // 신고 처리
  processReport: async (
    reportId: number,
    action: 'delete' | 'keep'
  ): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post(`/admin/reports/${reportId}`, { action });
      return response.data;
    } catch (error) {
      console.error('신고 처리 실패:', error);
      throw error;
    }
  },
}; 