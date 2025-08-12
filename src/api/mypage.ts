import { axiosInstance } from "../api/axiosInstance";

/** 계정 조회/수정 */
export type MyAccount = {
  id: number;
  nickname: string;
  email: string;
  profileImage: string | null;
};

export async function getMyAccount(): Promise<MyAccount> {
  const res = await axiosInstance.get("/my-page/account");
  return (res.data?.result ?? res.data) as MyAccount;
}

/**
 * Swagger: multipart/form-data
 * - request: JSON(object)  → id 필수, 미수정 필드는 null
 * - image: file (선택)
 */
export async function patchMyAccount(payload: {
  id: number;
  nickname: string | null;
  email: string | null;
  image?: File | null;
}): Promise<MyAccount> {
  const form = new FormData();

  const request = {
    id: payload.id,
    nickname: payload.nickname,
    email: payload.email,
  };

  form.append("request", new Blob([JSON.stringify(request)], { type: "application/json" }));
  if (payload.image) form.append("image", payload.image, payload.image.name);

  // Content-Type 수동 지정 금지
  const res = await axiosInstance.patch("/my-page/account", form);
  return (res.data?.result ?? res.data) as MyAccount;
}

/** 작성내역 */
export type MyPostItem = {
  postId: number;
  category: "LIFE_TIP" | "ITEM_RECOMMEND" | "BUY_OR_NOT" | string;
  title: string;
  content: string;
  nickname: string;
  createdAt: string; // ISO
  viewCount: number;
  likeCount: number;
  commentCount: number;
  postImageUrls?: string[];
};

export type MyPostsResponse = {
  nickname: string;
  profileImageUrl: string | null;
  email: string;
  posts: MyPostItem[];
};

export async function getMyPosts(params: { page: number; size: number }) {
  const res = await axiosInstance.get("/my-page/posts", { params });
  return (res.data?.result ?? res.data) as MyPostsResponse;
}

/** ▶ 추가: 나의 작성내역 삭제 */
export async function deleteMyPost(postId: number) {
  const res = await axiosInstance.delete(`/my-page/posts/${postId}`);
  return res.data; // { isSuccess, code, message, result: {} } 가정
}

/** 문의내역 목록 */
export type InquiryStatus = "PROCESSED" | "WAITING" | string;

export type MyInquiryItem = {
  inquiryId: number;
  title: string;
  status: InquiryStatus;
  createdAt: string; // ISO
};

export type MyInquiriesResponse = {
  nickname: string;
  profileImageUrl: string | null;
  email: string;
  inquiries: MyInquiryItem[];
};

export async function getMyInquiries(params: { page: number; size: number }) {
  const res = await axiosInstance.get("/my-page/inquiries", { params });
  return (res.data?.result ?? res.data) as MyInquiriesResponse;
}

/** 문의 상세 */
export type InquiryDetail = {
  inquiryId: number;
  title: string;
  inquiryContent: string;
  answerContent: string | null;
  createdAt: string;
};

export async function getInquiryDetail(inquiryId: number) {
  const res = await axiosInstance.get(`/my-page/inquiries/${inquiryId}/detail`);
  return (res.data?.result ?? res.data) as InquiryDetail;
}

/** ▶ 추가: 나의 문의내역 삭제 */
export async function deleteMyInquiry(inquiryId: number) {
  const res = await axiosInstance.delete(`/my-page/inquiries/${inquiryId}`);
  return res.data;
}