import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateComment, deleteCommentAPI } from "../../api/comments";

export function useUpdateComment(postId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { commentId: number; content: string }) =>
      updateComment(postId, args.commentId, { content: args.content }),
    onSuccess: async () => {
      await qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "communityDetail" });
    },
  });
}

export function useDeleteComment(postId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) => deleteCommentAPI(postId, commentId),
    onSuccess: async () => {
      await qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "communityDetail" });
    },
  });
}