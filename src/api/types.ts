// 공통 응답 타입
export interface CustomResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

// 공통 DTO 타입들
export interface HashtagDTO {
  id: number;
  content: string;
  updatedAt: string;
}

export interface PostImageDTO {
  id: number;
  imageUrl: string;
}

// 게시물 관련 타입들
export interface BasePost {
  id: number;
  title: string;
  content: string;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  category: string;
  member: any;
  admin: any;
  postImageList: PostImageDTO[];
}

export interface RawTipPost {
  postId: number;
  thumnailUrl: string;     
  title: string;
  summary: string;
  hashtags: Array<{
    id: number;
    content: string;
    updatedAt: string;
    post: BasePost;
  }>;
}

export interface SectionDTO {
  sectionName: string;
  posts: RawTipPost[];
}

export interface MainPageResponseDTO {
  categories: string[];
  sections: SectionDTO[];
}

// 꿀팁 관련 타입들
export interface TipPost {
  postId: number;
  title: string;
  summary: string;
  thumbnailUrl: string;
  imageUrls: string[];
  date: string;
  views: number;
  scraps: number;
  hashtags: string[];
  category: string;
  subCategories?: string[];
  type?: string;
}

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