import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateCommunityPost,
  deleteCommunityPost,
  type UpdateCommunityRequest,
} from "../../api/community";

export function useEditPost(postId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { draft: UpdateCommunityRequest; files?: File[] }) => {
      const { draft, files } = vars;
      return updateCommunityPost(postId, draft, files);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) && q.queryKey[0] === "communityDetail",
      });
    },
  });
}

export function useDeletePost(postId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deleteCommunityPost(postId),
    onSuccess: async () => {
      await qc.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          (q.queryKey[0] === "communityDetail" || q.queryKey[0] === "communities"),
      });
    },
  });
}
