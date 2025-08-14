import axios from "axios";

export function isAxios404(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 404;
}