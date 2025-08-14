import { axiosInstance } from "./axiosInstance";

export interface Qna {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

export interface QnaListResult {
  qnas: Qna[];
  pageNumber: number;   // 응답은 0-base일 수 있음(스웨거 예시 기준)
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

/** 목록: GET /admin/qnas?page(1-base)&size */
export async function getQnas(params: { page?: number; size?: number } = {}) {
  const { page = 1, size = 5 } = params; // 스웨거 기본값 그대로
  const res = await axiosInstance.get<{
    isSuccess: boolean;
    result: QnaListResult;
  }>("/admin/qnas", { params: { page, size } });

  return res.data.result; // { qnas, pageNumber, ... }
}

//상세
export async function getQna(id: number) {
  const res = await axiosInstance.get<{ isSuccess: true; result: Qna }>(
    `/admin/qnas/${id}`
  );
  return res.data.result; // { id, title, content, createdAt }
}

//삭제
export async function deleteQna(id: number): Promise<void> {
  await axiosInstance.delete(`/admin/qnas/${id}`);
}

//수정 
export async function updateQna(id: number, body: { title: string; content: string }) {
  // swagger 응답은 result:null 이지만 성공 시 200 반환
  await axiosInstance.patch(`/admin/qnas/${id}`, body);
}

/** 생성(작성) */
export async function createQna(body: { title: string; content: string }): Promise<void> {
  const res = await axiosInstance.post(`/admin/qnas`, body);
  // 응답 래퍼가 isSuccess 형태면 아래 체크를 두고, 아니라면 제거해도 됨
  if (res?.data && typeof res.data === "object" && "isSuccess" in res.data) {
    if (!res.data.isSuccess) {
      throw new Error(res.data?.message ?? "Q&A 작성 실패");
    }
  }
}