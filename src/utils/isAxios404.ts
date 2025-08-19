import axios from "axios";

export function isAxios404(err: unknown): boolean {
  if (!axios.isAxiosError(err)) return false;
  return (err.response?.status ?? 0) === 404;
}