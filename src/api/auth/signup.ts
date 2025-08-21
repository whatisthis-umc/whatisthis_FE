// src/api/auth/signup.ts
import { axiosInstance } from '../axiosInstance';
import { SignupRequestDto } from '../dto/signupRequest';

// 닉네임 중복확인
export const checkNicknameAvailable = async (nickname: string): Promise<boolean> => {
  try {
    const response = await axiosInstance.get(`/members/nickname-available?nickname=${encodeURIComponent(nickname)}`);
    return response.data?.isSuccess || false;
  } catch (error) {
    console.error('닉네임 중복확인 실패:', error);
    return false;
  }
};

export const signup = async (data: SignupRequestDto): Promise<void> => {
  const res = await axiosInstance.post("/members/signup", data);

  if (!res.data.isSuccess) {
    throw new Error(res.data.message);
  }
};
