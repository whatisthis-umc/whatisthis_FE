import React from "react";
import { useNavigate } from "react-router-dom";

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal = ({ onClose }: LoginModalProps) => {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-[Pretendard]">
      <div className="bg-white rounded-2xl p-12 w-full max-w-[640px]">
        <h2 className="text-[24px] font-bold mb-6 text-left text-[#333333] leading-[32px]">
          이 기능은 로그인 후 이용 가능합니다.
        </h2>

        <p className="text-[16px] text-[#333333] mb-10 text-left leading-[24px] ">
          로그인하시겠습니까?
        </p>

        <div className="flex flex-col gap-6 mb-2">
          <div className="flex justify-end gap-4 ">
            <button
              onClick={() => navigate("/login")}
              className="text-white flex items-center justify-center text-[18px] font-normal"
              style={{
                backgroundColor: "#0080FF",
                width: "160px",
                height: "54px",
                borderRadius: "32px",
                padding: "12px 32px",
                fontFamily: "Pretendard",
              }}
            >
              로그인
            </button>

            <button
              onClick={onClose}
              className="text-white flex items-center justify-center text-[18px] font-normal gap-2"
              style={{
                backgroundColor: "#0080FF",
                width: "160px",
                height: "54px",
                borderRadius: "32px",
                padding: "12px 32px",
                fontFamily: "Pretendard",
              }}
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
