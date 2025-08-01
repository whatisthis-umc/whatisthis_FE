import type { AdminPostRequest } from "../types/request/adminPost";
import { axiosInstance } from "./axiosInstance";
export const adminNewPost = async (data: AdminPostRequest) => {
    const token = localStorage.getItem("adminAccessToken"); 
    if (!token) {
      throw new Error("Access token not found");
    }
  
    return await axiosInstance.post("/admin/posts/", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };