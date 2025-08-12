import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getMyPosts, type MyPostsResponse } from "../../api/mypage";

export default function useMyPosts(page: number, size: number) {
  return useQuery<MyPostsResponse>({
    queryKey: ["myPosts", page, size],
    queryFn: () => getMyPosts({ page, size }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}