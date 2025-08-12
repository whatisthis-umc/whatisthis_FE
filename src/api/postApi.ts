import { axiosInstance } from "./axiosInstance";

/** (선택) 단일 이미지 업로드 */
export const uploadImage = async (image: File): Promise<string> => {
  const form = new FormData();
  form.append("files", image);
  const res = await axiosInstance.post("/upload", form);
  const r = res.data?.result ?? res.data?.data ?? res.data;
  return Array.isArray(r) ? r[0] : r;
};

/** (참고) 일반 게시글 생성 */
export type PostRequest = {
  title: string;
  content?: string;
  hashtags?: string[];
  imageUrls?: string[];
};

export const createPost = async (data: PostRequest, image?: File): Promise<any> => {
  const fd = new FormData();
  if (image) fd.append("images", image);

  const requestFile = new File([JSON.stringify(data)], "request.json", {
    type: "application/json",
  });
  fd.append("request", requestFile);

  const res = await axiosInstance.post("/posts/posts", fd);
  return res.data?.result ?? res.data?.data ?? res.data;
};

/** ✅ 커뮤니티 글 작성 (대문자 ENUM) */
export type CommunityRequest = {
  category: "TIP" | "ITEM" | "SHOULD_I_BUY" | "CURIOUS";
  title: string;
  content?: string;
  hashtags: string[];
};

export type CommunityCreateParams =
  | { request: CommunityRequest; images?: File[] }
  | CommunityRequest;

export const createCommunityPostV2 = async (
  args: CommunityCreateParams,
  maybeImages?: File[]
): Promise<{ id: number; createdAt: string; authorId: number }> => {
  let request: CommunityRequest;
  let images: File[] = [];

  if ("category" in args) {
    request = args as CommunityRequest;
    images = maybeImages ?? [];
  } else {
    request = (args as { request: CommunityRequest }).request;
    images = (args as { request: CommunityRequest; images?: File[] }).images ?? [];
  }

  if (!request?.category || !request?.title) {
    throw new Error("필수 필드 누락: category, title");
  }

  const fd = new FormData();
  const requestFile = new File([JSON.stringify(request)], "request.json", {
    type: "application/json",
  });
  fd.append("request", requestFile);
  images.forEach((f) => fd.append("images", f));

  try {
    const res = await axiosInstance.post("/posts/communities", fd);
    const r = res.data?.result ?? res.data?.data ?? res.data;
    return { id: r.id, createdAt: r.createdAt, authorId: r.authorId };
  } catch (e: any) {
    console.error("❌ createCommunityPostV2 error", e?.response?.data ?? e);
    throw e;
  }
};

/** ✅ 커뮤니티 목록 조회 (페이지당 6개, BEST/LATEST) */
export type CommunityListItem = {
  id: number;
  title: string;
  content: string;
  category: "TIP" | "ITEM" | "SHOULD_I_BUY" | "CURIOUS";
  nickname: string;
  createdAt: string; // ISO
  isBestUser: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  imageUrl: string[];
};

export type CommunityPageResult = {
  postList: CommunityListItem[];
  listSize: number;
  totalPage: number;
  totalElements: number;
  isFirst: boolean;
  isLast: boolean;
};

export type CommunitySort = "BEST" | "LATEST";

export async function getCommunities(params: {
  page: number;         // 서버 스웨거 예시 page=6 → 0-based로 보이는 값 그대로 전달
  size?: number;        // 기본 6
  sort?: CommunitySort; // 기본 LATEST
}) {
  const { page, size = 6, sort = "LATEST" } = params;
  const res = await axiosInstance.get("/posts/communities", {
    params: { page, size, sort },
  });
  const r = (res.data?.result ?? res.data?.data ?? res.data) as CommunityPageResult;
  // 무한스크롤 편의를 위해 현재 page도 함께 반환
  return { ...r, page };
}