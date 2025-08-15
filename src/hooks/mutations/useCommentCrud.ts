import { useMutation, useQueryClient } from "@tanstack/react-query";
// ⬇️ deleteComment -> deleteCommentAPI 로 수정
import { updateComment, deleteCommentAPI } from "../../api/comments";

export function useUpdateComment(postId: number) {
  const qc = useQueryClient();
  return useMutation({
    // ⬇️ content를 문자열이 아니라 객체로 전달
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      updateComment(postId, commentId, { content }),
    onSuccess: () => {
      qc.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "communityDetail",
      });
    },
  });
}

export function useDeleteComment(postId: number) {
  const qc = useQueryClient();
  return useMutation({
    // ⬇️ deleteCommentAPI로 교체
    mutationFn: (commentId: number) => deleteCommentAPI(postId, commentId),
    onSuccess: () => {
      qc.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "communityDetail",
      });
    },
  });
}