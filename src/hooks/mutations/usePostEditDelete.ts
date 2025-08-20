import { useMutation, useQueryClient } from "@tanstack/react-query";

// 원본 코드에서 사용처는 삭제/수정 버튼 네비게이션에만 쓰이고,
// 실제 API 호출은 현재 브랜치에 존재하지 않으므로 더미(빈 호출)로 대체
export function useEditPost(_postId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_vars: unknown) => {},
    onSuccess: async () => {
      await qc.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "communityDetail",
      });
    },
  });
}

export function useDeletePost(_postId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {},
    onSuccess: async () => {
      await qc.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && (q.queryKey[0] === "communityDetail" || q.queryKey[0] === "communities"),
      });
    },
  });
}
