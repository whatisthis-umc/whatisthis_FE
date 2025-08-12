import { axiosInstance } from "./axiosInstance";

export interface AdminPostDetailResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    postId: number;
    title: string;
    content: string;
    category: string;
    subCategory: string;
    imageUrls: string[];
    hashtags: string[];
    createdAt: string;
    updatedAt?: string;
  };
}

export const adminPostDetail = async (postId: number) => {
  const token = localStorage.getItem("adminAccessToken");
  
  if (!token) {
    throw new Error("Access token not found");
  }

  console.log("adminPostDetail 요청:", { postId, token });

  try {
    const response = await axiosInstance.get(`/admin/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log("adminPostDetail 성공 응답:", response.data);
    return response.data as AdminPostDetailResponse;
  } catch (error: any) {
    console.error("adminPostDetail 오류:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });

    throw error;
  }
}; 