import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestEmailAuthCode } from "../../api/auth/email";
import { signup } from "../../api/auth/signup";

export default function SignUpInfoPage() {
  const navigate = useNavigate();

  const [emailPrefix, setEmailPrefix] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [code, setCode] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const isEmailValid = emailPrefix !== "" && emailDomain !== "";
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  // 이메일 조합
  const fullEmail = `${emailPrefix}@${emailDomain}`;

  // 전송 버튼 핸들러
const handleEmailSend = async () => {
  try {
    await requestEmailAuthCode(fullEmail);
    alert("인증 코드가 이메일로 전송되었습니다!");
  } catch (error: any) {
    alert(`인증 실패: ${error.message}`);
  }
};


const handleSubmit = async () => {
  try {
    const email = `${emailPrefix}@${emailDomain}`;

    await signup({
      email,
      emailAuthCode: code,        // 인증 코드
      memberId: userId,           // 아이디
      password,
      passwordCheck: confirmPassword,
      nickname,
      serviceAgreed: true,        // true 고정 (동의 했다고 가정)
      privacyAgreed: true         // true 고정
    });

    // 성공 시 완료 페이지 이동
    navigate("/signup/complete", {
      state: {
        email,
        userId,
        nickname,
      },
    });

  } catch (error: any) {
    const resData = error.response?.data;

    const fieldErr: { [key: string]: string } = {};
    setFieldErrors({});
    setGeneralError(null);

    if (resData?.result && typeof resData.result === "object") {
      // 🔹 result에 필드별 오류 있는 경우
      Object.entries(resData.result).forEach(([key, msg]) => {
        fieldErr[key] = msg as string;
      });
      setFieldErrors(fieldErr);

    } else if (resData?.message) {
      // message만 있는 경우
      const msg = resData.message;

      // 키워드 기반으로 필드 지정
      if (msg.includes("아이디")) {
        setFieldErrors({ memberId: msg });
      } else if (msg.includes("닉네임")) {
        setFieldErrors({ nickname: msg });
      } else if (msg.includes("비밀번호")) {
        setFieldErrors({ password: msg });
      } else if (msg.includes("인증 코드")) {
        setFieldErrors({ emailAuthCode: msg });
      } else {
        setGeneralError(msg);
      }
    } else {
      setGeneralError("알 수 없는 오류가 발생했습니다.");
    }
  }
};


  return (
    
    <div className="w-full max-w-[727px] mx-auto px-4 py-10">
  {/* Progress Bar */}
  <div className="relative flex mt-[80px]  mb-[80px] justify-between items-center">
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

{/* 입력 박스 */}
  
  <div className="flex justify-center items-start w-full">
    <div className="
      w-[319px] h-[630px] px-[24px] py-[24px]
      md:w-[400px] md:h-auto md:px-[24px] md:py-[24px] 
      rounded-[24px] bg-white border border-[#E6E6E6] 
    ">
      {/* 이메일 전송 줄 */}
      <div className="flex items-center gap-[8px] mb-[30px] pl-[12px] md:pl-[0px]">
        <input
          className=" md:w-[132.5px]  w-[84px] text-[14px] font-normal text-[#333] border-b border-[#A1A1A1] outline-none bg-transparent"
          placeholder="이메일 주소"
          type="text"
          value={emailPrefix}
          onChange={(e) => setEmailPrefix(e.target.value)}
        />
        <span className="text-[14px] text-[#333]">@</span>
        <select
          className="md:w-[132.5px]  w-[84px] text-[14px] border-b border-[#A1A1A1] bg-transparent appearance-none pr-6"
          style={{ backgroundImage: `url(/src/assets/arrow_down.png)`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right center' }}
          value={emailDomain}
          onChange={(e) => setEmailDomain(e.target.value)}
        >
          <option value="">선택</option>
          <option value="naver.com">naver.com</option>
          <option value="gmail.com">gmail.com</option>
          <option value="daum.net">daum.net</option>
        </select>
        <button
  className={`
    cursur-pointer w-[43px] h-[25px] text-[11px] rounded-full 
    ${isEmailValid ? "bg-[#007AFF] text-white" : "bg-[#E6E6E6] text-[#999999]"}
    ml-[12px] 
  `}
  disabled={!isEmailValid}
  onClick={handleEmailSend}
>
  전송
</button>
      </div>

        {/* 코드, 아이디, 비밀번호, 닉네임 */}
        {[
  { name: "emailAuthCode",label: "코드", value: code, setter: setCode, placeholder: "코드를 입력해주세요." },
  { name: "memberId", label: "아이디", value: userId, setter: setUserId, placeholder: "설정하실 아이디를 입력해주세요." },
  { name: "password",label: "비밀번호", value: password, setter: setPassword, placeholder: "설정하실 비밀번호를 입력해주세요." },
  { name: "passwordCheck", label: "비밀번호 확인", value: confirmPassword, setter: setConfirmPassword, placeholder: "비밀번호를 다시 입력해주세요." },
  { name: "nickname", label: "닉네임", value: nickname, setter: setNickname, placeholder: "닉네임을 입력해주세요." },
].map(({ name, label, value, setter, placeholder }, i) => (
  <div
    key={i}
    className="
      mb-[30px]                // 모바일 기준 간격
      pl-[12px]           // 모바일 여백
      md:pl-0             // 데스크탑에서는 원래대로
      md:mb-6                 // md 이상에서는 기존대로 유지
    "
  >
    <label
      className="
        block text-[16px] text-[#333333] mb-[4px]   // 모바일 label
        md:text-[14px] md:mb-1                      // md 이상에서 원래대로
      "
    >
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => setter(e.target.value)}
      placeholder={placeholder}
      className="
        w-[204px] text-[14px] pb-1 border-b border-[#A1A1A1] outline-none placeholder-[#A1A1A1]
        md:w-full                                      // 데스크탑에서는 꽉 차게
      "
    />
    {/* 에러 메시지 추가 */}
    {fieldErrors[name] && (
      <p className="text-[12px] text-red-500 mt-[4px]">
        {fieldErrors[name]}
      </p>
    )}
    
  </div>
))}
{/* 일반 오류 메시지 추가 */}
{generalError && (
  <div className="text-center text-red-600 text-sm mb-4">
    {generalError}
  </div>
)}

        {/* 회원가입 버튼 */}
        <button
          onClick={handleSubmit}
          className="mt-4 w-full h-[44px] bg-[#007AFF] text-white text-[14px] font-semibold rounded-full"
        >
          회원가입
        </button>
      </div>
    </div>
  </div>
  );
}