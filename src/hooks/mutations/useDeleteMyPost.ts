import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMyPost } from "../../api/mypage";

export default function useDeleteMyPost(page: number, size: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => deleteMyPost(postId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["myPosts", page, size] });
    },
  });
}