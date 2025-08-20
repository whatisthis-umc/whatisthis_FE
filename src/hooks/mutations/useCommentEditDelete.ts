import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateComment as apiUpdateComment, deleteComment as apiDeleteComment } from "../../api/comments";

type UpdateVars = { commentId: number; content: string };

export function useUpdateComment(postId: number) {
  const qc = useQueryClient();
  return useMutation<void, Error, UpdateVars>({
    mutationFn: ({ commentId, content }) => apiUpdateComment(postId, commentId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["communityDetail"] });
    },
  });
}

export function useDeleteComment(postId: number) {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (commentId: number) => apiDeleteComment(postId, commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["communityDetail"] });
    },
  });
}


