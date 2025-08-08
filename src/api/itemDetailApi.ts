import { axiosInstance } from "./axiosInstance";
import type { CustomResponse, ItemPostDetail} from "./types";

// 꿀템 상세조회
export const itemDetailService = {
  getTipDetail: (postId: number): Promise<ItemPostDetail> => {
    const accessToken = localStorage.getItem("accessToken");
    
    return axiosInstance
      .get<CustomResponse<ItemPostDetail>>(`/posts/${postId}`, {
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` })
        }
      })
      .then((res) => {
        console.log("Item detail API response:", res.data);
        
        if (!res.data.isSuccess) {
          return Promise.reject(res.data.message);
        }
        
        return res.data.result;
      });
  },
}; 