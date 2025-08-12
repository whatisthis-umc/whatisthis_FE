import { axiosInstance } from "../api/axiosInstance";

export interface CreateCommentReq {
  content: string;
  parentCommentId?: number; // 최상위면 undefined
}

export interface CommentRes {
  id: number;
  content: string;
  nickname: string;
  likeCount: number;
  parentCommentId: number;
  createdAt: string;
}

// 최상위: POST /posts/{postId}/comments
// 대댓글: POST /posts/{postId}/comments/{parentId}
export async function createComment(
  postId: number,
  body: CreateCommentReq
): Promise<CommentRes> {
  const parentId = body.parentCommentId ?? 0;

  const path =
    parentId > 0
      ? `/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(parentId)}`
      : `/posts/${encodeURIComponent(postId)}/comments`;

  // 일부 서버는 대댓글에도 body에 parentCommentId를 요구하기도 해서 조건부로 포함
  const payload =
    parentId > 0
      ? { content: body.content, parentCommentId: parentId }
      : { content: body.content };

  const res = await axiosInstance.post(path, payload);
  return res.data.result as CommentRes;
}
