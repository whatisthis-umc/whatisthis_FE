import kakaoIcon from '/src/assets/kakao.png';
import naverIcon from '/src/assets/naver.png';
import googleIcon from '/src/assets/google.png';
import { useNavigate } from 'react-router-dom';


export default function LoginPage() {
  const navigate = useNavigate();
const KAKAO_URL = `${import.meta.env.VITE_API_URL}/oauth2/authorization/kakao`;
const NAVER_URL = `${import.meta.env.VITE_API_URL}/oauth2/authorization/naver`;
const GOOGLE_URL = `${import.meta.env.VITE_API_URL}/oauth2/authorization/google`;

  return (
    <div className="flex flex-col min-h-screen">
  

      <main className="flex-grow flex items-center justify-center bg-white">
        <div className="w-[360px] flex flex-col gap-4 border border-[#D9D9D9] rounded-[20px] p-8">
          <div>
            <label className="text-sm text-[#333333]">아이디</label>
            <input
              type="text"
              placeholder="입력"
              className="w-full border-b border-[#999999] focus:outline-none py-2"
            />
          </div>
          <div>
            <label className="text-sm text-[#333333]">비밀번호</label>
            <input
              type="password"
              placeholder="입력"
              className="w-full border-b border-[#999999] focus:outline-none py-2"
            />
          </div>

          <button className="cursor-pointer w-full bg-[#E4E4E4] h-[40px] rounded-[32px] text-[#999999] mt-2" disabled>
            로그인
          </button>

          <button className="cursor-pointer w-full bg-[#007BFF] h-[40px] text-white rounded-[32px] font-semibold"
          onClick={() => navigate('/signup')}>
            회원가입
          </button>

          <div className="cursor-pointer text-center text-xs text-[#333333] mt-2">아이디/비밀번호 찾기</div>

          <div className="flex justify-center items-center gap-[20px] mt-4">
    <img
      src={kakaoIcon}
      alt="kakao"
      className="w-[28px] h-[28px] rounded-full cursor-pointer"
      onClick={() => window.location.href = KAKAO_URL}
    />
     <img
      src={naverIcon}
      alt="naver"
      className="w-[28px] h-[28px] rounded-full cursor-pointer"
      onClick={() => window.location.href = NAVER_URL}
    />
     <img
      src={googleIcon}
      alt="google"
      className="w-[28px] h-[28px] rounded-full cursor-pointer"
      onClick={() => window.location.href = GOOGLE_URL}
    />
  </div>
        </div>
      </main>

      
    </div>
  );
}
