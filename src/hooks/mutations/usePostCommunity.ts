import { useMutation } from "@tanstack/react-query";
import { createCommunityPostV2 } from "../../api/postApi";
import { useNavigate } from "react-router-dom";

type CommunityRequest = {
  category: "TIP" | "ITEM" | "SHOULD_I_BUY" | "CURIOUS";
  title: string;
  content?: string;
  hashtags: string[];
};

type Payload = { draft: CommunityRequest; files: File[] };

export default function usePostCommunity() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ draft, files }: Payload) => {
      const vm = await createCommunityPostV2({ request: draft, images: files });
      return vm;
    },
    onSuccess: (vm) => {
      navigate(`/community?created=${vm.id}`);
    },
    retry: (count, err: any) => {
      if (err?.status && err.status >= 400 && err.status < 500) return false;
      return count < 2;
    },
  });
}