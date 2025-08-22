import { axiosInstance } from "./axiosInstance";
import type { 
  InquiryListResponse, 
  InquiryDetailResponse, 
  InquiryAnswerRequest,
  InquiryAnswerResponse,
  InquiryStatusUpdateRequest,
  InquiryStatus
} from "../types/adminInquiry";
import type { SupportInquiryListResponse, SupportInquiryDetailResponse, SupportInquiryCreateRequest, SupportInquiryCreateResponse } from "../types/supportInquiry";
import type { PublicAxiosConfig } from "./axiosInstance";

const API_URL = import.meta.env.VITE_API_BASE_URL;

// 관리자 문의 목록 조회
export const getInquiryList = async (
  page: number = 1,
  size: number = 5,
  status: InquiryStatus = 'all',
  keyword?: string
): Promise<InquiryListResponse> => {
  const params: Record<string, string | number> = {
    page, // 관리자 API는 1부터 시작 (중복 방지)
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
  });

  console.log("🔥 문의 목록 API 응답 데이터", response.data);
  return response.data;
};

// 고객 문의 목록 조회
export const getSupportInquiryList = async (
  page: number = 1,
  size: number = 5,
  keyword?: string
): Promise<SupportInquiryListResponse> => {
  const params: Record<string, string | number> = {
    page, // 스웨거 스펙: 1부터 시작
    size,
  };

  if (keyword && keyword.trim()) {
    params.keyword = keyword.trim();
  }

  console.log("✅ 고객 문의 목록 조회 URL:", `${API_URL}/support/inquiries`);
  console.log("✅ API 호출 params 확인:", params);

  const response = await axiosInstance.get(`/support/inquiries`, { params });
  console.log("🔥 고객 문의 목록 API 응답 데이터", response.data);
  return response.data;
};

// 고객 문의 상세 조회
export const getSupportInquiryDetail = async (
  inquiryId: number
): Promise<SupportInquiryDetailResponse> => {
  console.log("✅ 고객 문의 상세 조회 URL:", `${API_URL}/support/inquiries/${inquiryId}`);
  const response = await axiosInstance.get(`/support/inquiries/${inquiryId}`, {
    skipTokenRefresh: true // 403 에러 시 토큰 재발급 시도하지 않음
  } as PublicAxiosConfig);
  console.log("🔥 고객 문의 상세 API 응답 데이터", response.data);
  return response.data;
};

// 고객 문의 작성
export const createSupportInquiry = async (
  payload: SupportInquiryCreateRequest,
  files?: File[]
): Promise<SupportInquiryCreateResponse> => {
  const formData = new FormData();
  // Spring @RequestPart DTO 호환: JSON 파트를 application/json으로 보냄
  formData.append(
    "request",
    new Blob([JSON.stringify(payload)], { type: "application/json" })
  );
  if (files && files.length > 0) {
    files.forEach((file) => formData.append("files", file));
  }

  console.log("✅ 고객 문의 작성 URL:", `${API_URL}/support/inquiries`);
  // axiosInstance의 기본 JSON 헤더를 덮어써 멀티파트로 전송
  const response = await axiosInstance.post(`/support/inquiries`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  console.log("🔥 고객 문의 작성 API 응답 데이터", response.data);
  return response.data;
};

// 관리자 문의 상세 조회
export const getInquiryDetail = async (inquiryId: number): Promise<InquiryDetailResponse> => {
  console.log("✅ 문의 상세 조회 URL:", `${API_URL}/admin/inquiries/${inquiryId}`);

  const response = await axiosInstance.get(`/admin/inquiries/${inquiryId}`);

  console.log("🔥 문의 상세 API 응답 데이터", response.data);
  return response.data;
};

// 관리자 문의 답변 등록
export const createInquiryAnswer = async (
  inquiryId: number, 
  answerData: InquiryAnswerRequest
): Promise<InquiryAnswerResponse> => {
  console.log("✅ 문의 답변 등록 URL:", `${API_URL}/admin/inquiries/${inquiryId}/answer`);
  console.log("✅ 답변 데이터:", answerData);

  // 서버 스펙 불일치 대비: content/answer 키 동시 전송
  const payload: any = { content: answerData.content, answer: answerData.content };

  const response = await axiosInstance.post(`/admin/inquiries/${inquiryId}/answer`, payload, {
    headers: {
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
  console.log("✅ 문의 답변 수정 URL:", `${API_URL}/admin/inquiries/${inquiryId}/answer`);
  console.log("✅ 수정 답변 데이터:", answerData);

  // 서버 스펙 불일치 대비: content/answer 키 동시 전송
  const payload: any = { content: answerData.content, answer: answerData.content };

  const response = await axiosInstance.put(`/admin/inquiries/${inquiryId}/answer`, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log("🔥 문의 답변 수정 API 응답 데이터", response.data);
  return response.data;
};

// 관리자 문의 답변 조회
export const getInquiryAnswer = async (inquiryId: number): Promise<InquiryAnswerResponse & { result: { answer?: string } }> => {
  console.log("✅ 문의 답변 조회 URL:", `${API_URL}/admin/inquiries/${inquiryId}/answer`);

  const response = await axiosInstance.get(`/admin/inquiries/${inquiryId}/answer`, {
    skipTokenRefresh: true // 403/401 에러 시 토큰 재발급 시도하지 않음
  } as PublicAxiosConfig);

  console.log("🔥 문의 답변 조회 API 응답 데이터", response.data);
  return response.data;
};

// 관리자 문의 상태 변경
export const updateInquiryStatus = async (
  inquiryId: number, 
  statusData: InquiryStatusUpdateRequest
): Promise<InquiryAnswerResponse> => {
  console.log("✅ 문의 상태 변경 URL:", `${API_URL}/admin/inquiries/${inquiryId}/status`);
  console.log("✅ 상태 변경 데이터:", statusData);

  const response = await axiosInstance.patch(`/admin/inquiries/${inquiryId}/status`, statusData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log("🔥 문의 상태 변경 API 응답 데이터", response.data);
  return response.data;
}; 