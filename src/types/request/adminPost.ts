export interface AdminPostRequest {
    title: string;
  content: string;
  category: string;
  subCategory: string;
  images: File[];
  hashtags: string[];
};

export interface AdminPostEditRequest {
  title: string;
  content: string;
  category: string;
  subCategory: string;
  imageUrls: string[]; // 수정 시에는 이미지 URL 배열
  hashtags: string[];
};