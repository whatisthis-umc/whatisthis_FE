import { createPostService } from "./commonApi";
import { axiosInstance } from "./axiosInstance";
import type { ItemPost } from "./types";

export const itemService = createPostService(
  "/posts/life-items/all", 
  ["LIFE_ITEM", "SELF_LIFE_ITEM", "KITCHEN_ITEM", "CLEAN_ITEM", "HOUSEHOLD_ITEM", "BRAND_ITEM"],
  "items"
);

// AI 추천 게시물 조회 API
export const getAiRecommendedItems = async (page: number = 0, size: number = 5): Promise<{
  posts: ItemPost[];
  totalElements: number;
  totalPages: number;
}> => {
  try {
    const response = await axiosInstance.get("/posts/life-items/ai", {
      params: { page, size }
    });

    const result = response.data.result;
    const posts = result.posts.map((post: any) => ({
      ...post,
      type: "items" as const,
      imageUrls: post.thumnailUrl ? [post.thumnailUrl] : [],
      views: post.viewCount || 0,
      scraps: post.scrapCount || 0,
      subCategories: post.subCategory ? [post.subCategory] : []
    })) as ItemPost[];

    return {
      posts,
      totalElements: result.totalElements || 0,
      totalPages: result.totalPages || 0
    };
  } catch (error) {
    console.error("AI 추천 아이템 조회 실패:", error);
    throw error;
  }
};
