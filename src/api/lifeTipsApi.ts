import { createPostService } from "./commonApi";
import { axiosInstance } from "./axiosInstance";
import type { TipPost } from "./types";

// 기존 엔드포인트 (일반 사용자 게시물만)
export const tipService = createPostService(
  "/posts/life-tips/all",
  ["LIFE_TIP", "COOK_TIP", "CLEAN_TIP", "BATHROOM_TIP", "CLOTH_TIP", "STORAGE_TIP"],
  "tips"
);

export const allPostsService = createPostService(
  "/posts",  // 모든 게시물
  ["LIFE_TIP", "COOK_TIP", "CLEAN_TIP", "BATHROOM_TIP", "CLOTH_TIP", "STORAGE_TIP"],
  "tips"
);

// AI 추천 게시물 조회 API
export const getAiRecommendedPosts = async (page: number = 0, size: number = 5): Promise<{
  posts: TipPost[];
  totalElements: number;
  totalPages: number;
}> => {
  try {
    const response = await axiosInstance.get("/posts/life-tips/ai", {
      params: { page, size }
    });

    const result = response.data.result;
    const posts = result.posts.map((post: any) => ({
      ...post,
      type: "tips" as const,
      imageUrls: post.thumnailUrl ? [post.thumnailUrl] : [],
      views: post.viewCount || 0,
      scraps: post.scrapCount || 0,
      subCategories: post.subCategory ? [post.subCategory] : []
    })) as TipPost[];

    return {
      posts,
      totalElements: result.totalElements || 0,
      totalPages: result.totalPages || 0
    };
  } catch (error) {
    console.error("AI 추천 게시물 조회 실패:", error);
    throw error;
  }
};
