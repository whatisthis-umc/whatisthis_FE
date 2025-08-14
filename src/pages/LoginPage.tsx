////src/pages/LoginPage.tsx
import kakaoIcon from '/src/assets/kakao.png';
import naverIcon from '/src/assets/naver.png';
import googleIcon from '/src/assets/google.png';
import errorIcon from '/src/assets/error.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { login } from '../api/auth/login';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // 배포주소로 
  const API = import.meta.env.VITE_API_BASE_URL ;

  const goSocial = (provider: 'kakao' | 'google' | 'naver') => {
    // 
    window.location.href = `${API}/oauth2/authorization/${provider}`;
  };

  const [memberId, setMemberId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');  // 아이디/비밀번호 에러
  const [modalError, setModalError] = useState('');  // 소셜 로그인 에러
  const [isLoading, setIsLoading] = useState(false);
  const isLoginEnabled = memberId.trim() !== '' && password.trim() !== '';

  const handleLogin = async () => {
    setIsLoading(true);
    setLoginError('');
      
  try {
    const data = await login({ memberId, password }); // 

    if (data.isSuccess) {
      const { accessToken, refreshToken } = data.result;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      navigate('/community');
    } else {
      setLoginError(data.message);
    }
  } catch (e: any) {
    // axios 에러 처리
    if (e.response && e.response.data && e.response.data.message) {
      setLoginError(e.response.data.message);
    } else {
      setLoginError('서버에 연결할 수 없습니다.');
    }
  } finally {
    setIsLoading(false);
  }
};

//  콜백에서 온 에러 state 수신 → 화면에 표시
  useEffect(() => {
    const incomingError = (location.state as any)?.error;
    if (incomingError) {
      setModalError(incomingError);
      // 한 번 보여준 뒤 state 비우기(뒤로가기/새로고침 시 중복 방지)
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex items-center justify-center bg-white">
        <div
          className="
            w-[271px] h-[550px] p-[24px] gap-[24px]
            md:w-[360px] md:h-auto md:p-8 md:gap-4
            flex flex-col border border-[#D9D9D9] rounded-[20px]
          
          "
        >
          {/* 아이디 */}
          <div className="flex flex-col">
            <label className="text-[16px] text-[#333333] md:text-sm">아이디</label>
            <input
              type="text"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="입력"
              className="
                w-full border-b border-[#999999] focus:outline-none
                mt-[10px] text-[14px] py-2
                md:mt-0 md:text-base
              "
            />
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col relative">
  <label className="text-[16px] text-[#333333] md:text-sm">비밀번호</label>
  <div className="relative">
    <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="입력"
      className={`
        w-full border-b focus:outline-none mt-[10px] text-[14px] py-2 pr-8
        ${loginError ? 'border-[#FF0000]' : 'border-[#999999]'}
        md:mt-0 md:text-base
      `}
    />
    {loginError && (
      <img
        src={errorIcon}
        alt="error icon"
        className="w-[16px] h-[16px] absolute right-0 top-[18px] md:top-[16px]"
      />
    )}
  </div>
  {loginError && (
    <p className="text-[#FF0000] text-[12px] mt-2 leading-tight">
      일치하는 회원 정보가 없습니다.<br />
      아이디와 비밀번호를 다시 확인해주세요.
    </p>
  )}
</div>


          {/* 로그인 버튼 */}
          <button
            className={`
    w-[160px] h-[37px] text-[14px] leading-[37px] text-center rounded-[32px] self-center
    ${loginError ? 'mt-[40px]' : 'mt-0'}
    ${isLoginEnabled ? 'bg-[#007BFF] text-white font-semibold' : 'bg-[#E4E4E4] text-[#999999]'}
    md:w-full md:h-[40px] md:text-base md:self-auto md:mt-2
  `}
  onClick={handleLogin}
  disabled={!isLoginEnabled}
>
            로그인
          </button>

          {/* 회원가입 버튼 */}
          <button
            className="
              cursor-pointer bg-[#007BFF] text-white font-semibold
              w-[160px] h-[37px] leading-[37px] text-center  text-[14px] rounded-[32px] self-center
              md:w-full md:h-[40px] md:text-base
            "
            onClick={() => navigate('/signup')}
          >
            회원가입
          </button>

          {/* 아이디/비밀번호 찾기 */}
          <div
            onClick={() => navigate("/find")}
            className="
              cursor-pointer text-center text-[16px] text-[#333333] mt-[22px]
              md:text-xs md:mt-2
            "
          >
            아이디/비밀번호 찾기
          </div>

          {/* 소셜 로그인 아이콘 */}
          <div
            className="
              flex justify-center items-center gap-[30px] mt-[0px]
              md:gap-[20px] md:mt-4
            "
          >
            <img
              src={kakaoIcon}
              alt="kakao"
              role="button"
              tabIndex={0}
              onClick={() => goSocial('kakao')}
              onKeyDown={(e) => e.key === 'Enter' && goSocial('kakao')}
              className="w-[24px] h-[24px] rounded-full cursor-pointer md:w-[28px] md:h-[28px]"
            />
            <img
              src={naverIcon}
              alt="naver"
              role="button"
              tabIndex={0}
              onClick={() => goSocial('naver')}
              onKeyDown={(e) => e.key === 'Enter' && goSocial('naver')}
              className="w-[24px] h-[24px] rounded-full cursor-pointer md:w-[28px] md:h-[28px]"
            />
            <img
              src={googleIcon}
              alt="google"
              role="button"
              tabIndex={0}
              onClick={() => goSocial('google')}
              onKeyDown={(e) => e.key === 'Enter' && goSocial('google')}
              className="w-[24px] h-[24px] rounded-full cursor-pointer md:w-[28px] md:h-[28px]"
            />
            
          </div>

        </div>
       

      </main>
      {isLoading && (
  <div className="fixed inset-0 z-50 bg-white/50 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-[#007BFF] border-t-transparent rounded-full animate-spin" />
  </div>
)}

{/* 모달 렌더링 */}
{modalError && (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
    <div
      className="
        bg-white w-[686px] h-[249px] rounded-[40px] p-[40px]
        shadow-[0_8px_24px_rgba(0,0,0,0.12)]
        flex flex-col
      "
    >
      {/* 메시지 */}
      <p
        className="
          font-[Pretendard] font-bold text-[24px]
          leading-[150%] tracking-[-0.02em] text-[#333333]
          text-left whitespace-pre-line
        "
      >
        {modalError}
      </p>

      
      <div className="mt-[60px] flex justify-end">
        <button
          onClick={() => setModalError('')}
          className="
            w-[160px] h-[54px] rounded-[32px] bg-[#0080FF] text-white
            font-[Pretendard] font-medium text-[20px] leading-[150%] tracking-[-0.02em]
            hover:brightness-95 active:brightness-90 transition
          "
        >
          확인
        </button>
      </div>
    </div>
  </div>
)}


    </div>
    
  );
}

