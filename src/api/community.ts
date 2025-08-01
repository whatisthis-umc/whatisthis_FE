import { axiosInstance } from "./axiosInstance";
import type { CreatePostDto, CommunityPost, CommunitySortType } from "../types/community";

const API_URL = import.meta.env.VITE_API_URL;

// 커뮤니티 글 생성
export const createPost = async (data: CreatePostDto) => {
  const response = await axiosInstance.post(`${API_URL}/posts`, data);
  return response.data;
};

// 커뮤니티 글 목록 조회
export const getCommunityPosts = async (
  page: number,
  size: number,
  sort: CommunitySortType
): Promise<CommunityPost[]> => {
  const accessToken = localStorage.getItem("accessToken");

  console.log("✅ 최종 요청 URL:", `${API_URL}/posts/communities`);
  console.log("✅ API 호출 params 확인:", { page, size, sort });
  console.log("✅ accessToken:", accessToken);

  const response = await axiosInstance.get(`${API_URL}/posts/communities`, {
  params: {
    page: `${page}`,
    size: `${size}`,
    sort: `${sort}`,
  },
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});


  console.log("🔥 API 응답 데이터", response.data);
  return response.data.result?.postList ?? [];
};
