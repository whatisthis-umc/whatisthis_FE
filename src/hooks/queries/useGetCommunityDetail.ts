import { useQuery } from "@tanstack/react-query";
import { getCommunityDetail } from "../../api/community";

/** API가 기대하는 디테일 조회 파라미터(로컬 정의) */
type GetCommunityDetailParamsLocal = {
  postId: number;
  page: number;
  size: number;
  /** 백엔드 스펙에 맞춰 필요 시 문자열 리터럴로 한정하세요 */
  sort?: "LATEST" | "BEST" | "AI";
};

export default function useGetCommunityDetail({
  postId,
  page,
  size,
  sort,
}: GetCommunityDetailParamsLocal) {
  return useQuery({
    queryKey: ["communityDetail", postId, page, size, sort],
    queryFn: () => getCommunityDetail({ postId, page, size, sort }),
    // 필요하면 staleTime, gcTime, placeholderData 등 옵션 추가
  });
}