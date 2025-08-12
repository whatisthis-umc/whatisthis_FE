import { useQuery } from "@tanstack/react-query";
import { getMyAccount } from "../../api/mypage";

export default function useMyAccount() {
  return useQuery({
    queryKey: ["myAccount"],
    queryFn: getMyAccount,
    retry: false,
    refetchOnWindowFocus: false,
  });
}