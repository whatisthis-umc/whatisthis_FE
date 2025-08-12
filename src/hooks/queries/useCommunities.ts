import { useInfiniteQuery } from "@tanstack/react-query";
import { CommunitySort, getCommunities } from "../../api/postApi";

export default function useCommunities(sort: CommunitySort = "LATEST") {
  return useInfiniteQuery({
    queryKey: ["communities", sort],
    queryFn: ({ pageParam = 0 }) =>
      getCommunities({ page: pageParam, size: 6, sort }),
    getNextPageParam: (lastPage) => {
      return lastPage.isLast ? undefined : lastPage.page + 1;
    },
    initialPageParam: 0,
  });
}