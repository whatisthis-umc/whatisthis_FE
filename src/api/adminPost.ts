// src/api/adminPost.ts
import { axiosInstance } from "./axiosInstance";

export interface AdminPostListParams {
  category: string;
  page?: number;
  size?: number;
}

export async function getAdminPosts(params: AdminPostListParams) {
  const { category, page = 0, size = 20 } = params;
  const res = await axiosInstance.get("/admin/posts/", {
    params: { category, page, size }
  });
  return res.data;
}