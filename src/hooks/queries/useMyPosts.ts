import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getMyPosts, type MyPostsResponse } from "../../api/mypage";
import { isAxios404 } from "../../utils/isAxios404";

export default function useMyPosts(page: number, size: number, enabled: boolean = true) {
  return useQuery<MyPostsResponse, Error>({
    queryKey: ["myPosts", page, size],
    queryFn: () => getMyPosts({ page, size }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    enabled,
    // v5 서명: (failureCount, error) => boolean
    retry: (failureCount, error) => !isAxios404(error) && failureCount < 1,
    throwOnError: (error) => !isAxios404(error),
  });
}
