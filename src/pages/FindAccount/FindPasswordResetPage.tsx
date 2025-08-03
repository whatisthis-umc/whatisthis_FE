import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FindPasswordResetPage() {
  const navigate = useNavigate();
   const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isFilled = password.trim() !== "" && confirmPassword.trim() !== "";
  const handleSubmit = () => {
    if (isFilled) {
      navigate("/find/password-done");
    }
  };
  return (
    <div className="flex justify-center pt-[100px]">
      <div
        className="
          w-[304px] h-[380px] md:w-[393.5px] md:h-[484px] rounded-[32px] border border-[#E6E6E6] p-[24px] 
          box-border flex flex-col justify-start"
      >
        {/* 탭 버튼 */}
        <div className="flex gap-[16px] md:gap-[24px]">
          <button 
          onClick={() => navigate('/find')}
          className="w-[256px] h-[37px] text-[16px] cursor-pointer md:w-[160px] md:h-[54px] rounded-[32px] bg-[#E6E6E6] text-[#999999] md:text-[20px] font-medium font-[Pretendard]">
            아이디 찾기
          </button>
          <button 
          onClick={() => navigate('/find/password')}
          className="w-[256px] h-[37px] text-[16px] cursor-pointer md:w-[160px] md:h-[54px] rounded-[32px] bg-[#0080FF] text-white md:text-[20px] font-medium font-[Pretendard]">
            비밀번호 찾기
          </button>
        </div>


        {/* 안내 문구 */}
        <div className="ml-[8px] mt-[60px] md:mt-[100px] text-[16px]  md:text-[20px] font-medium leading-[150%] tracking-[-0.02em] mb-[50px] md:mb-[40px]">
          새 비밀번호를 입력해주세요.
        </div>

        {/* 입력창 2개 */}
        <div className="ml-[8px] flex flex-col gap-[8px] md:gap-[24px]">
          <div>
            <input
              name="password"
              type="password"
              placeholder="입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-[223px] h-[29px]  md:w-[328px] md:h-[32px] text-[16px] font-medium leading-[150%] tracking-[-0.01em] 
                placeholder-[#999999] border-b border-[#999999] 
                focus:outline-none"
              
            />
          </div>
          <div>
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="입력"
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="
                w-[223px] h-[29px] md:w-[328px] md:h-[32px]  text-[16px] font-medium leading-[150%] tracking-[-0.01em] 
                placeholder-[#999999] border-b border-[#999999] 
                focus:outline-none"
            
            />
          </div>
        </div>

        {/* 비밀번호 변경 버튼 */}
        <button
          disabled={!isFilled}
          onClick={handleSubmit}
          className={`
            mt-[50px] w-[256px] h-[37px] text-[14px] md:mt-[70px] md:w-[344px] md:h-[54px] rounded-full md:text-[20px] font-medium leading-[150%] tracking-[-0.02em]
            ${isFilled ? "bg-[#0080FF] text-white" : "bg-[#E6E6E6] text-[#999999]"}
            transition-colors duration-200
          `} >
          비밀번호 변경
        </button>
      </div>
    </div>
  );
}
