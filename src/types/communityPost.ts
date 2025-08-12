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