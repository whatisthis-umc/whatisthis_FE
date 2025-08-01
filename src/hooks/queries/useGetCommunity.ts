import { useQuery } from "@tanstack/react-query";
import { getCommunityPosts } from "../../api/community";
import type { CommunitySortType, CommunityPost } from "../../types/community";

interface UseCommunityPostsProps {
  page: number;
  size: number;
  sort?: CommunitySortType;
}

const useGetCommunity = ({ page, size, sort }: UseCommunityPostsProps) => {
  return useQuery<CommunityPost[], Error>({
    queryKey: ["communityPosts", page, size, sort ?? "LATEST"], // ❗ sort 없으면 기본값 LATEST
    queryFn: () => getCommunityPosts(page, size, sort ?? "LATEST"),
    placeholderData: (previousData) => previousData,
  });
};


export default useGetCommunity;
