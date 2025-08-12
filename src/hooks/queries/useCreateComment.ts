import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComment } from "../../api/comments";
import type { CreateCommentReq } from "../../api/comments";

export default function useCreateComment(postId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateCommentReq) => createComment(postId, body),
    onSuccess: () => {
      // 상세 쿼리 무효화 (키 구조가 다르더라도 communityDetail 전체를 갱신)
      qc.invalidateQueries({ queryKey: ["communityDetail"] });
    },
  });
}
