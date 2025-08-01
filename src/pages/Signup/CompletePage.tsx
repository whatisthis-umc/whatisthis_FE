import { useLocation, useNavigate } from 'react-router-dom';

export default function SignupCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const nickname = location.state?.nickname || '사용자';

  return (
    <div className="w-full max-w-[727px] mx-auto px-4 py-10 font-[Pretendard]">
      {/* Progress Bar */}
      <div className="relative flex justify-between items-center mt-[80px] md:mt-0 mb-[60px] md:mb-12">
        <div className="absolute top-[14px] left-[calc(100%/6)] w-[calc(100%*2/3)] h-[2px] bg-[#007AFF] z-0" />

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
          <div className="w-[28px] h-[28px] rounded-full bg-[#007AFF] text-white text-[14px] font-bold flex items-center justify-center">
            3
          </div>
          <span className="mt-2 text-[#007AFF] text-[14px] font-semibold">가입 완료</span>
        </div>
      </div>

      {/* 가입 완료 메시지 */}
      <div className="w-full max-w-[465px] mx-auto flex flex-col items-center gap-4">
        {/* 타이틀 */}
        <h1 className="text-[24px] font-bold leading-[150%] tracking-[-0.02em] text-[#333333] text-center">
          가입완료!
        </h1>

        {/* 설명 문구 */}
        <p className="text-[20px] font-medium leading-[150%] tracking-[-0.02em] text-[#333333] text-center mb-13 hidden md:block">
          {nickname}님, 이게 뭐예요?의 회원으로 가입해주셔서 감사합니다.
          <br />
          생활 꿀팁을 보러 가볼까요?
        </p>

        {/* 모바일 줄바꿈 버전 */}
        <p className="text-[20px] font-medium leading-[150%] tracking-[-0.02em] text-[#333333] text-center mb-13 block md:hidden">
          {nickname}님, 이게 뭐예요?의 회원으로
          <br />
          가입해주셔서 감사합니다.
          <br />
          생활 꿀팁을 보러 가볼까요?
        </p>
      </div>

      {/* 버튼 영역 */}
      <div className="flex gap-4 justify-center mt-8">
        <button
          onClick={() => navigate('/')}
          className="cursor-pointer w-[120px] h-[48px] bg-[#007AFF] text-white text-[16px] font-medium rounded-full"
        >
          홈으로
        </button>
        <button
          onClick={() => navigate('/tips')}
          className="cursor-pointer w-[120px] h-[48px] bg-[#007AFF] text-white text-[16px] font-medium rounded-full"
        >
          생활꿀팁
        </button>
      </div>
    </div>
  );
}
