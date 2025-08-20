import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeComment, unlikeComment } from "../../api/comments";

export function useLikeComment(postId: number) {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (commentId: number) => likeComment(postId, commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["communityDetail"] });
    },
  });
}

export function useUnlikeComment(postId: number) {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (commentId: number) => unlikeComment(postId, commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["communityDetail"] });
    },
  });
}


