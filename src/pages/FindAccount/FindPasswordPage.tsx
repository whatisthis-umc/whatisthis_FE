//src/pages/FindAccount/FindPasswordPage.tsx
import { useNavigate } from 'react-router-dom';
import arrowDown from '/src/assets/arrow_down.png';
import { useState } from 'react';
import { getErrorMessage, sendResetCode, verifyResetCode } from '../../api/findAccount';

export default function FindPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [domain, setDomain] = useState('');
  const [code, setCode] = useState('');
  const [userId, setUserId] = useState('');

  const [emailErrMsg, setEmailErrMsg] = useState("");
  const [sendMsg, setSendMsg] = useState("");   // 성공/안내 메시지
  const [errMsg, setErrMsg] = useState("");     // 에러 메시지
  const [loading, setLoading] = useState(false);
 const canSend = email.trim() !== "" && domain.trim() !== "";



  const isFilled = email.trim() !== "" && domain.trim() !== "";
  const isValid = email.trim() !== '' && domain.trim() !== '' && code.trim() !== '' && userId.trim() !== '';

  const onSendCode = async () => {
  if (!isFilled || loading) return;

  setErrMsg("");
  setSendMsg("");
  // 이메일 행 에러 리셋
  setEmailErrMsg("");

  // 어떤 방식으로 보낼지 결정: 아이디가 있으면 아이디 우선, 없으면 이메일
  
  const emailLocal  = email.trim().toLowerCase();
  const emailDomain = domain.trim().toLowerCase();

  // 간단 검증 (도메인에 점 포함, 길이 등)
  if (!/^[^\s@]+$/.test(emailLocal)) {
    setErrMsg("이메일 앞부분 형식이 올바르지 않습니다.");
    return;
  }
  if (!/^[^\s@]+\.[^\s@]+$/.test(emailDomain)) {
    setErrMsg("도메인을 정확히 선택하세요.");
    return;
  }
  try {
    setLoading(true);
     
    const res = await sendResetCode({ emailLocal, emailDomain }); // ✅ memberId 절대 X
    if (res.isSuccess) {
      setSendMsg("입력하신 정보로 인증 코드가 발송되었습니다.");
    }  else {
      // 서버가 200이지만 실패코드 주는 경우
      setEmailErrMsg(res.message || "인증코드 발송에 실패했습니다.");
    }
  } catch (e: any) {
    const code = e?.response?.data?.code;
    const status = e?.response?.status;
    // 이메일 관련 실패(예: 미가입/잘못된요청)는 이메일 아래로
    if (code === "MEMBER4040" || status === 404) {
      setEmailErrMsg("해당 이메일로 가입된 계정이 없습니다. 다시 확인해주세요.");
    } else if (code === "COMMON4000" || status === 400) {
      setEmailErrMsg("잘못된 요청입니다. 이메일을 다시 확인해주세요.");
    } else {
      // 그 외 예외는 공통 에러(버튼 위)
      setErrMsg(getErrorMessage(e));
    }
  } finally {
    setLoading(false);
  }
};

const [, setVerifyMsg] = useState(""); // 성공 안내
const [codeErrMsg, setCodeErrMsg] = useState("");
const [idErrMsg, setIdErrMsg] = useState("");

// 다음 버튼 활성 조건: 이메일+도메인+코드+아이디가 모두 채워졌을 때
const canNext =
  email.trim() !== "" &&
  domain.trim() !== "" &&
  code.trim() !== "" &&
  userId.trim() !== "";

