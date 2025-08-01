export interface CreatePostDto {
  category: "LIFE_TIP" | "ITEM_RECOMMEND" | "BUY_OR_NOT" | "QUESTION";
  title: string;
  content: string;
  imageUrls: string[];
}
