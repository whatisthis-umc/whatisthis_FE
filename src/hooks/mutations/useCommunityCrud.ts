import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteCommunityPost,
  updateCommunityPost,
  type UpdateCommunityRequest, // ✅ API 타입을 그대로 사용
} from "../../api/community";

export function useDeleteCommunity(postId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deleteCommunityPost(postId),
    onSuccess: () => {
      qc.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "communities",
      });
    },
  });
}

export function useUpdateCommunity(postId: number) {
  const qc = useQueryClient();
  return useMutation({
    // ✅ payload 타입을 UpdateCommunityRequest로 고정
    mutationFn: (payload: UpdateCommunityRequest) => updateCommunityPost(postId, payload),
    onSuccess: () => {
      qc.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          (q.queryKey[0] === "communities" || q.queryKey[0] === "communityDetail"),
      });
    },
  });
}