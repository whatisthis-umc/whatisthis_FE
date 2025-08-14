import { axiosInstance } from "./axiosInstance";

export interface PopularKeywordResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: string[];
}


// 인기 검색어 목록 조회
export const getPopularKeywords = async (): Promise<string[]> => {
  try {
    const response = await axiosInstance.get<PopularKeywordResponse>("/posts/popular_keywords");
    
    if (!response.data.isSuccess) {
      throw new Error(response.data.message || "인기 검색어 조회 실패");
    }
    
    return response.data.result;
  } catch (error) {
    console.error("인기 검색어 API 오류:", error);
    // 기본값 반환
    return ["청소", "수납", "요리", "살림", "정리"];
  }
};