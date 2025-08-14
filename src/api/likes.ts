import axios, { isAxiosError } from "axios";
import { axiosInstance } from "./axiosInstance";
import type { LikeItem, LikeListViewModel } from "../types/likes";

// 서버 응답 타입(스웨거 기준)
interface ServerPostItem {
  id: number;
  title: string;
  content: string;
  category: string;       // e.g. "LIFE_TIP"
  nickname: string;
  createdAt: string;
  isBestUser: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  imageUrl: string[];
}

interface ServerLikesResult {
  postList: ServerPostItem[];
  listSize: number;
  totalPage: number;
  totalElements: number;
  isFirst: boolean;
  isLast: boolean;
}

interface ServerLikesResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: ServerLikesResult;
}

export async function getMyLikes(params: {
  page: number;   // 1-based
  size: number;   // 원하는 페이지 사이즈
}): Promise<LikeListViewModel> {
  try {
    const { page, size } = params;

    const { data } = await axiosInstance.get<ServerLikesResponse>("/likes", {
      params: { page, size },
    });

    if (!data?.isSuccess || !data.result) {
      throw new Error(data?.message || "Failed to fetch likes.");
    }

    const r = data.result;

    const items: LikeItem[] = (r.postList ?? []).map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      category: p.category,
      nickname: p.nickname,
      createdAt: p.createdAt,
      isBestUser: p.isBestUser,
      viewCount: p.viewCount ?? 0,
      likeCount: p.likeCount ?? 0,
      commentCount: p.commentCount ?? 0,
      imageUrl: Array.isArray(p.imageUrl) ? p.imageUrl : [],
      liked: true, // 좋아요 목록이므로 기본 true
    }));

    return {
      items,
      totalPages: r.totalPage ?? 0,
      totalElements: r.totalElements ?? 0,
      isFirst: !!r.isFirst,
      isLast: !!r.isLast,
      pageSize: r.listSize ?? size,
    };
  } catch (err) {
    // 도메인 에러로 1회 래핑 (중복 throw 방지)
    if (isAxiosError(err)) {
      const status = err.response?.status;
      const msg =
        (err.response?.data as any)?.message ||
        err.message ||
        "Network error while fetching likes.";
      throw new Error(`[LikesAPI ${status ?? "ERR"}] ${msg}`);
    }
    throw err as Error;
  }
}