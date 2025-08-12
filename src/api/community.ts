import { axiosInstance } from "./axiosInstance";
import type { CreatePostDto, CommunityPost, CommunitySortType } from "../types/community";
import type { CommunityPostDetailVM } from "../types/community";

const API_URL = import.meta.env.VITE_API_URL;

// 커뮤니티 글 생성
export const createPost = async (data: CreatePostDto) => {
  const response = await axiosInstance.post(`/posts`, data);
  return response.data;
};

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
  const res = await axiosInstance.get(`/posts/communities/${postId}`, {
    params: { page, size, sort },
  });

  const r = res.data?.result;
  // 안전 매핑
  const hashtags: string[] =
    r?.hashtagListDto?.hashtagList?.map((h: any) => h?.content).filter(Boolean) ?? [];
  const imageUrls: string[] =
    r?.imageListDto?.imageList?.map((i: any) => i?.url).filter(Boolean) ?? [];
  const cList = r?.commentListDto;

  return {
    id: r?.id ?? postId,
    title: r?.title ?? "",
    content: r?.content ?? "",
    category: r?.category ?? "",
    hashtags,
    imageUrls,
    nickname: r?.nickname ?? "",
    isBestUser: !!r?.isBestUser,
    profileImageUrl: r?.profileimageUrl ?? undefined,
    views: r?.viewCount ?? 0,
    likes: r?.likeCount ?? 0,
    comments: r?.commentCount ?? 0,
    createdAt: r?.createdAt ?? "",
    commentPage: {
      list:
        cList?.commentList?.map((c: any) => ({
          id: c?.id,
          content: c?.content ?? "",
          likeCount: c?.likeCount ?? 0,
          nickname: c?.nickname ?? "",
          profileImageUrl: c?.profileimageUrl ?? undefined,
          createdAt: c?.createdAt ?? "",
        })) ?? [],
      listSize: cList?.listSize ?? 0,
      totalPage: cList?.totalPage ?? 0,
      totalElements: cList?.totalElements ?? 0,
      isFirst: !!cList?.isFirst,
      isLast: !!cList?.isLast,
    },
  };
};