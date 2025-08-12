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
  const params: Record<string, string | number> = {
    page,
    status,
  };

  if (keyword && keyword.trim()) {
    params.keyword = keyword.trim();
  }

  console.log("✅ 신고 목록 조회 URL:", `${API_URL}/admin/reports`);
  console.log("✅ API 호출 params 확인:", params);

  const response = await axiosInstance.get(`/admin/reports`, {
    params,
  });

  console.log("🔥 신고 목록 API 응답 데이터", response.data);
  return response.data;
};

// 신고 상세 조회
export const getReportDetail = async (reportId: number): Promise<ReportDetailResponse> => {
  console.log("✅ 신고 상세 조회 URL:", `${API_URL}/admin/reports/${reportId}`);
  console.log("✅ reportId:", reportId);

  const response = await axiosInstance.get(`/admin/reports/${reportId}`);

  console.log("🔥 신고 상세 API 응답 데이터", response.data);
  return response.data;
};

// 신고 처리 (삭제/유지)
export const processReport = async (
  reportId: number,
  action: 'delete' | 'keep'
): Promise<ProcessReportResponse> => {
  console.log("✅ 신고 처리 URL:", `${API_URL}/admin/reports/${reportId}`);
  console.log("✅ 처리 요청:", { reportId, action });

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
        'Content-Type': 'application/json',
      },
    }
  );

  console.log("🔥 신고 처리 API 응답 데이터", response.data);
  return response.data;
};

// 신고 상태 변경 (처리 완료로 변경)
export const updateReportStatus = async (reportId: number) => {
  console.log("✅ 신고 상태 변경 URL:", `${API_URL}/admin/reports/${reportId}/status`);
  console.log("✅ reportId:", reportId);

  const response = await axiosInstance.patch(
    `/admin/reports/${reportId}/status`,
    {},
    {
      headers: {
        // 본문 없이 패치, Content-Type 불필요하지만 명시해도 무해
      },
    }
  );

  console.log("🔥 신고 상태 변경 API 응답 데이터", response.data);
  return response.data;
}; 

// 신고 삭제
export const deleteReport = async (reportId: number): Promise<ReportDeleteResponse> => {
  console.log("✅ 신고 삭제 URL:", `${API_URL}/admin/reports/${reportId}`);
  console.log("✅ reportId:", reportId);

  const response = await axiosInstance.delete(`/admin/reports/${reportId}`);

  console.log("🔥 신고 삭제 API 응답 데이터", response.data);
  return response.data;
}; 