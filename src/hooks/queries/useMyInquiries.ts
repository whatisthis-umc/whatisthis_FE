import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getMyInquiries, type MyInquiriesResponse } from "../../api/mypage";
import { isAxios404 } from "../../utils/isAxios404";

export default function useMyInquiries(page: number, size: number) {
  return useQuery<MyInquiriesResponse, Error>({
    queryKey: ["myInquiries", page, size],
    queryFn: () => getMyInquiries({ page, size }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    retry: (failureCount, error) => !isAxios404(error) && failureCount < 1,
    throwOnError: (error) => !isAxios404(error),
  });
}