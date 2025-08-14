import { axiosInstance } from "./axiosInstance";

export interface CreateCommentReq {
  content: string;
  /** 최상위: null, 대댓글: 부모 댓글 id */
  parentCommentId: number | null;
}

export interface CommentRes {
  id: number;
  content: string;
  nickname: string;
  likeCount: number;
  parentCommentId: number | null;
  createdAt: string;
}

/** 댓글/대댓글 작성 (최상위: null, 대댓글: 숫자) */
export async function createComment(
  postId: number,
  body: CreateCommentReq
): Promise<CommentRes> {
  const res = await axiosInstance.post(
    `/posts/${encodeURIComponent(postId)}/comments`,
    {
      content: body.content,
      parentCommentId:
        body.parentCommentId === null ? null : Number(body.parentCommentId),
    },
    { validateStatus: () => true as any, __retry: true as any }
  );

  const ct = String(res.headers?.["content-type"] || "");
  if (res.status === 302 || ct.includes("text/html") || res.status === 401) {
    const err: any = new Error("로그인이 필요합니다.");
    err.response = { status: 401 };
    throw err;
  }
  if (res.status === 403) {
    const err: any = new Error("권한이 없습니다.");
    err.response = { status: 403 };
    throw err;
  }

  return (res.data?.result ?? res.data?.data ?? res.data) as CommentRes;
}