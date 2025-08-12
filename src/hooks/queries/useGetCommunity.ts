import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { axiosInstance } from "../../api/axiosInstance";
import type { CommunitySortType, CommunityPost } from "../../types/community";

type Params = {
  page: number;  // 1-based
  size: number;  // e.g., 6
  sort: CommunitySortType; // "BEST" | "LATEST"
  uiCategory: "전체" | "인기글" | "생활꿀팁" | "꿀템 추천" | "살까말까?" | "궁금해요!";
};

type ServerItem = {
  id: number; title: string; content: string;
  category: "TIP" | "ITEM" | "SHOULD_I_BUY" | "CURIOUS";
  nickname: string; createdAt: string; isBestUser: boolean;
  viewCount: number; likeCount: number; commentCount: number;
  imageUrl: string[];
};
type ServerPage = {
  postList: ServerItem[]; listSize: number; totalPage: number;
  totalElements: number; isFirst: boolean; isLast: boolean;
};
type Envelope = { isSuccess: boolean; code: string; message: string; result: ServerPage | null };

function map(i: ServerItem): CommunityPost {
  return {
    id: i.id, title: i.title, content: i.content, category: i.category,
    nickname: i.nickname, createdAt: i.createdAt, isBest: i.isBestUser,
    views: i.viewCount, likes: i.likeCount, comments: i.commentCount,
    imageUrls: i.imageUrl ?? [], hashtags: [],
  };
}

function segOf(ui: Params["uiCategory"]):
  | "popular" | "tips" | "items" | "should-i-buy" | "curious" | null {
  switch (ui) {
    case "인기글": return "popular";
    case "생활꿀팁": return "tips";
    case "꿀템 추천": return "items";
    case "살까말까?": return "should-i-buy";
    case "궁금해요!": return "curious";
    default: return null;
  }
}

async function getPublicOnce(url: string, params?: Record<string, any>): Promise<ServerPage> {
  const res = await axiosInstance.get<Envelope>(url, {
    params, isPublic: true, withCredentials: false, headers: { Authorization: undefined },
  } as any);
  if (!res.data?.isSuccess || !res.data.result) {
    const err: any = new Error(res.data?.message ?? "요청 실패");
    err.response = { status: (res as any)?.status ?? 500, data: res.data };
    throw err;
  }
  return res.data.result;
}

/* sort 포함해서 호출 */
async function fetchCategoryOnce(
  segment: NonNullable<ReturnType<typeof segOf>>,
  page: number,
  size: number,
  sort: CommunitySortType
) {
  const r = await getPublicOnce(`/posts/communities/${segment}`, { page, size, sort });
  return {
    items: (r.postList ?? []).map(map),
    totalPages: r.totalPage ?? 1,
    totalElements: r.totalElements ?? (r.postList?.length ?? 0),
    isFirst: r.isFirst ?? page === 1,
    isLast: r.isLast ?? false,
  };
}

/* 전체+최신순 병합 시에도 sort=LATEST 붙여서 4카테 1회씩만 */
async function mergeLatest(page: number, size: number, sort: CommunitySortType = "LATEST") {
  const segs: Array<NonNullable<ReturnType<typeof segOf>>> =
    ["tips", "items", "should-i-buy", "curious"];

  const settled = await Promise.allSettled(
    segs.map((s) => fetchCategoryOnce(s, 1, size, sort))
  );

  const pool = settled
    .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof fetchCategoryOnce>>> => r.status === "fulfilled")
    .flatMap(r => r.value.items);

  const sorted = pool.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const offset = (page - 1) * size;
  const slice = sorted.slice(offset, offset + size);
  const totalPages = Math.max(1, Math.ceil(sorted.length / size));

  return { posts: slice, totalPages, totalElements: sorted.length, isFirst: page === 1, isLast: page >= totalPages };
}

async function fetchPopular(page: number, size: number) {
  // popular는 sort 요구 X (스펙 기준)
  const r = await getPublicOnce("/posts/communities/popular", { page, size });
  return {
    posts: (r.postList ?? []).map(map),
    totalPages: r.totalPage ?? 1,
    totalElements: r.totalElements ?? (r.postList?.length ?? 0),
    isFirst: r.isFirst ?? page === 1,
    isLast: r.isLast ?? false,
  };
}

async function fetchCommunities({ page, size, sort, uiCategory }: Params) {
  const seg = segOf(uiCategory);

  if (seg && seg !== "popular") {
    const r = await fetchCategoryOnce(seg, page, size, sort);
    return { posts: r.items, totalPages: r.totalPages, totalElements: r.totalElements, isFirst: r.isFirst, isLast: r.isLast };
  }

  if (seg === "popular" || (!seg && sort === "BEST")) {
    return fetchPopular(page, size);
  }

  // 전체 + 최신순
  return mergeLatest(page, size, "LATEST");
}

export default function useGetCommunity(params: Params) {
  return useQuery({
    queryKey: ["communities", params.page, params.size, params.sort, params.uiCategory],
    queryFn: () => fetchCommunities(params),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });
}