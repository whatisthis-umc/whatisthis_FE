import { useQuery } from "@tanstack/react-query";
import { getInquiryDetail } from "../../api/mypage";

export default function useInquiryDetail(inquiryId: number) {
  return useQuery({
    queryKey: ["inquiryDetail", inquiryId],
    queryFn: () => getInquiryDetail(inquiryId),
    enabled: !!inquiryId,
    staleTime: 60_000,
  });
}