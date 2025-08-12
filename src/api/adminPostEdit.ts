import type { AdminPostEditRequest } from "../types/request/adminPost";
import { axiosInstance } from "./axiosInstance";

export interface AdminPostEditResponse {
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
    updatedAt: string;
  };
}

export const adminPostEdit = async (postId: number, data: AdminPostEditRequest) => {
  const token = localStorage.getItem("adminAccessToken");
  
  if (!token) {
    throw new Error("Access token not found");
  }

  console.log("adminPostEdit 요청:", { postId, data, token });
  console.log("현재 토큰:", token);
  console.log("토큰 길이:", token?.length);

  try {
    // JSON 요청으로 변경 (이미지는 URL로 전송)
    const requestData = {
      title: data.title.trim(),
      content: data.content.trim(),
      category: data.category,
      subCategory: data.subCategory,
      imageUrls: data.imageUrls, // 이미지 URL 배열
      hashtags: data.hashtags.filter(tag => tag && tag.trim()),
    };

    console.log("수정 요청 데이터:", requestData);

    const response = await axiosInstance.patch(`/admin/posts/${postId}`, requestData, {
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log("adminPostEdit 성공 응답:", response.data);
    return response.data as AdminPostEditResponse;
  } catch (error: any) {
    console.error("adminPostEdit 오류:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      }
    });

    // 403 오류 시 토큰 재확인
    if (error.response?.status === 403) {
      console.error("403 Forbidden - 토큰 재확인 필요");
      console.log("현재 저장된 토큰:", localStorage.getItem("adminAccessToken"));
      
      // 토큰 만료 확인
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        console.log("토큰 만료 시간:", new Date(tokenPayload.exp * 1000));
        console.log("현재 시간:", new Date(currentTime * 1000));
        console.log("토큰 만료됨:", currentTime > tokenPayload.exp);
        console.log("토큰 페이로드:", tokenPayload);
        
        // 토큰이 만료되었거나 권한이 없으면 로그인 페이지로 이동
        if (currentTime > tokenPayload.exp) {
          alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
          localStorage.removeItem("adminAccessToken");
          window.location.href = "/admin/login";
          return;
        }
      } catch (e) {
        console.error("토큰 파싱 오류:", e);
        alert("토큰에 문제가 있습니다. 다시 로그인해주세요.");
        localStorage.removeItem("adminAccessToken");
        window.location.href = "/admin/login";
        return;
      }
      
      // 권한 문제인 경우
      alert("해당 게시물을 수정할 권한이 없습니다.");
    }

    throw error;
  }
}; 