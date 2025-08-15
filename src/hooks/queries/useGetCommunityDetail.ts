import { useQuery } from "@tanstack/react-query";
import { getCommunityDetail } from "../../api/community";

/** 백엔드 스펙 맞춘 정렬 타입 */
type CommunitySortType = "LATEST" | "BEST" | "AI";

/** 이 훅만 쓰는 로컬 파라미터 타입 (API 모듈에서 import 안 함) */
type GetCommunityDetailParamsLocal = {
  postId: number;
  page: number;
  size: number;
  /** 서버가 필수로 요구하면 기본값을 아래에서 LATEST로 채워줌 */
  sort?: CommunitySortType;
};

export default function useGetCommunityDetail({
  postId,
  page,
  size,
  sort,
}: GetCommunityDetailParamsLocal) {
  const safeSort: CommunitySortType = sort ?? "LATEST";

  return useQuery({
    queryKey: ["communityDetail", postId, page, size, safeSort],
    queryFn: () =>
      getCommunityDetail({
        postId,
        page,
        size,
        sort: safeSort,
      }),
    staleTime: 60_000,
  });
}
