import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateCommunityPost,
  type UpdateCommunityRequest,
} from "../../api/community";

type Vars = {
  postId: number;
  req: UpdateCommunityRequest;
  files?: File[];
};

export default function usePatchCommunity() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, req, files }: Vars) =>
      updateCommunityPost(postId, req, files),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["communityDetail", vars.postId] });
      qc.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) && q.queryKey[0] === "communityDetail",
      });
    },
  });
}