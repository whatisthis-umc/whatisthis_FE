// src/api/adminNotice.ts
import { axiosInstance } from "./axiosInstance";

export interface Notice {
  id: number;
  title: string;
  content: string;
  createdAt: string; // ISO
}

export interface NoticeListResult {
  notices: Notice[];
  pageNumber: number;   // 0-base
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

/** 목록 GET /admin/notices?page&size */
export async function getNotices(params: { page?: number; size?: number } = {}) {
  const { page = 0, size = 5 } = params;
  const res = await axiosInstance.get<{ isSuccess: true; result: NoticeListResult }>(
    "/admin/notices",
    { params: { page, size } }
  );
  return res.data.result; // NoticeListResult
}

/** 상세 GET /admin/notices/{id} */
export async function getNotice(id: number) {
  const res = await axiosInstance.get<{ isSuccess: true; result: Notice }>(
    `/admin/notices/${id}`
  );
  return res.data.result; // Notice
}

/** 삭제: DELETE /admin/notices/{noticeId} */
export async function deleteNotice(id: number) {
  const res = await axiosInstance.delete<{ isSuccess: true; code: string; message: string; result: {} }>(
    `/admin/notices/${id}`
  );
  return res.data; // { isSuccess: true, ... }
}



/** 작성: POST /admin/notices */
export type CreateNoticeDto = { title: string; content: string };

export async function createNotice(body: CreateNoticeDto) {
  // 앞뒤 공백 제거(백엔드 @NotBlank 대비)
  const payload = {
    title: body.title?.trim(),
    content: body.content?.trim(),
  };

  const res = await axiosInstance.post<{
    isSuccess: boolean; code: string; message: string; result: any;
  }>("/admin/notices", payload);

  return res.data; // { isSuccess, code, message, result }
}

// 수정
export type UpdateNoticeDto = { title?: string; content?: string };

export async function updateNotice(id: number, body: UpdateNoticeDto) {
  const payload = {
    title: body.title?.trim(),
    content: body.content?.trim(),
  };
  const res = await axiosInstance.patch<{
    isSuccess: boolean; code: string; message: string; result: any;
  }>(`/admin/notices/${id}`, payload);
  return res.data; // { isSuccess, code, message, result }
}