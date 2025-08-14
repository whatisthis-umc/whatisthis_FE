import { useQuery } from "@tanstack/react-query";
import {
  getCommunityDetail,
  type GetCommunityDetailParams,
} from "../../api/community";

type UseGetCommunityDetailArgs = Omit<GetCommunityDetailParams, "postId"> & {
  postId: number;
};

export default function useGetCommunityDetail({
  postId,
  page,
  size,
  sort,
}: UseGetCommunityDetailArgs) {
  return useQuery({
    queryKey: ["communityDetail", postId, page, size, sort],
    queryFn: () => getCommunityDetail({ postId, page, size, sort }),
    // 필요 시 staleTime/GC 조절 가능
  });
}