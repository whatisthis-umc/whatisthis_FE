import { axiosInstance } from "./axiosInstance";
import type { NoticeListResponse, NoticeDetailResponse } from "../types/supportNotice";

const API_URL = import.meta.env.VITE_API_URL;

export const getNoticeList = async (
  page: number = 1,
  size: number = 5,
): Promise<NoticeListResponse> => {
  const accessToken = localStorage.getItem("accessToken");

  const params: Record<string, number> = {
    page,
    size,
  };

  console.log("✅ 공지 목록 조회 URL:", `${API_URL}/support/notices`);
  console.log("✅ API 호출 params 확인:", params);

  const response = await axiosInstance.get(`/support/notices`, {
    params,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  console.log("🔥 공지 목록 API 응답 데이터", response.data);
  return response.data;
};

export const getNoticeDetail = async (noticeId: number): Promise<NoticeDetailResponse> => {
  const accessToken = localStorage.getItem("accessToken");

  console.log("✅ 공지 상세 조회 URL:", `${API_URL}/support/notices/${noticeId}`);

  const response = await axiosInstance.get(`/support/notices/${noticeId}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  console.log("🔥 공지 상세 API 응답 데이터", response.data);
  return response.data;
}; 