import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import checkIcon from '/src/assets/_check .png';

export default function AgreementPage() {
  const navigate = useNavigate();

  const [termsChecked, setTermsChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [allChecked, setAllChecked] = useState(false);

  const handleAllChange = (checked: boolean) => {
    setAllChecked(checked);
    setTermsChecked(checked);
    setPrivacyChecked(checked);
  };

  const handleNext = () => {
    if (termsChecked && privacyChecked) {
      navigate('/signup/nickname');
    } else {
      alert('모든 필수 항목에 동의해주세요.');
    }
  };

  return (
    <>
      {/* 전체 wrapper */}
      <div className="w-full max-w-[727px] mx-auto px-4 py-10">
        {/* Progress Bar */}
        <div className="relative flex justify-between items-center mb-12">
          {/* 선 */}
          <div className="absolute top-[14px] left-[calc(100%/6)] w-[calc(100%*2/3)] h-[2px] bg-[#D1D1D1] z-0" />

          {/* Step 1 */}
          <div className="z-10 flex flex-col items-center w-1/3">
            <div className="w-[28px] h-[28px] rounded-full bg-[#007AFF] text-white text-[14px] font-bold flex items-center justify-center">
              1
            </div>
            <span className="mt-2 text-[#007AFF] text-[14px] font-semibold">약관 동의</span>
          </div>

          {/* Step 2 */}
          <div className="z-10 flex flex-col items-center w-1/3">
            <div className="w-[28px] h-[28px] rounded-full bg-[#D1D1D1] text-black text-[14px] font-bold flex items-center justify-center">
              2
            </div>
            <span className="mt-2 text-[#A1A1A1] text-[14px] font-semibold">회원 정보 입력</span>
          </div>

          {/* Step 3 */}
          <div className="z-10 flex flex-col items-center w-1/3">
            <div className="w-[28px] h-[28px] rounded-full bg-[#D1D1D1] text-black text-[14px] font-bold flex items-center justify-center">
              3
            </div>
            <span className="mt-2 text-[#A1A1A1] text-[14px] font-semibold">가입 완료</span>
          </div>
        </div>

        {/* 약관 동의 영역 */}
        <div className="flex justify-center">
          <div className="w-[1032px] mx-auto">
            <p className="text-[20px] font-bold leading-[150%] text-[#000000] mb-[12px]">서비스 이용 약관 동의</p>
            <div
        className="w-[1032px] h-[200px] border border-[#E6E6E6]"
        style={{
          borderTopLeftRadius: '32px',
          borderTopRightRadius: '16px',
          borderBottomRightRadius: '16px',
          borderBottomLeftRadius: '32px',
        }}
      >
        <div
          className="w-full h-full overflow-y-scroll pr-[8px] custom-scroll"
    
        >
           <div className="p-6">
            여기에 서비스 이용 약관 내용이 들어갑니다.
          </div>
        </div>
      </div>
             {/* 체크박스 */}
      <div className="flex justify-end items-center gap-[10px] mt-4">
        <p className="font-bold text-[16px] leading-[150%] text-[#0080FF]">필수</p>
        <div
          className="w-[24px] h-[24px] rounded-[32px] bg-[#E6E6E6] flex justify-center items-center cursor-pointer"
          onClick={() => {
      const newTerms = !termsChecked;
      setTermsChecked(newTerms);
      setAllChecked(newTerms && privacyChecked); // 둘 다 체크됐을 때만 전체 체크
    }}
        >
          {termsChecked && (
            <img
              src={checkIcon}
              alt="check"
              width={16}
              height={16}
            />
          )}
        </div>
        <p className="text-[#333333] text-[16px] leading-[150%] font-medium">동의합니다.</p>
      </div>
    </div>
    </div>
    </div>

     <div className="flex justify-center">
          <div className="w-[1032px] mx-auto">
            <p className="text-[20px] font-bold leading-[150%] text-[#000000] mb-[12px]">개인정보 접근 동의</p>
            <div
        className="w-[1032px] h-[200px] border border-[#E6E6E6]"
        style={{
          borderTopLeftRadius: '32px',
          borderTopRightRadius: '16px',
          borderBottomRightRadius: '16px',
          borderBottomLeftRadius: '32px',
        }}
      >
        <div
          className="w-full h-full overflow-y-scroll pr-[8px] custom-scroll"
        >
           <div className="p-6">
            {Array(50)
    .fill(
      `이용약관 더미 텍스트입니다. 이 영역에 긴 텍스트가 들어가야 스크롤이 생깁니다. 이 문장은 반복되어 채워집니다.`
    )
    .map((line, idx) => (
      <p key={idx} className="mb-2">
        {line}
      </p>
    ))}
          </div>
        </div>
      </div>
             {/* 체크박스 */}
      <div className="flex justify-end items-center gap-[10px] mt-4">
        <p className="font-bold text-[16px] leading-[150%] text-[#0080FF]">필수</p>
        <div
          className="w-[24px] h-[24px] rounded-[32px] bg-[#E6E6E6] flex justify-center items-center cursor-pointer"
          onClick={() => {
      const newPrivacy = !privacyChecked;
      setPrivacyChecked(newPrivacy);
      setAllChecked(termsChecked && newPrivacy); // 둘 다 체크됐을 때만 전체 체크
    }}
        >
          {privacyChecked && (
            <img
              src={checkIcon}
              alt="check"
              width={16}
              height={16}
            />
          )}
        </div>
        <p className="text-[#333333] text-[16px] leading-[150%] font-medium">동의합니다.</p>
      </div>
    </div>
    </div>
    {/* 전체 동의 및 다음 버튼 */}
<div className="flex flex-col items-center mt-6 gap-6">
  {/* 전체 동의 체크 */}
  <div
    className="flex items-center gap-[8px] cursor-pointer"
    onClick={() => {
      handleAllChange(!allChecked); 
    }}
  >
    <div className="w-[24px] h-[24px] rounded-full bg-[#E6E6E6] flex items-center justify-center">
      {allChecked && (
        <img src={checkIcon} alt="check" width={16} height={16} />
      )}
    </div>
    <span className="text-[#333333] text-[16px] font-medium">모든 항목에 동의합니다.</span>
  </div>

  {/* 다음 버튼 */}
  <button
    className="w-[160px] h-[48px] rounded-full bg-[#007AFF] text-white text-[16px] font-semibold hover:bg-[#0061cc]"
    onClick={handleNext}
  >
    다음
  </button>
</div>




    </>
  );
}
