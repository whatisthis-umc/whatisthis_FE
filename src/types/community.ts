// 커뮤니티 게시물 정렬 타입 정의
export type CommunitySortType = "LATEST" | "BEST";

// 커뮤니티 게시물 타입 (예시, 필요 시 수정)
export interface CommunityPost {
  id: number;
  title: string;
  content: string;
  imageUrls: string[];
  category: string;
  createdAt: string;
  isBest: boolean;
  hashtags: string[];
  nickname: string;
  views: number;
  likes: number;
  comments: number;
}

// 게시글 작성 요청 타입
export interface CreatePostDto {
  category: string
  title: string;
  content: string;
  imageUrls: string[];
}