import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCommunityPost, updateCommunityPost } from "../../api/community";

export function useDeleteCommunity(postId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deleteCommunityPost(postId),
    onSuccess: () => {
      qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "communities" });
    },
  });
}

export function useUpdateCommunity(postId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      category:
        | "LIFE_TIP" | "LIFE_ITEM" | "COOK_TIP" | "CLEAN_TIP" | "BATHROOM_TIP" | "CLOTH_TIP" | "STORAGE_TIP"
        | "SELF_LIFE_ITEM" | "KITCHEN_ITEM" | "CLEAN_ITEM" | "HOUSEHOLD_ITEM" | "BRAND_ITEM" | "TIP" | "ITEM" | "SHOULD_I_BUY" | "CURIOUS";
      title: string;
      content: string;
      hashtags: string[];
      images?: File[];
    }) => updateCommunityPost(postId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && (q.queryKey[0] === "communities" || q.queryKey[0] === "communityDetail") });
    },
  });
}