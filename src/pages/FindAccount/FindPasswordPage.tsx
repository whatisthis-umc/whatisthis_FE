
import { useNavigate } from 'react-router-dom';
import arrowDown from '/src/assets/arrow_down.png';
import { useState } from 'react';

export default function FindPasswordPage() {
  const [email, setEmail] = useState('');
  const [domain, setDomain] = useState('');
  const [code, setCode] = useState('');
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  const isFilled = email.trim() !== "" && domain.trim() !== "";
  const isValid = email.trim() !== '' && domain.trim() !== '' && code.trim() !== '' && userId.trim() !== '';

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
          가입 시 입력한 이메일을 입력해주세요.
        </div>

        {/* 이메일 입력 라인 */}
        <div className="ml-[8px] mt-[50px] flex items-center w-[270px] h-[28px] md:w-[433px] md:h-[32px]">
          <input
            type="text"
            placeholder="이메일 주소"
            className="w-[84px] md:w-[132px] h-[32px] pb-[6px] border-b border-[#999] text-[16px] placeholder-[#999] outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <span className=" w-[15px] h-[24px] ml-[8px] mr-[8px] md:ml-[16px] md:mr-[16px] text-[#333333] text-[16px]">@</span>
          <div className="relative w-[84px] md:w-[148.5px] ">
            <select
              className="w-full h-[32px] pb-[6px] border-b border-[#999] appearance-none bg-transparent text-[16px] text-[#999999] pr-[24px]"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            >
              <option value="" disabled hidden>선택</option>
              <option value="naver.com">naver.com</option>
              <option value="google.com">google.com</option>
              <option value="daum.net">daum.net</option>
            </select>
            <img
              src={arrowDown}
              className="w-[16px] h-[16px] absolute right-0 top-1/2 -translate-y-1/2"
              alt="arrow"
            />
          </div>

          <button
  disabled={!isFilled}
  className={`ml-[14px] w-[43px] h-[25px] text-[11px]  md:ml-[32px] md:w-[49px] md:h-[29px] rounded-[32px] md:text-[14px] leading-[150%] tracking-[-0.01em] font-medium
    ${isFilled ? 'bg-[#0080FF] text-white' : 'bg-[#E6E6E6] text-[#999999]'}`}
>
            전송
          </button>
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
        </div>

        {/* 아이디 입력 */}
        <div className=" ml-[8px] w-[223px] mt-[30px]  md:mt-[50px] md:w-[433px]">
          <label className="text-[16px] font-medium font-[Pretendard] text-[#000000]">아이디</label>
          <input
            type="text"
            placeholder="설정하실 아이디를 입력해주세요."
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full border-b border-[#999] pb-[6px] text-[14px] md:text-[16px] placeholder-[#999] outline-none mt-[4px]"
          />
        </div>

        {/* 다음 버튼 */}
        <button
          disabled={!isValid}
          onClick={() => navigate('/find/password-reset')}
          className={`ml-[15px] mt-[120px] w-[271px] h-[37px] md:w-[433px] md:h-[54px] text-[14px] rounded-[32px] md:text-[20px] font-medium font-[Pretendard] leading-[150%] tracking-[-0.02em]
            ${isValid ? 'bg-[#0080FF] text-white' : 'bg-[#E6E6E6] text-[#999999]'}`}
        >
          다음
        </button>
      </div>
    </div>
  );
}