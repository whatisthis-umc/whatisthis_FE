// api/auth/logout.ts
import axios from "axios";

export async function logout() {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/members/logout`,
      {},
      { withCredentials: true } // 쿠키(토큰) 포함
    );
    console.log("로그아웃 성공:", res.data);
    return res.data;
  } catch (err) {
    console.error("로그아웃 실패:", err);
    throw err;
  }
}