// src/api/dto/signupRequest.ts
export interface SignupRequestDto {
  email: string;
  emailAuthCode: string;
  memberId: string;
  password: string;
  passwordCheck: string;
  nickname: string;
  serviceAgreed: boolean;
  privacyAgreed: boolean;
}
