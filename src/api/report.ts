import { axiosInstance } from "../api/axiosInstance";
import axios from "axios";

export type ReportPayload = {
  content: string;       // 예: "ABUSIVE_LANGUAGE"
  description?: string;  // 선택
};

export type ReportPostResponse = {
  reportId: number;
  postId: number;
  reportedAt: string; // ISO
};

export type ReportCommentResponse = {
  reportId: number;
  commentId: number;
  reportedAt: string; // ISO
};

// 에러를 풍부하게 해서 상위에서 status/code로 분기 가능
function toRichError(err: unknown, fallbackMsg: string) {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data: any = err.response?.data;
    const code = data?.code;
    const message = data?.message ?? fallbackMsg;
    const e = new Error(message) as Error & { status?: number; code?: string };
    e.status = status;
    e.code = code;
    return e;
  }
  return err instanceof Error ? err : new Error(fallbackMsg);
}

export async function reportPost(
  postId: number,
  payload: ReportPayload
): Promise<ReportPostResponse> {
  try {
    const res = await axiosInstance.post(`/posts/${postId}/reports`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    const r = res.data?.result ?? {};
    return {
      reportId: Number(r.reportId ?? 0),
      postId: Number(r.postId ?? postId),
      reportedAt: String(r.reportedAt ?? new Date().toISOString()),
    };
  } catch (err: any) {
    throw toRichError(err, "서버 내부 오류가 발생했습니다");
  }
}

export async function reportComment(
  postId: number,
  commentId: number,
  payload: ReportPayload
): Promise<ReportCommentResponse> {
  try {
    const res = await axiosInstance.post(
      `/posts/${postId}/comments/${commentId}/reports`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
    const r = res.data?.result ?? {};
    return {
      reportId: Number(r.reportId ?? 0),
      commentId: Number(r.commentId ?? commentId),
      reportedAt: String(r.reportedAt ?? new Date().toISOString()),
    };
  } catch (err) {
    throw toRichError(err, "서버 내부 오류가 발생했습니다");
  }
}