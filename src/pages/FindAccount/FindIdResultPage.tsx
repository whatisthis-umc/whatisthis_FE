import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function FindIdResultPage() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: { maskedEmail?: string } };

  useEffect(() => {
    if (!state?.maskedEmail) {
      // state가 없으면 이전 화면으로 강제 이동
      navigate("/find", { replace: true });
    }
  }, [state, navigate]);

  if (!state?.maskedEmail) return null; 

  return (
    <div className="flex justify-center pt-[80px]">
      <div className="w-[304px] h-[218px] border border-[#E6E6E6] rounded-[32px] box-content pl-[24px] pt-[24px] md:w-[396px] md:h-[487px]">
        
        {/* 탭 버튼 */}
        <div className="flex gap-[16px] md:gap-[24px]">
          <button 
            onClick={() => navigate('/find')}
            className="cursor-pointer w-[120px] h-[37px] rounded-[32px] bg-[#0080FF] text-white text-[16px] md:w-[160px] md:h-[54px] md:text-[20px] font-medium font-[Pretendard]"
          >
            아이디 찾기
          </button>
          <button 
            onClick={() => navigate('/find/password')}
            className="cursor-pointer w-[120px] h-[37px] rounded-[32px] bg-[#E6E6E6] text-[#999999] text-[16px] md:w-[160px] md:h-[54px] md:text-[20px] font-medium font-[Pretendard]"
          >
            비밀번호 찾기
          </button>
        </div>

        {/* 안내 문구 */}
        <div className="md:ml-[12px]  mt-[60px] text-[16px] font-medium font-[Pretendard] text-[#000000] leading-[150%] tracking-[-0.02em] md:mt-[100px] md:text-[20px]">
          등록된 아이디는 아래와 같습니다.
        </div>

        {/* 아이디 결과 */}
        <div className="mt-[50px] md:mt-[70px] md:ml-[12px] ">
          <input
            type="text"
            value={state.maskedEmail}
            readOnly
            className="pb-[6px] w-[223px] h-[29px] border-b border-[#999] text-[16px] text-[#000000] font-medium font-[Pretendard] outline-none bg-transparent placeholder-[#999] md:w-[352px] md:h-[32px]"
          />
        </div>

        {/* 로그인 버튼: 모바일에서는 안 보이게 */}
        <button
          onClick={() => navigate('/login')}
          className="hidden md:block md:ml-[12px] md:mt-[130px] cursor-pointer w-[344px] h-[54px] mt-[90px] bg-[#0080FF] text-white rounded-[32px] text-[20px] font-medium font-[Pretendard] leading-[150%] tracking-[-0.02em]"
        >
          로그인
        </button>
      </div>
    </div>
  );
}
