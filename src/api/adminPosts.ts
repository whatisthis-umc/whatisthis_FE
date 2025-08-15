import { axiosInstance } from "./axiosInstance";

export interface AdminPostListParams {
  category: string;
  page?: number;
  size?: number;
}

export interface AdminPostListResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    posts: any[];
  };
}

/** 관리자 게시물 목록 조회 */
export async function getAdminPosts(params: AdminPostListParams): Promise<AdminPostListResponse> {
  const { category, page = 0, size = 20 } = params;
  console.log("새 엔드포인트 /admin/posts/list 사용");
  const res = await axiosInstance.get<AdminPostListResponse>(
    "/admin/posts/list",
    { params: { category, page, size } }
  );
  return res.data;
}