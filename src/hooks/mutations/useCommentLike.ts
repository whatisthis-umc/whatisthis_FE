import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeComment, unlikeComment } from "../../api/comments";

const invalidateCommunityDetail = async (qc: ReturnType<typeof useQueryClient>) => {
  await qc.invalidateQueries({
    predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "communityDetail",
    refetchType: "active",
  });
};

export function useLikeComment(postId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) => likeComment(postId, commentId),
    onSuccess: () => invalidateCommunityDetail(qc),
  });
}

export function useUnlikeComment(postId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) => unlikeComment(postId, commentId),
    onSuccess: () => invalidateCommunityDetail(qc),
  });
}
