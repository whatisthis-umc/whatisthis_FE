export type CommunitySortType = "LATEST" | "BEST";

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

// 게시글 작성 요청(서버 JSON 본문 기준)
export interface CreatePostDto {
  category: string;     // "tips" | "items" | ...
  title: string;
  content: string;
  hashtags: string[];
  imageUrls: string[];  // 업로드 후 받은 S3 URL들
}

// 상세 응답 뷰모델
export interface CommunityPostDetailVM {
  id: number;
  title: string;
  content: string;
  category: string;          // 서버 카테고리 문자열 (예: LIFE_TIP)
  hashtags: string[];        // hashtagListDto.hashtagList[].content
  imageUrls: string[];       // imageListDto.imageList[].url
  nickname: string;
  isBestUser: boolean;
  profileImageUrl?: string;
  views: number;
  likes: number;
  comments: number;
  createdAt: string;         // 서버 포맷 그대로 표기(필요시 포매팅)
  commentPage: {
    list: Array<{
      id: number;
      content: string;
      likeCount: number;
      nickname: string;
      profileImageUrl?: string;
      createdAt: string;
    }>;
    listSize: number;
    totalPage: number;
    totalElements: number;
    isFirst: boolean;
    isLast: boolean;
  };
}