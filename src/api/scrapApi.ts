import { axiosInstance } from "./axiosInstance";
import type { Post } from "./types";

export interface ScrapItem {
  id: number; 
  postId: number; 
  title: string;
  content: string;
  thumbnailUrl: string;
  viewCount: number;
  category: string;
  subCategory: string;
}

export interface ScrapListResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    scraps: ScrapItem[];
    totalPages: number;
    totalElements: number;
  };
}

// 스크랩 목록 조회
export const getScrapList = async (
  page: number = 0, // 서버와 동일하게 0부터 시작
  size: number = 10
): Promise<{ scraps: ScrapItem[]; totalPages: number; totalElements: number }> => {
  const accessToken = localStorage.getItem("accessToken");
  
  if (!accessToken) {
    throw new Error("로그인이 필요합니다.");
  }

  console.log(`=== 스크랩 목록 조회 시도 ===`);
  console.log(`요청 페이지: ${page}, 크기: ${size}`);
  console.log(`토큰: ${accessToken.substring(0, 50)}...`);

  try {
    const response = await axiosInstance.get("/scraps", {
      params: {
        page: page,
        size,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'accept': '*/*'  // 스웨거와 동일한 헤더
      },
    });

    console.log("=== 스크랩 목록 API 응답 ===");
    console.log("스크랩 목록 API 응답:", response.data);
    console.log("스크랩 목록 result:", response.data.result);
    console.log("스크랩 목록 result 타입:", typeof response.data.result);
    console.log("스크랩 목록 result 길이:", Array.isArray(response.data.result) ? response.data.result.length : '배열 아님');
    
    // 스크랩 배열이 있는 경우 첫 번째 아이템 확인
    if (response.data.result?.scraps && response.data.result.scraps.length > 0) {
      console.log("첫 번째 스크랩 아이템:", response.data.result.scraps[0]);
      console.log("첫 번째 스크랩 아이템의 모든 필드:", Object.keys(response.data.result.scraps[0]));
    } else {
      console.log("⚠️ 스크랩 배열이 비어있습니다!");
      console.log("scraps 배열:", response.data.result?.scraps);
      console.log("scraps 길이:", response.data.result?.scraps?.length);
    }

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || "스크랩 목록 조회에 실패했습니다.");
    }

    return {
      scraps: response.data.result?.scraps || [],
      totalPages: response.data.result?.totalPages || 1,
      totalElements: response.data.result?.totalElements || 0,
    };
  } catch (error) {
    console.error("스크랩 목록 조회 실패:", error);
    throw error;
  }
};

// 스크랩 해제
export const deleteScrap = async (scrapId: number): Promise<void> => {
  const accessToken = localStorage.getItem("accessToken");
  
  if (!accessToken) {
    throw new Error("로그인이 필요합니다.");
  }

  try {
    const response = await axiosInstance.delete(`/scraps/${scrapId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("스크랩 해제 API 응답:", response.data);

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || "스크랩 해제에 실패했습니다.");
    }
  } catch (error) {
    console.error("스크랩 해제 실패:", error);
    throw error;
  }
}; 