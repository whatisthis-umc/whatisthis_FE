import { useMutation } from "@tanstack/react-query";
import { reportComment } from "../../api/report";
import type { ReportPayload, ReportCommentResponse } from "../../api/report";

type Vars = { commentId: number; payload: ReportPayload };

export default function useReportComment(postId: number) {
  return useMutation<ReportCommentResponse, Error, Vars>({
    mutationFn: ({ commentId, payload }) => reportComment(postId, commentId, payload),
  });
}