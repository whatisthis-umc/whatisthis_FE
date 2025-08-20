import { axiosInstance } from "../api/axiosInstance";
import axios from "axios";

export type LikeResult = { likeCount: number };

function mapLikeResult(data: any): LikeResult {
  const count = data?.result?.likeCount;
  return { likeCount: typeof count === "number" ? count : 0 };
}

/** 좋아요 등록: POST /posts/{post-id}/likes */
export async function likePost(postId: number): Promise<LikeResult> {
  try {
    const res = await axiosInstance.post(`/posts/${postId}/likes`);
    return mapLikeResult(res.data);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        (err.response?.data as any)?.message || "좋아요에 실패했습니다."
      );
    }
    throw err;
  }
}

/** 좋아요 해제: DELETE /posts/{post-id}/likes */
export async function unlikePost(postId: number): Promise<LikeResult> {
  try {
    const res = await axiosInstance.delete(`/posts/${postId}/likes`);
    return mapLikeResult(res.data);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        (err.response?.data as any)?.message || "좋아요 해제에 실패했습니다."
      );
    }
    throw err;
  }
}

// 게시글 수정/삭제 API (필요 최소한)
export async function deletePost(postId: number): Promise<void> {
  await axiosInstance.delete(`/posts/${postId}`);
}

export async function editPost(postId: number, payload: { title?: string; content?: string }): Promise<void> {
  await axiosInstance.patch(`/posts/${postId}` , payload);
}