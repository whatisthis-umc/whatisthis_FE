//src/api/auth/admin.ts


// 관리자 로그인 api
import { axiosInstance} from "../axiosInstance";

export const adminLogin = async (username:string, password:string) : Promise<string> =>{
    const res = await axiosInstance.post('/admin/login', {username, password});

if (!res.data.isSuccess) throw new Error(res.data.message);
return res.data.result.accessToken;
};


