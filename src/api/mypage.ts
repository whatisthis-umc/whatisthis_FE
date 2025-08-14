import { axiosInstance } from "../api/axiosInstance";
import { isAxios404 } from "../utils/isAxios404";

/** 계정 조회/수정 */
export type MyAccount = {
  id: number;
  nickname: string;
  email: string;
  profileImage: string | null;
};

export async function getMyAccount(): Promise<MyAccount> {
  const res = await axiosInstance.get("/my-page/account");
  const data = res.data?.result ?? res.data;
  return {
    id: data?.id,
    nickname: data?.nickname ?? "",
    email: data?.email ?? "",
    profileImage: data?.profileImage ?? null,
  };
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

  const res = await axiosInstance.patch("/my-page/account", form);
  const data = res.data?.result ?? res.data;
  return {
    id: data?.id,
    nickname: data?.nickname ?? "",
    email: data?.email ?? "",
    profileImage: data?.profileImage ?? null,
  };
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
  totalElements?: number;
  totalPages?: number;
};

export async function getMyPosts(params: { page: number; size: number }): Promise<MyPostsResponse> {
  try {
    const res = await axiosInstance.get("/my-page/posts", { params });
    const r = res.data?.result ?? res.data;
    return {
      nickname: r?.nickname ?? "",
      profileImageUrl: r?.profileImageUrl ?? null,
      email: r?.email ?? "",
      posts: r?.posts ?? r?.content ?? r?.list ?? [],
      totalElements: r?.totalElements,
      totalPages: r?.totalPages,
    };
  } catch (e) {
    if (isAxios404(e)) {
      return { nickname: "", profileImageUrl: null, email: "", posts: [] };
    }
    throw e;
  }
}

/** ▶ 작성내역 삭제 */
export async function deleteMyPost(postId: number) {
  const res = await axiosInstance.delete(`/my-page/posts/${postId}`);
  return res.data;
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
  totalElements?: number;
  totalPages?: number;
};

export async function getMyInquiries(params: { page: number; size: number }): Promise<MyInquiriesResponse> {
  try {
    const res = await axiosInstance.get("/my-page/inquiries", { params });
    const r = res.data?.result ?? res.data;
    return {
      nickname: r?.nickname ?? "",
      profileImageUrl: r?.profileImageUrl ?? null,
      email: r?.email ?? "",
      inquiries: r?.inquiries ?? r?.content ?? r?.list ?? [],
      totalElements: r?.totalElements,
      totalPages: r?.totalPages,
    };
  } catch (e) {
    if (isAxios404(e)) {
      return { nickname: "", profileImageUrl: null, email: "", inquiries: [] };
    }
    throw e;
  }
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

/** ▶ 문의내역 삭제 */
export async function deleteMyInquiry(inquiryId: number) {
  const res = await axiosInstance.delete(`/my-page/inquiries/${inquiryId}`);
  return res.data;
}