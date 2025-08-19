import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComment, type CreateCommentReq } from "../../api/comments";

export default function useCreateComment(postId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateCommentReq) => createComment(postId, body),
    onSuccess: async () => {
      await qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "communityDetail" });
    },
  });
}