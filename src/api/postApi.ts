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

  // content가 undefined인 경우 빈 문자열로 설정
  const requestData = {
    ...request,
    content: request.content || "",
    hashtags: request.hashtags || []
  };

  const fd = new FormData();
  
  // request를 JSON 파일로 추가
  const requestFile = new File([JSON.stringify(requestData)], "request.json", {
    type: "application/json",
  });
  fd.append("request", requestFile);
  
  // 이미지가 있는 경우에만 추가
  if (images.length > 0) {
    images.forEach((f) => fd.append("images", f));
  }

  try {
    console.log("📤 요청 데이터:", requestData);
    console.log("📤 이미지 개수:", images.length);
    console.log("📤 FormData 내용:");
    for (const [key, value] of fd.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}:`, value);
      }
    }
    
    const res = await axiosInstance.post("/posts/communities", fd);
    const r = res.data?.result ?? res.data?.data ?? res.data;
    return { id: r.id, createdAt: r.createdAt, authorId: r.authorId };
  } catch (e: any) {
    console.error("❌ createCommunityPostV2 error", e?.response?.data ?? e);
    console.error("❌ 요청 데이터:", requestData);
    console.error("❌ 응답 상태:", e?.response?.status);
    console.error("❌ 응답 헤더:", e?.response?.headers);
    throw e;
  }
};

/** ✅ 커뮤니티 목록 조회 (카테고리별 엔드포인트) */
export type CommunityListItem = {
  id: number;
  title: string;
  content: string;
  category: "LIFE_TIP" | "ITEM_RECOMMEND" | "BUY_OR_NOT" | "QUESTION";
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

export type CommunitySort = "LATEST" | "BEST" | "AI";

// 카테고리별 엔드포인트 매핑
const getCategoryEndpoint = (category: string): string => {
  switch (category) {
    case "생활꿀팁":
    case "LIFE_TIP":
      return "/posts/communities/tips";
    case "꿀템 추천":
    case "ITEM_RECOMMEND":
      return "/posts/communities/items";
    case "살까말까?":
    case "BUY_OR_NOT":
      return "/posts/communities/should-i-buy";
    case "궁금해요!":
    case "QUESTION":
      return "/posts/communities/curious";
    case "인기글":
    case "BEST":
      return "/posts/communities/popular";
    default:
      return "/posts/communities/tips";
  }
};

export async function getCommunities(params: {
  page: number;
  size?: number;
  sort?: CommunitySort;
  category?: string;
}) {
  const { page, size = 6, sort = "LATEST", category = "생활꿀팁" } = params;
  
  const endpoint = getCategoryEndpoint(category);
  const requestParams: any = { page, size };
  
  // 인기글 카테고리는 sort 파라미터가 없음
  if (category !== "인기글" && category !== "BEST") {
    requestParams.sort = sort;
  }
  
  const res = await axiosInstance.get(endpoint, {
    params: requestParams,
  });
  
  const r = (res.data?.result ?? res.data?.data ?? res.data) as CommunityPageResult;
  return { ...r, page };
}