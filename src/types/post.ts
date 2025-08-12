export interface ItemCardProps {
  id: number;
  category: string; //청소템, 브랜드 꿀템같은 카테고리
  hashtag: string | string[];
  imageUrl: string | string[];
  title: string;
  description: string;
  views: number;
  scraps: number;
  date: Date;
  type: "tips" | "items";
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  authorNickname: string;
  category: '꿀템추천' | '생활꿀팁' | '커뮤니티';
  createdAt: string;
  views: number;
  likes: number;
  comments: number;
  tags?: string[];
  features?: {
    title: string;
    description: string;
  }[];
  targetAudience?: string;
}

export type PostCategory =
  | "tips"
  | "items"
  | "should-i-buy"
  | "curious"
  | "popular";

export interface PostRequest {
  category: PostCategory;
  title: string;
  content: string;
  hashtags: string[];
  imageUrls?: string[];
}

export const dummyPosts: Post[] = [];