import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likePost, unlikePost, type LikeResult } from "../../api/posts";

type OnServerSynced = (next: { liked: boolean; likeCount: number }) => void;

export function useLikePost(postId: number, onSynced?: OnServerSynced) {
  const qc = useQueryClient();

  return useMutation<LikeResult, Error, void>({
    mutationFn: () => likePost(postId),
    onSuccess: (data) => {
      onSynced?.({ liked: true, likeCount: data.likeCount });
      // 관련 데이터 무효화
      qc.invalidateQueries({ queryKey: ["post", postId] });
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["myPosts"] });
      qc.invalidateQueries({ queryKey: ["myLikes"] }); // ✅ 추가
    },
  });
}

export function useUnlikePost(postId: number, onSynced?: OnServerSynced) {
  const qc = useQueryClient();

  return useMutation<LikeResult, Error, void>({
    mutationFn: () => unlikePost(postId),
    onSuccess: (data) => {
      onSynced?.({ liked: false, likeCount: data.likeCount });
      qc.invalidateQueries({ queryKey: ["post", postId] });
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["myPosts"] });
      qc.invalidateQueries({ queryKey: ["myLikes"] }); // ✅ 추가
    },
  });
}