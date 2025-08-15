import { useQuery } from "@tanstack/react-query";
import { getCommunityDetail } from "../../api/community";

/** UI/내부에서 쓰는 정렬 타입 (AI 포함) */
type CommunitySortType = "LATEST" | "BEST" | "AI";

/** API가 실제로 허용하는 정렬 타입 */
type ApiSort = "LATEST" | "BEST";

/** 이 훅만 쓰는 로컬 파라미터 타입 */
type GetCommunityDetailParamsLocal = {
  postId: number;
  page: number;
  size: number;
  sort?: CommunitySortType; // UI에서는 AI를 가질 수 있음
};

export default function useGetCommunityDetail({
  postId,
  page,
  size,
  sort,
}: GetCommunityDetailParamsLocal) {
  // UI 기본값
  const safeSort: CommunitySortType = sort ?? "LATEST";
  // API로 보낼 값: AI가 오면 LATEST로 강제 매핑
  const apiSort: ApiSort = safeSort === "BEST" ? "BEST" : "LATEST";

  return useQuery({
    queryKey: ["communityDetail", postId, page, size, safeSort],
    queryFn: () =>
      getCommunityDetail({
        postId,
        page,
        size,
        sort: apiSort, // ← API는 LATEST/BEST만
      }),
    staleTime: 60_000,
  });
}
