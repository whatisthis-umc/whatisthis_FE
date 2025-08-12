import { useMutation } from "@tanstack/react-query";
import { reportPost } from "../../api/report";
import type { ReportPayload, ReportPostResponse } from "../../api/report";

export default function useReportPost(postId: number) {
  return useMutation<ReportPostResponse, Error, ReportPayload>({
    mutationFn: (payload) => reportPost(postId, payload),
  });
}
