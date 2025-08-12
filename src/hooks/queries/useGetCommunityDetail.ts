import { useQuery } from "@tanstack/react-query";
import { getCommunityPostDetail } from "../../api/community";
import type { CommunitySortType } from "../../types/community";

interface Params {
  postId: number;
  page: number;
  size: number;
  sort: CommunitySortType | "AI";
}

export default function useGetCommunityDetail({ postId, page, size, sort }: Params) {
  return useQuery({
    queryKey: ["community-detail", postId, page, size, sort],
    queryFn: () => getCommunityPostDetail(postId, page, size, sort),
    enabled: !!postId,
  });
}
