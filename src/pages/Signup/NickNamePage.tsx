import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function SignupNicknamePage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');



  return (
    
    <div className="w-full max-w-[727px] mx-auto px-4 py-10">
      {/* Progress Bar */}
      <div className="relative flex justify-between items-center ">
        {/* 선 */}
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
      <div className="w-full h-screen mt-[-100px] flex items-center justify-center">
       <div className="w-[400px] h-[337px] p-6 border border-[#E6E6E6] rounded-[32px] flex flex-col gap-[80px] font-[Pretendard] justify-center">
      {/* 상단 텍스트 */}
      <div className="text-[20px] leading-[30px] font-medium text-[#333333] text-center">
        사용할 닉네임을 설정해주세요.
      </div>

      {/* 입력 영역 */}
      <div className="flex flex-col gap-2 w-[352px] mx-auto">
            <div className="flex flex-row justify-between items-center w-[352px] h-[30px] px-[12px]">
              <input
                className="text-[14px] text-[#333333] font-normal outline-none bg-transparent w-full"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="입력"
              />
          <button
            className="whitespace-nowrap text-[14px] text-[#A1A1A1] bg-[#E6E6E6] rounded-[32px] px-[12px] py-[4px]"
            style={{ fontWeight: 500 }}
            onClick={() => alert('중복확인 로직은 추후 구현됩니다.')}
          >
            중복확인
          </button>
        </div>
        <div className="w-full border-b border-[#A1A1A1]" />
      </div>

      {/* 다음 버튼 */}
      <button
        className="cursor-pointer w-full h-[60px] bg-[#007AFF] text-white text-[18px] font-semibold rounded-[999px] "
        onClick={() => navigate("/signup/complete",{ state: { nickname } })}
      >
        다음
      </button>
    </div>
    </div>
    </div>

  );
}
