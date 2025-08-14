// src/api/comments.ts
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
  const url = `/posts/${encodeURIComponent(postId)}/comments`;

  const payload = {
    content: body.content,
    parentCommentId:
      body.parentCommentId === null ? null : Number(body.parentCommentId),
  };

  // ✅ TS 오류 회피: 옵션을 변수로 만들고 any 캐스팅 후 __retry 부여
  const cfg: any = {
    validateStatus: () => true, // 302/401/403 등도 직접 판단
  };
  cfg.__retry = true; // 응답 인터셉터의 refresh 루프 우회용 플래그

  const res = await axiosInstance.post(url, payload, cfg);

  // 로그인 리다이렉트(302)나 HTML 응답 감지 → 401로 통일
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

  // 서버 래핑 형태 모두 대응
  return (res.data?.result ?? res.data?.data ?? res.data) as CommentRes;
}
