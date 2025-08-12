import { axiosInstance } from "./axiosInstance";
import type { QnaListResponse, QnaDetailResponse } from "../types/supportQna";

const API_URL = import.meta.env.VITE_API_URL;

export const getQnaList = async (
  page: number = 1,
  size: number = 5,
): Promise<QnaListResponse> => {
  const accessToken = localStorage.getItem("accessToken");

  const params: Record<string, number> = {
    page, // 스웨거: 입력은 1부터, 응답은 pageNumber 0 기반으로 내려옴
    size,
  };

  console.log("✅ QnA 목록 조회 URL:", `${API_URL}/support/qnas`);
  console.log("✅ API 호출 params 확인:", params);

  const token = accessToken;
  const response = await axiosInstance.get(`/support/qnas`, {
    params,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  console.log("📤 최종 요청 URL:", response?.config?.baseURL + (response?.config?.url || ''));

  console.log("🔥 QnA 목록 API 응답 데이터", response.data);
  return response.data;
};

export const getQnaDetail = async (qnaId: number): Promise<QnaDetailResponse> => {
  const accessToken = localStorage.getItem("accessToken");

  console.log("✅ QnA 상세 조회 URL:", `${API_URL}/support/qnas/${qnaId}`);

  const response = await axiosInstance.get(`/support/qnas/${qnaId}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  console.log("🔥 QnA 상세 API 응답 데이터", response.data);
  return response.data;
}; 