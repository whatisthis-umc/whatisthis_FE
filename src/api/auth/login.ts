import { axiosInstance } from '../axiosInstance';

export const login = async ({
  memberId,
  password,
}: {
  memberId: string;
  password: string;
}) => {
  const response = await axiosInstance.post('/members/login', {
    memberId,
    password,
  });

  return response.data;
};
