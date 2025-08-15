import { axiosInstance } from "./axiosInstance";
import type { Post } from "./types";

export interface SimilarPostResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: Array<{
    postId: number;
    thumnailUrl: string;
    category: string;
    title: string;
    summary: string;
    hashtags: string[];
    viewCount: number;
    scrapCount: number;
    createdAt: string;
  }>;
}

/**
 * 관련 게시물 조회
 * @param postId 게시물 ID
 * @param size (기본값: 5)
 */
export const getSimilarPosts = async (postId: number, size: number = 5): Promise<Post[]> => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    
    console.log("🔗 유사 게시물 API 호출:", { postId, size });
    
    const response = await axiosInstance.get<SimilarPostResponse>(`/posts/${postId}/similar`, {
      params: { size },
      headers: {
        ...(accessToken && { Authorization: `Bearer ${accessToken}` })
      }
    });
    
    console.log("🔗 유사 게시물 API 응답:", response.data);
    
    if (!response.data.isSuccess) {
      throw new Error(response.data.message || "유사 게시물 조회 실패");
    }
    
    // 응답 데이터를 Post 타입으로 변환
    const similarPosts = response.data.result.map(post => ({
      postId: post.postId,
      title: post.title,
      summary: post.summary,
      thumbnailUrl: post.thumnailUrl,
      imageUrls: post.thumnailUrl ? [post.thumnailUrl] : [],
      date: post.createdAt,
      views: post.viewCount,
      scraps: post.scrapCount,
      hashtags: post.hashtags,
      category: post.category,
      type: post.category?.includes("TIP") ? "tips" as const : "items" as const
    }));
    
    console.log("변환된 유사 게시물:", similarPosts);
    return similarPosts;
  } catch (error) {
    console.error("유사 게시물 API 오류", error);
    return [];
  }
};