import { axiosInstance } from "./axiosInstance";
import type { 
  InquiryListResponse, 
  InquiryDetailResponse, 
  InquiryAnswerRequest,
  InquiryAnswerResponse,
  InquiryStatusUpdateRequest,
  InquiryStatus
} from "../types/adminInquiry";

const API_URL = import.meta.env.VITE_API_URL;

// 관리자 문의 목록 조회
export const getInquiryList = async (
  page: number = 1,
  size: number = 5,
  status: InquiryStatus = 'all',
  keyword?: string
): Promise<InquiryListResponse> => {
  const accessToken = localStorage.getItem("accessToken");
  const adminAccessToken = localStorage.getItem("adminAccessToken");

  const params: Record<string, string | number> = {
    page: page - 1, // API는 0부터 시작하는 페이지 번호 사용
    size,
  };

  // status가 'all'이 아닌 경우에만 파라미터 추가
  if (status !== 'all') {
    params.status = status === 'processed' ? 'PROCESSED' : 'UNPROCESSED';
  }

  if (keyword && keyword.trim()) {
    params.keyword = keyword.trim();
  }

  console.log("✅ 문의 목록 조회 URL:", `${API_URL}/admin/inquiries`);
  console.log("✅ API 호출 params 확인:", params);

  const response = await axiosInstance.get(`/admin/inquiries`, {
    params,
    headers: {
      Authorization: `Bearer ${adminAccessToken || accessToken}`,
    },
  });

  console.log("🔥 문의 목록 API 응답 데이터", response.data);
  return response.data;
};

// 관리자 문의 상세 조회
export const getInquiryDetail = async (inquiryId: number): Promise<InquiryDetailResponse> => {
  const accessToken = localStorage.getItem("accessToken");
  const adminAccessToken = localStorage.getItem("adminAccessToken");

  console.log("✅ 문의 상세 조회 URL:", `${API_URL}/admin/inquiries/${inquiryId}`);

  const response = await axiosInstance.get(`/admin/inquiries/${inquiryId}`, {
    headers: {
      Authorization: `Bearer ${adminAccessToken || accessToken}`,
    },
  });

  console.log("🔥 문의 상세 API 응답 데이터", response.data);
  return response.data;
};

// 관리자 문의 답변 등록
export const createInquiryAnswer = async (
  inquiryId: number, 
  answerData: InquiryAnswerRequest
): Promise<InquiryAnswerResponse> => {
  const accessToken = localStorage.getItem("accessToken");
  const adminAccessToken = localStorage.getItem("adminAccessToken");

  console.log("✅ 문의 답변 등록 URL:", `${API_URL}/admin/inquiries/${inquiryId}/answer`);
  console.log("✅ 답변 데이터:", answerData);

  const response = await axiosInstance.post(`/admin/inquiries/${inquiryId}/answer`, answerData, {
    headers: {
      Authorization: `Bearer ${adminAccessToken || accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  console.log("🔥 문의 답변 등록 API 응답 데이터", response.data);
  return response.data;
};

// 관리자 문의 답변 수정
export const updateInquiryAnswer = async (
  inquiryId: number, 
  answerData: InquiryAnswerRequest
): Promise<InquiryAnswerResponse> => {
  const accessToken = localStorage.getItem("accessToken");
  const adminAccessToken = localStorage.getItem("adminAccessToken");

  console.log("✅ 문의 답변 수정 URL:", `${API_URL}/admin/inquiries/${inquiryId}/answer`);
  console.log("✅ 수정 답변 데이터:", answerData);

  const response = await axiosInstance.put(`/admin/inquiries/${inquiryId}/answer`, answerData, {
    headers: {
      Authorization: `Bearer ${adminAccessToken || accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  console.log("🔥 문의 답변 수정 API 응답 데이터", response.data);
  return response.data;
};

// 관리자 문의 답변 조회
export const getInquiryAnswer = async (inquiryId: number): Promise<InquiryAnswerResponse & { result: { answer?: string } }> => {
  const accessToken = localStorage.getItem("accessToken");
  const adminAccessToken = localStorage.getItem("adminAccessToken");

  console.log("✅ 문의 답변 조회 URL:", `${API_URL}/admin/inquiries/${inquiryId}/answer`);

  const response = await axiosInstance.get(`/admin/inquiries/${inquiryId}/answer`, {
    headers: {
      Authorization: `Bearer ${adminAccessToken || accessToken}`,
    },
  });

  console.log("🔥 문의 답변 조회 API 응답 데이터", response.data);
  return response.data;
};

// 관리자 문의 상태 변경
export const updateInquiryStatus = async (
  inquiryId: number, 
  statusData: InquiryStatusUpdateRequest
): Promise<InquiryAnswerResponse> => {
  const accessToken = localStorage.getItem("accessToken");
  const adminAccessToken = localStorage.getItem("adminAccessToken");

  console.log("✅ 문의 상태 변경 URL:", `${API_URL}/admin/inquiries/${inquiryId}/status`);
  console.log("✅ 상태 변경 데이터:", statusData);

  const response = await axiosInstance.patch(`/admin/inquiries/${inquiryId}/status`, statusData, {
    headers: {
      Authorization: `Bearer ${adminAccessToken || accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  console.log("🔥 문의 상태 변경 API 응답 데이터", response.data);
  return response.data;
}; 