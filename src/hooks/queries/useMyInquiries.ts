import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getMyInquiries, type MyInquiriesResponse } from "../../api/mypage";

export default function useMyInquiries(page: number, size: number) {
  return useQuery<MyInquiriesResponse>({
    queryKey: ["myInquiries", page, size],
    queryFn: () => getMyInquiries({ page, size }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}