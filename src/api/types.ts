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

// 공통 Raw Post 타입
export interface RawPost {
  postId: number;
  thumnailUrl: string | null;     
  title: string;
  summary: string;
  category: string;
  subCategory?: string;
  hashtags: Array<{
    id: number;
    content: string;
    updatedAt: string;
    post: BasePost;
  }>;
}

// 꿀팁 전용 Raw 타입 
export interface RawTipPost extends RawPost {
}

// 꿀템 전용 Raw 타입
export interface RawItemPost extends RawPost {

}

export interface SectionDTO {
  sectionName: string;
  posts: RawPost[];
}

export interface MainPageResponseDTO {
  categories: string[];
  sections: SectionDTO[];
}

// 공통 Post 타입 
export interface Post {
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
  type: "tips" | "items";
}

// 꿀팁 전용 타입
export interface TipPost extends Post {
  type: "tips";
}

// 꿀템 전용 타입
export interface ItemPost extends Post {
  type: "items";
}

// 상세 페이지용 타입
export interface PostDetail {
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
  type: "tips" | "items";
}

// 꿀팁 상세 타입 
export interface TipPostDetail extends PostDetail {
  type: "tips";
}

// 꿀템 상세 타입
export interface ItemPostDetail extends PostDetail {
  type: "items";
}

// 정렬 관련 타입들
export type SortUIType = "인기순" | "최신순";
export type SortAPIType = "BEST" | "LATEST";

// 카테고리 관련 타입들
export type PostType = "tips" | "items";
export type CategoryType = "LIFE_TIP" | "LIFE_ITEM" | "COOK_TIP" | "CLEAN_TIP" | "BATHROOM_TIP" | "CLOTH_TIP" | "STORAGE_TIP" | "SELF_LIFE_ITEM" | "KITCHEN_ITEM" | "CLEAN_ITEM" | "HOUSEHOLD_ITEM" | "BRAND_ITEM"; 