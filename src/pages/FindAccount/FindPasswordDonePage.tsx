
import { useNavigate } from "react-router-dom";

export default function FindPasswordDonePage() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center pt-[80px]">
      <div className="mt-[100px] w-[362px] text-center">
        {/* 성공 메시지 */}
        <div className=" text-[20px] md:text-[24px] font-bold leading-[150%] tracking-[-0.02em]">
          비밀번호가 성공적으로 변경되었습니다.
        </div>

        {/* 서브 텍스트 */}
        <div className="ml-[30px] md:ml-[0px] text-left text-[16px] mt-[16px] mb-[60px] md:text-[20px] font-medium leading-[150%] tracking-[-0.02em] text-[#000000]">
          이제 새로운 비밀번호로 로그인 할 수 있습니다.
        </div>

        {/* 로그인 버튼 */}
        <button
          onClick={() => navigate("/login")}
          className=" w-[302px] h-[37px] text-[14px] cursor-pointer md:w-[362px] md:h-[54px] bg-[#0080FF] text-white rounded-full 
                     md:text-[20px] font-medium leading-[150%] tracking-[-0.02em]"
        >
          로그인
        </button>
      </div>
    </div>
  );
}
