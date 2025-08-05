import kakaoIcon from '/src/assets/kakao.png';
import naverIcon from '/src/assets/naver.png';
import googleIcon from '/src/assets/google.png';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [memberId, setMemberId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const isLoginEnabled = memberId.trim() !== '' && password.trim() !== '';

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://52.78.98.150:8080/members/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId,
          password,
        }),
      });

      const data = await response.json();
      if (data.isSuccess) {
        // 로그인 성공 처리
        console.log('accessToken:', data.result.accessToken);
        // navigate('/main'); 
      } else {
        setError(data.message); 
      }
    } catch (e) {
      setError('서버에 연결할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };



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
        ${error ? 'border-[#FF0000]' : 'border-[#999999]'}
        md:mt-0 md:text-base
      `}
    />
    {error && (
      <img
        src="../src/assets/error.png"
        alt="error icon"
        className="w-[16px] h-[16px] absolute right-0 top-[18px] md:top-[16px]"
      />
    )}
  </div>
  {error && (
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
    ${error ? 'mt-[40px]' : 'mt-0'}
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
              className="w-[24px] h-[24px] rounded-full cursor-pointer md:w-[28px] md:h-[28px]"
            />
            <img
              src={naverIcon}
              alt="naver"
              className="w-[24px] h-[24px] rounded-full cursor-pointer md:w-[28px] md:h-[28px]"
            />
            <img
              src={googleIcon}
              alt="google"
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

    </div>
    
    
  );
}
