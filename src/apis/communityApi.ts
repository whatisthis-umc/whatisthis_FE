import axios from "axios";

export interface CreatePostDto {
  category: "LIFE_TIP" | "ITEM_RECOMMEND" | "BUY_OR_NOT" | "QUESTION";
  title: string;
  content: string;
  imageUrls: string[];
}

export const createPost = async (data: CreatePostDto) => {
  const response = await axios.post("http://52.78.98.150:8080/posts", data);
  return response.data;
};
