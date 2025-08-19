//src/api/auth/admin.ts


// 관리자 로그인 api
import { axiosInstance} from "../axiosInstance";

export const adminLogin = async (username:string, password:string) : Promise<{ accessToken: string; refreshToken?: string; }> =>{
    const res = await axiosInstance.post('/admin/login', {username, password});

    if (!res.data.isSuccess) throw new Error(res.data.message);
    const accessToken: string = res.data.result.accessToken;
    const refreshToken: string | undefined = res.data.result.refreshToken;

    // 저장 (재발급 로직에서 사용)
    localStorage.setItem("adminAccessToken", accessToken);
    if (refreshToken) {
      localStorage.setItem("adminRefreshToken", refreshToken);
    }

    return { accessToken, refreshToken };
};


