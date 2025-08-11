import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getErrorMessage, resetPassword } from "../../api/findAccount";

export default function FindPasswordResetPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [pwErrMsg, setPwErrMsg] = useState("");       // 비번 형식 에러 (첫 입력 아래)
  const [pw2ErrMsg, setPw2ErrMsg] = useState("");     // 일치 에러 (두번째 입력 아래)
  const [errMsg, setErrMsg] = useState("");           // 기타 에러(버튼 위)
  const [loading, setLoading] = useState(false);

   // 간단 정책: 8~64자, 공백 없음
  const isPwFormatOk =
    password.length >= 8 && password.length <= 64 && !/\s/.test(password);
  const isMatch = password !== "" && password === confirmPassword;

  const canSubmit = isPwFormatOk && isMatch && !loading;

  const handleSubmit = async () => {
    // 프론트 유효성 체크
    setPwErrMsg("");
    setPw2ErrMsg("");
    setErrMsg("");

    if (!isPwFormatOk) {
      setPwErrMsg("8자 이상 64자 이하로 입력해주세요. 공백은 사용할 수 없습니다.");
      return;
    }
    if (!isMatch) {
      setPw2ErrMsg("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setLoading(true);
      const res = await resetPassword({
        newPassword: password,
        confirmPassword: confirmPassword,
      });

      if (res.isSuccess) {
        navigate("/find/password-done");
      } else {
        // 서버 코드에 따라 메시지 분기 (필요시 추가)
        if (res.code?.startsWith("AUTH") || res.code === "EMAIL4010") {
          setErrMsg("인증이 만료되었습니다. 처음부터 다시 진행해주세요.");
        } else {
          setErrMsg(res.message || "비밀번호 변경에 실패했습니다.");
        }
      }
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        setErrMsg("인증이 만료되었습니다. 처음부터 다시 진행해주세요.");
      } else {
        setErrMsg(getErrorMessage(e));
      }
    } finally {
      setLoading(false);
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
              onChange={(e) => {
                setPassword(e.target.value);
                if (pwErrMsg) setPwErrMsg("");
                if (errMsg) setErrMsg("");
              }}
              className="
                w-[223px] h-[29px]  md:w-[328px] md:h-[32px] text-[16px] font-medium leading-[150%] tracking-[-0.01em] 
                placeholder-[#999999] border-b border-[#999999] 
                focus:outline-none"
              
            />
            {pwErrMsg && (
              <p className="text-[12px] md:text-[14px] text-[#EE0000] mt-[6px]">
                {pwErrMsg}
              </p>
            )}
          </div>
          <div>
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="입력"
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (pw2ErrMsg) setPw2ErrMsg("");
                if (errMsg) setErrMsg("");
              }}
              className="
                w-[223px] h-[29px] md:w-[328px] md:h-[32px]  text-[16px] font-medium leading-[150%] tracking-[-0.01em] 
                placeholder-[#999999] border-b border-[#999999] 
                focus:outline-none"
            />
            {pw2ErrMsg && (
              <p className="text-[12px] md:text-[14px] text-[#EE0000] mt-[6px]">
                {pw2ErrMsg}
              </p>
            )}
          </div>
        </div>

        {/* 버튼 위 에러 */}
        {errMsg && (
          <p className="mt-[16px] text-[12px] md:text-[14px] text-[#EE0000]">
            {errMsg}
          </p>
        )}

        {/* 비밀번호 변경 버튼 */}
        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className={`
            mt-[25px] w-[256px] h-[37px] text-[14px] md:mt-[70px] md:w-[344px] md:h-[54px] rounded-full md:text-[20px] font-medium leading-[150%] tracking-[-0.02em]
            ${canSubmit ?  "bg-[#0080FF] text-white" : "bg-[#E6E6E6] text-[#999999]"}
            transition-colors duration-200
          `} >
          {loading ? "변경 중..." : "비밀번호 변경"}
        </button>
      </div>
    </div>
  );
}
