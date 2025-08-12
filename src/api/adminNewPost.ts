import type { AdminPostRequest } from "../types/request/adminPost";
import { axiosInstance } from "./axiosInstance";
export const adminNewPost = async (data: AdminPostRequest) => {
    return await axiosInstance.post("/admin/posts/", data);
  };