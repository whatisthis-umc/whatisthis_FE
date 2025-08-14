import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMyInquiry } from "../../api/mypage";

export default function useDeleteMyInquiry(page: number, size: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inquiryId: number) => deleteMyInquiry(inquiryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myInquiries", page, size] });
    },
  });
}