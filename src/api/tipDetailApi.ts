import { axiosInstance } from "./axiosInstance";
import type { CustomResponse, TipPostDetail } from "./types";
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