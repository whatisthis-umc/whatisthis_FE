import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchMyAccount } from "../../api/mypage";

export default function usePatchMyAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: patchMyAccount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myAccount"] });
    },
  });
}