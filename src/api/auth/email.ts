// src/api/auth/emailAuth.ts
import { axiosInstance } from "../axiosInstance";

export const requestEmailAuthCode = async (email: string): Promise<void> => {
  const res = await axiosInstance.post("/members/email-auth", { email });

  if (!res.data.isSuccess) {
    throw new Error(res.data.message || "이메일 인증 요청 실패");
  }
};
