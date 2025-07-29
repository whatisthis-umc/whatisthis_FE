import axios from "axios";
import type { CreatePostDto } from "./dto/post.dto";

export const createPost = async (data: CreatePostDto) => {
  const response = await axios.post("http://52.78.98.150:8080/posts", data);
  return response.data;
};
