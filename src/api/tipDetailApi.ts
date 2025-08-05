import { axiosInstance } from "./axiosInstance";
import type { CustomResponse } from "./tipApi";

export interface TipPostDetail {
  postId: number;
  category: string;
  subCategories: string;
  title: string;
  content: string;
  hashtags: string[];
  images: string[];
  likeCount: number;
  scrapCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}
// 꿀팁 상세조회
export const tipDetailService = {
  getTipDetail: (postId: number): Promise<TipPostDetail> =>
    axiosInstance
      .get<CustomResponse<TipPostDetail>>(`/posts/${postId}`)
      .then((res) => {
        console.log("Tip detail API response:", res.data);
        
        if (!res.data.isSuccess) {
          return Promise.reject(res.data.message);
        }
        
        return res.data.result;
      }),
}; 