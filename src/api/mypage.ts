import { axiosInstance } from "../api/axiosInstance";

/** ========= 계정 조회/수정 ========= */
export type MyAccount = {
  id: number;
  nickname: string;
  email: string;
  profileImage: string | null;
};

// 내부 유틸: 다양한 키 방어적으로 매핑
const pickProfileImage = (o: any) =>
  (o?.profileImageUrl ?? o?.profileImage ?? null) as string | null;

export async function getMyAccount(): Promise<MyAccount> {
  // 1) 전용 엔드포인트 시도
  const res = await axiosInstance.get("/my-page/account");
  if (res.status !== 404) {
    const data = res.data?.result ?? res.data ?? {};
    return {
      id: Number(data?.id ?? 0),
      nickname: String(data?.nickname ?? ""),
      email: String(data?.email ?? ""),
      profileImage: pickProfileImage(data),
    };
  }

  // 2) 폴백: 작성내역 메타 활용 (닉네임/이메일/프로필)
  const postsRes = await axiosInstance.get("/my-page/posts", {
    params: { page: 1, size: 1 },
  });
  if (postsRes.status !== 404) {
    const r = postsRes.data?.result ?? postsRes.data ?? {};
    return {
      id: 0,
      nickname: String(r?.nickname ?? ""),
      email: String(r?.email ?? ""),
      profileImage: pickProfileImage(r),
    };
  }

  // 3) 폴백: 문의내역 메타 활용
  const inqRes = await axiosInstance.get("/my-page/inquiries", {
    params: { page: 1, size: 1 },
  });
  if (inqRes.status !== 404) {
    const r = inqRes.data?.result ?? inqRes.data ?? {};
    return {
      id: 0,
      nickname: String(r?.nickname ?? ""),
      email: String(r?.email ?? ""),
      profileImage: pickProfileImage(r),
    };
  }

  // 4) 최종 기본값
  return { id: 0, nickname: "", email: "", profileImage: null };
}

export type PatchMyAccountReq = {
  id: number;
  nickname: string | null;
  email: string | null;
  image?: File | null;
};

export async function patchMyAccount(payload: PatchMyAccountReq): Promise<MyAccount> {
  const form = new FormData();
  const request = { id: payload.id, nickname: payload.nickname, email: payload.email };
  form.append("request", new Blob([JSON.stringify(request)], { type: "application/json" }));
  if (payload.image) form.append("image", payload.image, payload.image.name);

  const res = await axiosInstance.patch("/my-page/account", form);
  if (res.status === 404) {
    return { id: payload.id ?? 0, nickname: "", email: "", profileImage: null };
  }

  const data = res.data?.result ?? res.data ?? {};
  return {
    id: Number(data?.id ?? payload.id ?? 0),
    nickname: String(data?.nickname ?? ""),
    email: String(data?.email ?? ""),
    profileImage: pickProfileImage(data),
  };
}

/** ========= 작성내역 ========= */
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
  // 선택 필드들(있을 수도 없음)
  isBest?: boolean;
  hashtagList?: string[];
  hashtags?: string[];
  hashtagListDto?: { hashtagList?: Array<{ content?: string }> };
  categoryEn?: string;
  type?: string;
  topic?: string;
  postType?: string;
  subCategory?: string;
  category2?: string;
  tagCategory?: string;
  categories?: string[];
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
  const res = await axiosInstance.get("/my-page/posts", { params });
  if (res.status === 404) return { nickname: "", profileImageUrl: null, email: "", posts: [] };

  const r = res.data?.result ?? res.data ?? {};
  const rawList = Array.isArray(r?.posts)
    ? r.posts
    : Array.isArray(r?.content)
    ? r.content
    : Array.isArray(r?.list)
    ? r.list
    : [];

  const posts: MyPostItem[] = rawList.map((p: any) => ({
    postId: Number(p?.postId ?? 0),
    category: String(p?.category ?? ""),
    title: String(p?.title ?? ""),
    content: String(p?.content ?? ""),
    nickname: String(p?.nickname ?? ""),
    createdAt: String(p?.createdAt ?? ""),
    viewCount: Number(p?.viewCount ?? 0),
    likeCount: Number(p?.likeCount ?? 0),
    commentCount: Number(p?.commentCount ?? 0),
    postImageUrls: Array.isArray(p?.postImageUrls) ? p.postImageUrls : undefined,
    isBest: Boolean(p?.isBest),
    hashtagList: p?.hashtagList,
    hashtags: p?.hashtags,
    hashtagListDto: p?.hashtagListDto,
    categoryEn: p?.categoryEn,
    type: p?.type,
    topic: p?.topic,
    postType: p?.postType,
    subCategory: p?.subCategory,
    category2: p?.category2,
    tagCategory: p?.tagCategory,
    categories: Array.isArray(p?.categories) ? p.categories : undefined,
  }));

  return {
    nickname: String(r?.nickname ?? ""),
    profileImageUrl: pickProfileImage(r),
    email: String(r?.email ?? ""),
    posts,
    totalElements: typeof r?.totalElements === "number" ? r.totalElements : undefined,
    totalPages: typeof r?.totalPages === "number" ? r.totalPages : undefined,
  };
}

export async function deleteMyPost(postId: number) {
  const res = await axiosInstance.delete(`/my-page/posts/${postId}`);
  return res.data;
}

/** ========= 문의내역 ========= */
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

export async function getMyInquiries(params: {
  page: number;
  size: number;
}): Promise<MyInquiriesResponse> {
  const res = await axiosInstance.get("/my-page/inquiries", { params });
  if (res.status === 404) return { nickname: "", profileImageUrl: null, email: "", inquiries: [] };

  const r = res.data?.result ?? res.data ?? {};
  const rawList = Array.isArray(r?.inquiries)
    ? r.inquiries
    : Array.isArray(r?.content)
    ? r.content
    : Array.isArray(r?.list)
    ? r.list
    : [];

  const inquiries: MyInquiryItem[] = rawList.map((q: any) => ({
    inquiryId: Number(q?.inquiryId ?? 0),
    title: String(q?.title ?? ""),
    status: String(q?.status ?? "WAITING"),
    createdAt: String(q?.createdAt ?? ""),
  }));

  return {
    nickname: String(r?.nickname ?? ""),
    profileImageUrl: pickProfileImage(r),
    email: String(r?.email ?? ""),
    inquiries,
    totalElements: typeof r?.totalElements === "number" ? r.totalElements : undefined,
    totalPages: typeof r?.totalPages === "number" ? r.totalPages : undefined,
  };
}

export type InquiryDetail = {
  inquiryId: number;
  title: string;
  inquiryContent: string;
  answerContent: string | null;
  createdAt: string;
};

export async function getInquiryDetail(inquiryId: number): Promise<InquiryDetail | null> {
  const res = await axiosInstance.get(`/my-page/inquiries/${inquiryId}/detail`);
  if (res.status === 404) return null;

  const r = res.data?.result ?? res.data ?? {};
  return {
    inquiryId: Number(r?.inquiryId ?? inquiryId),
    title: String(r?.title ?? ""),
    inquiryContent: String(r?.inquiryContent ?? ""),
    answerContent: r?.answerContent ?? null,
    createdAt: String(r?.createdAt ?? ""),
  };
}

export async function deleteMyInquiry(inquiryId: number) {
  const res = await axiosInstance.delete(`/my-page/inquiries/${inquiryId}`);
  return res.data;
}