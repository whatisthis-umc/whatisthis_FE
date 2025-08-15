import { axiosInstance } from "./axiosInstance";
import axios from "axios";


// ---------- 타입 ----------
export interface FindIdReq {
  emailLocal: string;   // "@ 앞"
  emailDomain: string;  // "@ 뒤"
}
export interface FindIdRes {
  isSuccess: boolean;
  code: string;                
  message: string;
  result: { maskedEmail: string }; 
}
export interface SendCodeReq {
  memberId?: string;
  emailLocal?: string;
  emailDomain?: string;
}
export interface SendCodeRes {
  isSuccess: boolean;
  code: string;
  message: string;
  result: null;
}

export interface VerifyCodeReq {
  emailLocal: string;
  emailDomain: string;
  code: string;
  memberId: string;
}
export interface VerifyCodeRes {
  isSuccess: boolean;
  code: string;     // EMAIL2000 / MEMBER4040 / EMAIL4000 ...
  message: string;  // "인증 코드 번호가 일치합니다." 등
  result: null;
}

export interface ResetPasswordReq {
  newPassword: string;
  confirmPassword: string;
}
export interface ResetPasswordRes {
  isSuccess: boolean;
  code: string;       // 예: COMMON2000, AUTH4xxx 등
  message: string;
  result: null;
}


//----유틸------
/** 유틸: 한 칸 이메일 -> local/domain 분리 */
export function splitEmail(full: string) {
  const [l, d] = full.trim().split("@");
  return { emailLocal: (l || "").trim().toLowerCase(), emailDomain: (d || "").trim().toLowerCase() };
}
/** 공통 에러 메시지 */
export function getErrorMessage(e: any) {
  return e?.response?.data?.message || e?.message || "서버 오류가 발생했습니다.";
}

//--함수--
/** API 호출 */
export async function findId(body: FindIdReq) {
  const { data } = await axiosInstance.post<FindIdRes>("/members/find-id", body);
  return data;
}
export async function sendResetCode(body: SendCodeReq) {
  // resetToken 관련 쿠키를 위해 withCredentials: true 사용
  const { data } = await axios.post<SendCodeRes>(
    `${import.meta.env.VITE_API_BASE_URL}/members/reset-password/send-code`,
    body,
    { withCredentials: true }
  );
  return data;
}
/** 인증코드 검증 (토큰 발급) */
export async function verifyResetCode(body: VerifyCodeReq) {
  // resetToken 관련 쿠키를 위해 withCredentials: true 사용
  const { data } = await axios.post<VerifyCodeRes>(
    `${import.meta.env.VITE_API_BASE_URL}/members/reset-password/verify-code`,
    body,
    { withCredentials: true }
  );
  return data;
}

/** 비밀번호 재설정 */
export async function resetPassword(body: ResetPasswordReq) {
  // resetToken이 쿠키에 있으므로 withCredentials: true 필요
  const { data } = await axios.post<ResetPasswordRes>(
    `${import.meta.env.VITE_API_BASE_URL}/members/reset-password`,
    body,
    { withCredentials: true } // 쿠키 전송을 위해 필요
  );
  return data;
}




