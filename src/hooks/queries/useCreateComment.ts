import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComment, type CreateCommentReq } from "../../api/comments";

/** 댓글/대댓글 공용 훅 */
export default function useCreateComment(postId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateCommentReq) => createComment(postId, body),
    retry: false,
    onSuccess: async () => {
      // 상세 쿼리만 싹 갱신
      await qc.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) && q.queryKey[0] === "communityDetail",
        refetchType: "active",
      });
    },
  });
}