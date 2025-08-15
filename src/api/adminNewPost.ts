import type { AdminPostRequest } from "../types/request/adminPost";
import { axiosInstance } from "./axiosInstance";

export const adminNewPost = async (data: AdminPostRequest) => {
  console.log("=== adminNewPost 시작 ===");
  console.log("원본 데이터:", data);
  console.log("이미지 개수:", data.images.length);
  console.log("이미지 파일들:", data.images.map(img => ({ name: img.name, size: img.size, type: img.type })));

  try {
    const formData = new FormData();
    
    // 요청 데이터 객체 생성
    const requestData = {
      title: data.title.trim(),
      content: data.content.trim(),
      category: data.category,
      subCategory: data.subCategory,
      hashtags: data.hashtags.filter(tag => tag && tag.trim()),
    };
    
    console.log("요청 데이터 객체:", requestData);
    
    // JSON Blob 생성 및 추가
    const jsonBlob = new Blob([JSON.stringify(requestData)], {
      type: 'application/json'
    });
    formData.append('request', jsonBlob);
    console.log("JSON Blob 크기:", jsonBlob.size);

    // 이미지 파일들 추가
    for (let i = 0; i < data.images.length; i++) {
      const imageFile = data.images[i];
      console.log(`이미지 ${i + 1}:`, {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type
      });
      formData.append('images', imageFile, imageFile.name);
    }

    // FormData 내용 확인
    console.log("=== FormData 내용 ===");
    for (let [key, value] of formData.entries()) {
      if (value && typeof value === 'object') {
        const obj = value as any;
        if (obj.name && obj.size && obj.type) {
          console.log(`${key}: File(${obj.name}, ${obj.size} bytes, ${obj.type})`);
        } else if (obj.size && obj.type) {
          console.log(`${key}: Blob(${obj.size} bytes, ${obj.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    console.log("=== API 요청 시도 ===");
    console.log("요청 URL:", "/admin/posts/create");
    console.log("요청 메서드:", "POST");
    console.log("FormData 항목 수:", Array.from(formData.entries()).length);

    const response = await axiosInstance.post("/admin/posts/create", formData, {

      headers: {
        "Content-Type": undefined, // Let Axios handle multipart boundary
      },
    });

    console.log("=== API 요청 성공 ===");
    console.log("응답 상태:", response.status);
    console.log("응답 데이터:", response.data);
    
    return response;
  } catch (error: any) {
    console.error("=== adminNewPost 오류 발생 ===");
    console.error("에러 타입:", error.constructor.name);
    console.error("에러 메시지:", error.message);
    
    if (error.response) {
      console.error("응답 상태:", error.response.status);
      console.error("응답 상태 텍스트:", error.response.statusText);
      console.error("응답 데이터:", error.response.data);
      console.error("응답 헤더:", error.response.headers);
    }
    
    if (error.request) {
      console.error("요청 정보:", {
        url: error.request.url,
        method: error.request.method,
        headers: error.request.headers
      });
    }
    
    if (error.config) {
      console.error("요청 설정:", {
        url: error.config.url,
        method: error.config.method,
        baseURL: error.config.baseURL,
        headers: error.config.headers
      });
    }

    // 500 에러 특별 처리
    if (error.response?.status === 500) {
      console.error("=== 500 Internal Server Error 분석 ===");
      console.error("서버 내부 오류입니다. 백엔드 개발자에게 다음 정보를 전달하세요:");
      console.error("1. 요청 URL:", "/admin/posts/create");
      console.error("2. 요청 메서드:", "POST");
      console.error("3. 요청 데이터:", {
        title: data.title,
        content: data.content,
        category: data.category,
        subCategory: data.subCategory,
        hashtags: data.hashtags,
        imageCount: data.images.length
      });
      console.error("4. 이미지 파일 정보:", data.images.map(img => ({
        name: img.name,
        size: img.size,
        type: img.type
      })));
    }

    throw error;
  }
}; 
