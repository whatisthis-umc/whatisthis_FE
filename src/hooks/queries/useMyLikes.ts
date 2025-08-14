import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getMyLikes } from "../../api/likes";
import type { LikeListViewModel } from "../../types/likes";

export default function useMyLikes(page: number, size: number) {
  return useQuery<LikeListViewModel>({
    queryKey: ["myLikes", page, size],
    queryFn: () => getMyLikes({ page, size }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,          // 1분 신선
    refetchOnWindowFocus: false,
  });
}