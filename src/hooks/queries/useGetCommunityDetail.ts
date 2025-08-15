import { useQuery } from "@tanstack/react-query";
import { getCommunityDetail } from "../../api/community";
import type { CommunitySortType } from "../../types/community";

/** API가 기대하는 디테일 조회 파라미터(로컬 정의) */
type GetCommunityDetailParamsLocal = {
  postId: number;
  page: number;
  size: number;
  sort?: CommunitySortType; // 옵션으로 받되, 아래에서 기본값으로 정규화
};

export default function useGetCommunityDetail({
  postId,
  page,
  size,
  sort,
}: GetCommunityDetailParamsLocal) {
  // ✅ undefined 방지: 기본값 "LATEST"
  const normalizedSort: CommunitySortType = (sort ?? "LATEST") as CommunitySortType;

  return useQuery({
    queryKey: ["communityDetail", postId, page, size, normalizedSort],
    queryFn: () => getCommunityDetail({ postId, page, size, sort: normalizedSort }),
    // 필요하면 staleTime, gcTime, placeholderData 등 옵션 추가
  });
}