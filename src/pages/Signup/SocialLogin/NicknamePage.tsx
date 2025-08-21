import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function SocialNickNamePage() {
  const navigate = useNavigate();
  const { state } = useLocation() as {
    state?: { email?: string; provider?: string; providerId?: string };
  };
  const [nickname, setNickname] = useState('');

    // 콜백에서 넘겨받은 값
  const email = state?.email ?? '';
  const provider = state?.provider ?? '';
  const providerId = state?.providerId ?? '';
  const API = import.meta.env.VITE_API_BASE_URL;

  // 닉네임 중복확인
  const handleCheckNickname = async () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }

    try {
      const res = await fetch(`${API}/members/nickname-available?nickname=${encodeURIComponent(nickname.trim())}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.isSuccess) {
        alert('사용 가능한 닉네임입니다.');
      } else {
        alert('이미 사용 중인 닉네임입니다.');
      }
    } catch (error) {
      alert('중복확인 중 오류가 발생했습니다.');
    }
  };

  const handleSignupSocial = async () => {
    try {
      const res = await fetch(`${API}/members/signup/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          nickname,
          provider,
          providerId,
          serviceAgreed: true,
          privacyAgreed: true,
        }),
      });

      const data = await res.json();

      if (res.ok && data.isSuccess) {
        navigate('/signup/complete', { state: { nickname } });
      } else {
        alert(data.message || '가입에 실패했습니다.');
      }
    } catch {
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  

  return (
    
    <div className="w-full max-w-[727px] mx-auto px-4 py-10">
  {/* Progress Bar */}
  <div className="relative flex justify-between items-center">
    {/* 회색 선 */}
    <div className="absolute top-[14px] left-[calc(100%/6)] w-[calc(100%*2/3)] h-[2px] bg-[#D1D1D1] z-0" />
    <div className="absolute top-[14px] left-[calc(100%/6)] w-[calc(100%*1/3)] h-[2px] bg-[#007AFF] z-0" />

    {/* Step 1 */}
    <div className="z-10 flex flex-col items-center w-1/3">
      <div className="w-[28px] h-[28px] rounded-full bg-[#007AFF] text-white text-[14px] font-bold flex items-center justify-center">
        1
      </div>
      <span className="mt-2 text-[#007AFF] text-[14px] font-semibold">약관 동의</span>
    </div>

    {/* Step 2 */}
    <div className="z-10 flex flex-col items-center w-1/3">
      <div className="w-[28px] h-[28px] rounded-full bg-[#007AFF] text-white text-[14px] font-bold flex items-center justify-center">
        2
      </div>
      <span className="mt-2 text-[#007AFF] text-[14px] font-semibold">회원 정보 입력</span>
    </div>

    {/* Step 3 */}
    <div className="z-10 flex flex-col items-center w-1/3">
      <div className="w-[28px] h-[28px] rounded-full bg-[#D1D1D1] text-black text-[14px] font-bold flex items-center justify-center">
        3
      </div>
      <span className="mt-2 text-[#A1A1A1] text-[14px] font-semibold">가입 완료</span>
    </div>
  </div>

 {/* Nickname Box */}
<div className="w-full h-screen mt-[-100px] flex items-center justify-center md:mt-[-100px] md:h-screen">
  <div
    className="
      border border-[#E6E6E6] rounded-[32px] font-[Pretendard]
      w-full max-w-[400px] p-6 flex flex-col justify-center gap-[80px]

      /* 모바일 전용 */
      max-md:w-[271px] max-md:h-[230px] max-md:p-[24px] max-md:gap-0 mt-[-100px]
    "
  >
    {/* 상단 텍스트 */}
    <div
      className="
        text-[20px] leading-[26px] font-medium text-[#333333] text-left ml-[10px] md:text-[20px] md:leading-[30px]

        /*  모바일 전용 */
        max-md:text-[16px] max-md:leading-[150%] max-md:tracking-[-0.01em] max-md:font-[500] 
      "
    >
      사용할 닉네임을 설정해주세요.
    </div>

    {/* 📱 모바일 전용 간격 */}
    <div className="hidden max-md:block h-[30px]" />

    {/* 입력 영역 */}
    <div className="flex flex-col gap-2 w-full max-w-[352px] mx-auto">
      <div
        className="
          flex flex-row justify-between items-center w-full h-[30px] px-[12px]

          /*  모바일 전용 */
           max-md:relative  max-md:h-[41px] max-md:px-0 max-md:gap-[40px]
        "
      >
        <div className="w-full
                    max-md:w-[200px] max-md:mx-auto max-md:flex max-md:items-center">
        <input
          className="
            text-[14px] text-[#333333] font-normal outline-none bg-transparent w-full placeholder-[#999999]

            /*  모바일 전용 */
            max-md:font-[500] max-md:pl-[10px]
          "
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="입력"
        />
        </div>


        <button
          className={`
            whitespace-nowrap text-[14px] rounded-[32px] px-[12px] py-[4px] transition-colors duration-200
            ${nickname.trim() 
              ? 'text-white bg-[#007AFF] hover:bg-[#0056CC]' 
              : 'text-[#A1A1A1] bg-[#E6E6E6] cursor-not-allowed'
            }
            /* 모바일 전용 */
            max-md:w-[62px] max-md:h-[25px] max-md:text-[11px] max-md:font-[500] max-md:pr-[-20px]
          `}
          style={{ fontWeight: 500 }}
          onClick={handleCheckNickname}
          disabled={!nickname.trim()}
        >
          중복확인
        </button>
      </div>
      <div
        className="
          ml-[10px] w-[328px] border-b border-[#A1A1A1]

          /* 모바일 전용 */
          max-md:w-[204px] max-md:mx-auto
        "
      />
    </div>

    {/*  모바일 전용 간격 */}
    <div className="hidden max-md:block h-[40px]" />

    {/* 다음 버튼 */}
    <button
      className="
        cursor-pointer w-full h-[52px] bg-[#007AFF] text-white text-[16px] font-semibold rounded-[999px] md:h-[60px] md:text-[18px]

        /* 모바일 전용 */
        max-md:w-[223px] max-md:h-[37px] max-md:text-[14px] max-md:font-[500] max-md:rounded-[32px]
      "
      onClick={handleSignupSocial}
      disabled={!nickname.trim()}
    >
      다음
    </button>
  </div>
</div>

</div>

  );
}