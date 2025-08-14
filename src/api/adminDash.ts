import { axiosInstance } from "../api/axiosInstance";

export interface AdminDashResult {
  reports: { unprocessedCount: number };
  inquiries: { unansweredCount: number };
  userStats: { totalUserCount: number; todaySignupCount: number };
  contentStats: { postCount: number; commentCount: number };
}

export async function getAdminDash(): Promise<AdminDashResult> {
  const res = await axiosInstance.get<{ isSuccess: true; result: AdminDashResult }>(
    "/admin/home"
  );
  return res.data.result;
}
