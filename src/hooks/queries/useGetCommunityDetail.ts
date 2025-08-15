import { useQuery } from "@tanstack/react-query";
import { getCommunityDetail } from "../../api/community";

// ✅ 타입을 로컬에서 선언
type CommunitySortType = "LATEST" | "BEST" | "AI";
type GetCommunityDetailParams = {
  postId: number;
  page: number;
  size: number;
  sort?: CommunitySortType;
};

export default function useGetCommunityDetail({
  postId,
  page,
  size,
  sort,
}: GetCommunityDetailParams) {
  return useQuery({
    queryKey: ["communityDetail", postId, page, size, sort ?? "LATEST"],
    queryFn: () => getCommunityDetail({ postId, page, size, sort }),
    staleTime: 60_000,
    retry: 0,
  });
}