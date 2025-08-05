// src/api/auth/signup.ts
import { axiosInstance } from "../axiosInstance";
import type { SignupRequestDto } from "../dto/signupRequest";


export const signup = async (data: SignupRequestDto): Promise<void> => {
  const res = await axiosInstance.post("/members/signup", data);

  if (!res.data.isSuccess) {
    throw new Error(res.data.message);
  }
};
