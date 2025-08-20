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
  profileimageUrl?: string;
  isAuthor?: boolean;
  isMine?: boolean;
}

type Envelope<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
};

// ===== 공통 가드: 302/HTML → 401로 통일 =====
function guardRedirectOrHtml(res: any) {
  const ct = String(res?.headers?.["content-type"] || "");
  if (res?.status === 302 || ct.includes("text/html") || res?.status === 401) {
    const err: any = new Error("로그인이 필요합니다.");
    err.response = { status: 401 };
    throw err;
  }
  if (res?.status === 403) {
    const err: any = new Error("권한이 없습니다.");
    err.response = { status: 403 };
    throw err;
  }
}

export async function createComment(
  postId: number,
  body: CreateCommentReq
): Promise<CommentRes> {
  const url = `/posts/${encodeURIComponent(postId)}/comments`;

  const payload = {
    content: body.content,
    parentCommentId:
      body.parentCommentId === null ? null : Number(body.parentCommentId),
  };

  const cfg: any = { validateStatus: () => true, __retry: true };
  const res = await axiosInstance.post(url, payload, cfg);
  guardRedirectOrHtml(res);

  return (res.data?.result ?? res.data?.data ?? res.data) as CommentRes;
}

// ====== 댓글 좋아요/해제, 수정, 삭제 ======
/** 댓글 좋아요 등록 */
export async function likeComment(
  postId: number,
  commentId: number
): Promise<{ liked: boolean; likeCount: number }> {
  const cfg: any = { validateStatus: () => true, __retry: true };
  const res = await axiosInstance.post(
    `/posts/${postId}/comments/${commentId}/likes`,
    undefined,
    cfg
  );
  guardRedirectOrHtml(res);
  if (res.status >= 400) {
    const msg = res.data?.message ?? "댓글 좋아요 실패";
    throw new Error(msg);
  }
  const data = (res.data?.result ?? res.data) as {
    liked?: boolean;
    likeCount?: number;
  };
  return {
    liked: typeof data?.liked === "boolean" ? data.liked : true, // 서버가 안주면 true로 추론
    likeCount: Number(data?.likeCount ?? 0),
  };
}

/** 댓글 좋아요 해제 */
export async function unlikeComment(
  postId: number,
  commentId: number
): Promise<{ liked: boolean; likeCount: number }> {
  const cfg: any = { validateStatus: () => true, __retry: true };
  const res = await axiosInstance.delete(
    `/posts/${postId}/comments/${commentId}/likes`,
    cfg
  );
  guardRedirectOrHtml(res);
  if (res.status >= 400) {
    const msg = res.data?.message ?? "댓글 좋아요 해제 실패";
    throw new Error(msg);
  }
  const data = (res.data?.result ?? res.data) as {
    liked?: boolean;
    likeCount?: number;
  };
  return {
    liked: typeof data?.liked === "boolean" ? data.liked : false, // 서버가 안주면 false로 추론
    likeCount: Number(data?.likeCount ?? 0),
  };
}

export async function updateComment(
  postId: number,
  commentId: number,
  body: { content: string }
): Promise<{ id: number; updatedAt: string }> {
  const cfg: any = { validateStatus: () => true, __retry: true };
  const res = await axiosInstance.patch(
    `/posts/${postId}/comments/${commentId}`,
    body,
    cfg
  );
  guardRedirectOrHtml(res);
  if (res.status >= 400) {
    const msg = res.data?.message ?? "댓글 수정 실패";
    throw new Error(msg);
  }
  return (res.data?.result ?? res.data) as { id: number; updatedAt: string };
}

export async function deleteCommentAPI(
  postId: number,
  commentId: number
): Promise<{ id: number }> {
  const cfg: any = { validateStatus: () => true, __retry: true };
  const res = await axiosInstance.delete(
    `/posts/${postId}/comments/${commentId}`,
    cfg
  );
  guardRedirectOrHtml(res);
  if (res.status >= 400) {
    const msg = res.data?.message ?? "댓글 삭제 실패";
    throw new Error(msg);
  }
  return (res.data?.result ?? res.data) as { id: number };
}

export async function reportComment(
  postId: number,
  commentId: number,
  payload?: { content?: string; description?: string }
): Promise<{ id?: number }> {
  const cfg: any = { validateStatus: () => true, __retry: true };
  const res = await axiosInstance.post(
    `/posts/${postId}/comments/${commentId}/reports`,
    payload ?? {},
    cfg
  );
  guardRedirectOrHtml(res);
  if (res.status >= 400) {
    const msg = res.data?.message ?? "댓글 신고 실패";
    throw new Error(msg);
  }
  return (res.data?.result ?? res.data) as { id?: number }
}