// 다음 버튼 핸들러: 검증 → 성공 시 이동
const onNext = async () => {
  if (!canNext || loading) return;
  setErrMsg(""); 
  setVerifyMsg("");  
  setCodeErrMsg("");
  setIdErrMsg("");

  const body = {
    emailLocal: email.trim().toLowerCase(),
    emailDomain: domain.trim().toLowerCase(),
    code: code.trim(),
    memberId: userId.trim(),
  };

  try {
    setLoading(true);
    const res = await verifyResetCode(body);

    if (res.isSuccess) {
      navigate("/find/password-reset", { state: body });
    } else {
      if (res.code === "MEMBER4040") {
        setIdErrMsg("존재하지 않는 회원입니다.");
      } else if (res.code === "EMAIL4000") {
        setCodeErrMsg("인증 코드 번호가 일치하지 않습니다.");
      } else {
        setErrMsg(res.message || "인증에 실패했습니다.");
      }
    }
  } catch (e:any) {
  // ✅ HTTP 에러로 떨어진 경우도 라우팅
    const code = e?.response?.data?.code;
    const status = e?.response?.status;
    if (code === "MEMBER4040" || status === 404) {
      setIdErrMsg("존재하지 않는 회원입니다.");
    } else if (code === "EMAIL4000" || status === 400) {
      setCodeErrMsg("인증 코드 번호가 일치하지 않습니다.");
    } else {
      setErrMsg(getErrorMessage(e)); // 기타는 공통 에러(다음 버튼 위)
    }
  } finally {
    setLoading(false);
  }
};

  

  return (
    <div className="flex justify-center pt-[80px]">
      <div className="w-[319px] h-[552px] md:w-[481px] md:h-[692px] border border-[#E6E6E6] rounded-[32px] px-[24px] pt-[24px] box-content">
        {/* 탭 버튼 */}
        <div className="flex gap-[16px] md:gap-[24px]">
          <button 
          onClick={() => navigate('/find')}
          className="w-[120px] h-[37px] text-[16px] cursor-pointer md:w-[160px] md:h-[54px] rounded-[32px] bg-[#E6E6E6] text-[#999999] md:text-[20px] font-medium font-[Pretendard]">
            아이디 찾기
          </button>
          <button 
          onClick={() => navigate('/find/password')}
          className="w-[120px] h-[37px] text-[16px] cursor-pointer md:w-[160px] md:h-[54px] rounded-[32px] bg-[#0080FF] text-white md:text-[20px] font-medium font-[Pretendard]">
            비밀번호 찾기
          </button>
        </div>

        {/* 설명 텍스트 */}
        <div className="ml-[8px] mt-[60px] md:mt-[100px] text-[16px] md:text-[20px] font-medium font-[Pretendard] text-[#000000] leading-[150%] tracking-[-0.02em]">
          가입 시 입력한 이메일과 아이디를 입력해주세요.
        </div>

        {/* 이메일 입력 라인 */}
        <div className="ml-[8px] mt-[50px] flex items-center w-[270px] h-[28px] md:w-[433px] md:h-[32px]">
          <input
            type="text"
            placeholder="이메일 주소"
            className="w-[84px] md:w-[132px] h-[32px] pb-[6px] border-b border-[#999] text-[16px] placeholder-[#999] outline-none"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailErrMsg) setEmailErrMsg("");}}
          />
          <span className=" w-[15px] h-[24px] ml-[8px] mr-[8px] md:ml-[16px] md:mr-[16px] text-[#333333] text-[16px]">@</span>
          <div className="relative w-[84px] md:w-[148.5px] ">
            <select
              className="w-full h-[32px] pb-[6px] border-b border-[#999] appearance-none bg-transparent text-[16px] text-[#999999] pr-[24px]"
              value={domain}
              onChange={(e) => {
  setDomain(e.target.value);
  if (emailErrMsg) setEmailErrMsg("");
}}
            >
              <option value="" disabled hidden>선택</option>
              <option value="naver.com">naver.com</option>
              <option value="gmail.com">gmail.com</option>
              <option value="daum.net">daum.net</option>
            </select>
            <img
              src={arrowDown}
              className="w-[16px] h-[16px] absolute right-0 top-1/2 -translate-y-1/2"
              alt="arrow"
            />
          </div>

          <button
  onClick={onSendCode}
  disabled={!canSend || loading}
  className={`ml-[14px] w-[43px] h-[25px] text-[11px] md:ml-[32px] md:w-[49px] md:h-[29px] rounded-[32px] md:text-[14px] leading-[150%] tracking-[-0.01em] font-medium
    ${(!canSend || loading) ? 'bg-[#E6E6E6] text-[#999999]' : 'bg-[#0080FF] text-white'}`}
>
  {loading ? '전송중' : '전송'}
</button>
        </div>

        {/* 안내/에러 메시지 */}
  <div className="ml-[8px] mt-[8px] w-[270px] md:w-[433px]">
    {sendMsg && <p className="text-[12px] md:text-[14px] text-[#007AFF]">{sendMsg}</p>}
    {emailErrMsg && <p className="text-[11px] md:text-[14px] text-[#EE0000]">{emailErrMsg}</p>}
  </div>

        {/* 코드 입력 */}
        <div className=" ml-[8px] w-[223px] mt-[30px] md:mt-[50px] md:w-[433px]">
          <label className="text-[16px] font-medium font-[Pretendard] text-[#000000]">코드</label>
          <input
            type="text"
            placeholder="코드를 입력해주세요."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border-b pb-[6px] border-[#999] text-[14px] md:text-[16px] placeholder-[#999] outline-none mt-[4px] "
          />
          {codeErrMsg && <p className="text-[11px] md:text-[14px] text-[#EE0000] mt-[4px]">{codeErrMsg}</p>}
        </div>

        {/* 아이디 입력 */}
        <div className=" ml-[8px] w-[223px] mt-[30px]  md:mt-[50px] md:w-[433px]">
          <label className="text-[16px] font-medium font-[Pretendard] text-[#000000]">아이디</label>
          <input
            type="text"
            placeholder="설정하신 아이디를 입력해주세요."
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full border-b border-[#999] pb-[6px] text-[14px] md:text-[16px] placeholder-[#999] outline-none mt-[4px]"
          />
          {idErrMsg && <p className="text-[11px] md:text-[14px] text-[#EE0000] mt-[4px]">{idErrMsg}</p>}
        </div>

        {/* 다음 버튼 */}
        {errMsg && (
  <p className="mt-[10px] text-[11px] md:text-[14px] text-[#EE0000] ml-[15px]">
    {errMsg}
  </p>
)} 
        <button
          disabled={!isValid}
          onClick={onNext}
          className={`ml-[15px] mt-[70px] w-[271px] h-[37px] md:w-[433px] md:h-[54px] text-[14px] rounded-[32px] md:text-[20px] font-medium font-[Pretendard] leading-[150%] tracking-[-0.02em]
            ${isValid ? 'bg-[#0080FF] text-white' : 'bg-[#E6E6E6] text-[#999999]'}`}
        >
          
          다음
        </button>
      </div>
    </div>
  );
}