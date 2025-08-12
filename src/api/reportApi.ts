import { axiosInstance } from "./axiosInstance";
import type { 
  ReportListResponse, 
  ReportDetailResponse, 
  ReportListItem,
  ReportDeleteResponse,
  ProcessReportRequest,
  ProcessReportResponse
} from "../types/report";

const API_URL = import.meta.env.VITE_API_URL;

// 신고 목록 조회
export const getReportList = async (
  page: number = 1,
  status: string = 'ALL', // PROCESSED, UNPROCESSED, ALL
  keyword?: string
): Promise<ReportListResponse> => {
  const accessToken = localStorage.getItem("accessToken");
  const adminAccessToken = localStorage.getItem("adminAccessToken");

  const params: Record<string, string | number> = {
    page,
    status,
  };

  if (keyword && keyword.trim()) {
    params.keyword = keyword.trim();
  }

  console.log("✅ 신고 목록 조회 URL:", `${API_URL}/admin/reports`);
  console.log("✅ API 호출 params 확인:", params);
  console.log("✅ accessToken:", accessToken);
  console.log("✅ adminAccessToken:", adminAccessToken);

  const response = await axiosInstance.get(`/admin/reports`, {
    params,
    headers: {
      Authorization: `Bearer ${adminAccessToken || accessToken}`,
    },
  });

  console.log("🔥 신고 목록 API 응답 데이터", response.data);
  return response.data;
};

// 신고 상세 조회
export const getReportDetail = async (reportId: number): Promise<ReportDetailResponse> => {
  const accessToken = localStorage.getItem("accessToken");
  const adminAccessToken = localStorage.getItem("adminAccessToken");

  console.log("✅ 신고 상세 조회 URL:", `${API_URL}/admin/reports/${reportId}`);
  console.log("✅ reportId:", reportId);
  console.log("✅ accessToken:", accessToken);
  console.log("✅ adminAccessToken:", adminAccessToken);

  const response = await axiosInstance.get(`/admin/reports/${reportId}`, {
    headers: {
      Authorization: `Bearer ${adminAccessToken || accessToken}`,
    },
  });

  console.log("🔥 신고 상세 API 응답 데이터", response.data);
  return response.data;
};

// 신고 처리 (삭제/유지)
export const processReport = async (
  reportId: number,
  action: 'delete' | 'keep'
): Promise<ProcessReportResponse> => {
  const accessToken = localStorage.getItem("accessToken");
  const adminAccessToken = localStorage.getItem("adminAccessToken");

  console.log("✅ 신고 처리 URL:", `${API_URL}/admin/reports/${reportId}`);
  console.log("✅ 처리 요청:", { reportId, action });
  console.log("✅ accessToken:", accessToken ? "존재" : "없음");
  console.log("✅ adminAccessToken:", adminAccessToken ? "존재" : "없음");

  // 스웨거 문서에 따른 올바른 요청 형식: { "delete": boolean }
  const requestBody: ProcessReportRequest = { 
    delete: action === 'delete' 
  };
  console.log("📝 요청 본문 (스웨거 형식):", requestBody);

  const response = await axiosInstance.post(
    `/admin/reports/${reportId}`, 
    requestBody,
    {
      headers: {
        Authorization: `Bearer ${adminAccessToken || accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  console.log("🔥 신고 처리 API 응답 데이터", response.data);
  return response.data;
};

// 신고 상태 변경 (처리 완료로 변경)
export const updateReportStatus = async (reportId: number) => {
  const accessToken = localStorage.getItem("accessToken");
  const adminAccessToken = localStorage.getItem("adminAccessToken");

  console.log("✅ 신고 상태 변경 URL:", `${API_URL}/admin/reports/${reportId}/status`);
  console.log("✅ reportId:", reportId);
  console.log("✅ accessToken:", accessToken);
  console.log("✅ adminAccessToken:", adminAccessToken);

  const response = await axiosInstance.patch(
    `/admin/reports/${reportId}/status`,
    {},
    {
      headers: {
        Authorization: `Bearer ${adminAccessToken || accessToken}`,
      },
    }
  );

  console.log("🔥 신고 상태 변경 API 응답 데이터", response.data);
  return response.data;
}; 

// 신고 삭제
export const deleteReport = async (reportId: number): Promise<ReportDeleteResponse> => {
  const accessToken = localStorage.getItem("accessToken");
  const adminAccessToken = localStorage.getItem("adminAccessToken");

  console.log("✅ 신고 삭제 URL:", `${API_URL}/admin/reports/${reportId}`);
  console.log("✅ reportId:", reportId);
  console.log("✅ accessToken:", accessToken ? "존재" : "없음");
  console.log("✅ adminAccessToken:", adminAccessToken ? "존재" : "없음");
  console.log("✅ 최종 사용 토큰:", adminAccessToken || accessToken ? "있음" : "없음");

  // 토큰이 없는 경우 에러 발생
  if (!accessToken && !adminAccessToken) {
    throw new Error("인증 토큰이 없습니다. 다시 로그인해주세요.");
  }

  const response = await axiosInstance.delete(`/admin/reports/${reportId}`, {
    headers: {
      Authorization: `Bearer ${adminAccessToken || accessToken}`,
    },
  });

  console.log("🔥 신고 삭제 API 응답 데이터", response.data);
  return response.data;
}; 