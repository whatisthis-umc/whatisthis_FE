import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePost as apiDeletePost, editPost as apiEditPost } from "../../api/posts";

export function useDeletePost(postId: number) {
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => apiDeletePost(postId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["communityDetail"] });
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["myPosts"] });
    },
  });
}

export function useEditPost(postId: number) {
  const qc = useQueryClient();
  return useMutation<void, Error, { title?: string; content?: string }>({
    mutationFn: (payload) => apiEditPost(postId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["communityDetail"] });
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["myPosts"] });
    },
  });
}


