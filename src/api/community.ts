import { axiosInstance } from "./axiosInstance";

<<<<<<< Updated upstream
const API_URL = import.meta.env.VITE_API_URL;
=======
export type CommunitySortType = "BEST" | "LATEST";
>>>>>>> Stashed changes

export interface GetCommunityDetailParams {
  postId: number;
  page: number;
  size: number;
  sort: CommunitySortType;
}

<<<<<<< Updated upstream
// 커뮤니티 글 목록 조회
export const getCommunityPosts = async (
  page: number,
  size: number,
  sort: CommunitySortType
): Promise<CommunityPost[]> => {
  console.log("✅ 최종 요청 URL:", `${API_URL}/posts/communities`);
  console.log("✅ API 호출 params 확인:", { page, size, sort });

  const response = await axiosInstance.get(`/posts/communities`, {
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

/** 게시글 상세 조회: GET /posts/communities/{postId}?page=&size=&sort= */
export const getCommunityPostDetail = async (
  postId: number,
  page: number,
  size: number,
  sort: CommunitySortType | "AI" = "LATEST"
): Promise<CommunityPostDetailVM> => {
=======
/** 커뮤니티 게시글 상세(+댓글 페이지네이션) */
export async function getCommunityDetail({
  postId,
  page,
  size,
  sort,
}: GetCommunityDetailParams) {
>>>>>>> Stashed changes
  const res = await axiosInstance.get(`/posts/communities/${postId}`, {
    params: { page, size, sort },
  });
  // 서버 포맷 보호
  return res.data?.result ?? res.data;
}