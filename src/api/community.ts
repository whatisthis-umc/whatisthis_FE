import { axiosInstance } from "./axiosInstance";

export type CommunitySortType = "BEST" | "LATEST";

export interface GetCommunityDetailParams {
  postId: number;
  page: number;
  size: number;
  sort: CommunitySortType;
}

/** 커뮤니티 게시글 상세(+댓글 페이지네이션) */
export async function getCommunityDetail({
  postId,
  page,
  size,
  sort,
}: GetCommunityDetailParams) {
  const res = await axiosInstance.get(`/posts/communities/${postId}`, {
    params: { page, size, sort },
  });
  // 서버 포맷 보호
  return res.data?.result ?? res.data;
}