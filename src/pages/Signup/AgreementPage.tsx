import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
<<<<<<< HEAD
import { TERMS_TEXT } from '../../data/termsText';
import { PRIVACY_TEXT } from '../../data/privacyText';
import { checkCircle, checkedCircle } from '../../assets';

// --- 마크다운 라이트 렌더러: **굵게** + 문단/줄바꿈만 처리 ---
function mdLiteToHtml(md: string) {
  // 1) HTML 이스케이프
  const escaped = md
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

  // 2) **bold** 표현
  const withBold = escaped.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[#111]">$1</strong>');

  // 3) 문단 분리(빈 줄 기준), 문단 내부 줄바꿈은 <br/>
  const paragraphs = withBold
    .split(/\n{2,}/)
    .map(p => `<p class="my-0">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');

  return paragraphs;
}

function FormattedLegal({ raw }: { raw: string }) {
  return (
    <div
      className="
        p-[16px] md:p-6 text-[14px] md:text-[15px]
        leading-[180%] tracking-[-0.01em] text-[#333]
        whitespace-pre-wrap break-keep
        space-y-4
      "
      dangerouslySetInnerHTML={{ __html: mdLiteToHtml(raw) }}
    />
  );
}
=======
import checkCircle from '/src/assets/check_circle.svg';
import checkedCircle from '/src/assets/checked_circle.svg';
>>>>>>> dev

export default function AgreementPage() {
  const navigate = useNavigate();

  const [termsChecked, setTermsChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [allChecked, setAllChecked] = useState(false);

  //  OAuthCallbackPage에서 넘겨준 값 받기 (일반 가입이면 state는 없을 수 있음)
  const { state } = useLocation() as {
    state?: { from?: 'social'; email?: string; provider?: string; providerId?: string };
  };

   useEffect(() => {
    console.log('Agreement state ▶', state); // 컴포넌트 내부에서 확인
  }, [state]);

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
    if (state?.from === 'social') {
      // 소셜 가입 플로우 → 닉네임 설정
      navigate('/signup/socialnickname', { state }); // email, provider, providerId 그대로 전달
    } else {
      // 일반 가입 플로우 → 기존 Info 페이지
      navigate('/signup/nickname');
    }
  };

  return (
    <>
      {/* 전체 wrapper */}
      <div className="w-[343px] h-[672px] md:w-full md:max-w-[727px] md:px-4 md:py-10 mx-auto">
        {/* Progress Bar */}
        <div className="relative flex justify-between items-center  md:mb-12 mt-[80px] md:mt-0">
          <div className="absolute top-[14px] left-[calc(100%/6)] w-[calc(100%*2/3)] h-[2px] bg-[#D1D1D1] z-0" />

          <div className="z-10 flex flex-col items-center w-1/3">
            <div className="w-[28px] h-[28px] rounded-full bg-[#007AFF] text-white text-[14px] font-bold flex items-center justify-center">
              1
            </div>
            <span className="mt-2 text-[#007AFF] text-[14px] font-semibold">약관 동의</span>
          </div>

          <div className="z-10 flex flex-col items-center w-1/3">
            <div className="w-[28px] h-[28px] rounded-full bg-[#D1D1D1] text-black text-[14px] font-bold flex items-center justify-center">
              2
            </div>
            <span className="mt-2 text-[#A1A1A1] text-[14px] font-semibold">회원 정보 입력</span>
          </div>

          <div className="z-10 flex flex-col items-center w-1/3">
            <div className="w-[28px] h-[28px] rounded-full bg-[#D1D1D1] text-black text-[14px] font-bold flex items-center justify-center">
              3
            </div>
            <span className="mt-2 text-[#A1A1A1] text-[14px] font-semibold">가입 완료</span>
          </div>
        </div>

        {/* 약관 동의 */}
        <div className="flex justify-center">
          <div className="w-[343px] md:w-[1032px] mx-auto mt-[60px]">
            <p className="text-[16px] md:text-[20px] font-bold leading-[150%] text-[#000000] mb-[10px]">서비스 이용 약관 동의</p>
            <div className="w-[343px] h-[160px] md:w-[1032px] md:h-[200px] border border-[#E6E6E6] rounded-[8px] md:rounded-[0] md:style-custom">
              <div className="w-full h-full overflow-y-scroll pr-[8px] custom-scroll">
                <FormattedLegal raw={TERMS_TEXT} />
              </div>
            </div>
            <div className="flex justify-end items-center gap-[10px] mt-4">
              <p className="font-bold text-[16px] leading-[150%] text-[#0080FF]">필수</p>
              <div
<<<<<<< HEAD
                className="w-[24px] h-[24px] rounded-full  bg-white flex justify-center items-center cursor-pointer"
=======
                className="w-[24px] h-[24px] rounded-full bg-white  flex justify-center items-center cursor-pointer"
>>>>>>> dev
                onClick={() => {
                  const newTerms = !termsChecked;
                  setTermsChecked(newTerms);
                  setAllChecked(newTerms && privacyChecked);
                }}
              >
                <img 
                src={termsChecked ? checkedCircle : checkCircle} 
                alt="check" 
<<<<<<< HEAD
                width={27} 
                height={27} 
=======
                width={27} height={27} 
>>>>>>> dev
                />
              </div>
              <p className="text-[#333333] text-[16px] leading-[150%] font-medium">동의합니다.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-[343px] md:w-[1032px] mx-auto">
            <p className="text-[16px] md:text-[20px] font-bold leading-[150%] text-[#000000] mb-[10px]">개인정보 접근 동의</p>
            <div className="w-[343px] h-[160px] md:w-[1032px] md:h-[200px] border border-[#E6E6E6] rounded-[8px] md:rounded-[0] md:style-custom">
              <div className="w-full h-full overflow-y-scroll pr-[8px] custom-scroll">
                <FormattedLegal raw={PRIVACY_TEXT} />
              </div>
            </div>
            <div className="flex justify-end items-center gap-[10px] mt-4">
              <p className="font-bold text-[16px] leading-[150%] text-[#0080FF]">필수</p>
              <div
<<<<<<< HEAD
                className="w-[24px] h-[24px] rounded-full  bg-white flex justify-center items-center cursor-pointer"
=======
                className="w-[24px] h-[24px] rounded-full bg-white  flex justify-center items-center cursor-pointer"
>>>>>>> dev
                onClick={() => {
                  const newPrivacy = !privacyChecked;
                  setPrivacyChecked(newPrivacy);
                  setAllChecked(termsChecked && newPrivacy);
                }}
              >
                <img 
<<<<<<< HEAD
                src={privacyChecked ? checkedCircle : checkCircle}
                alt="check" 
                width={27} 
                height={27} 
=======
                src={privacyChecked ? checkedCircle : checkCircle} 
                alt="check" 
                width={27} height={27} 
>>>>>>> dev
                />
              </div>
              <p className="text-[#333333] text-[16px] leading-[150%] font-medium">동의합니다.</p>
            </div>
          </div>
        </div>

        {/* 전체 동의 및 다음 버튼 */}
        <div className="flex flex-col items-center mt-[32px] gap-[8px]">
          <div
            className="flex items-center gap-[8px] cursor-pointer"
            onClick={() => handleAllChange(!allChecked)}
          >
<<<<<<< HEAD
            <div className="w-[20px] h-[20px] rounded-full bg-white flex items-center justify-center">
              <img
    src={allChecked ? checkedCircle : checkCircle}
    alt="check"
    width={20}
    height={20}
  />
=======
            <div className="mt-[-5px] w-[20px] h-[20px] rounded-full bg-white flex items-center justify-center">
              <img 
              src={allChecked ? checkedCircle : checkCircle} 
              alt="check" 
              width={21} height={21} 
              />
>>>>>>> dev
            </div>
            <span className="text-[#333333] text-[16px] font-medium">모든 항목에 동의합니다.</span>
          </div>

          <button
            className="w-[181px] h-[37px] text-[14px] rounded-full bg-[#007AFF] text-white font-semibold hover:bg-[#0061cc] mt-[8px]"
            onClick={handleNext}
          >
            다음
          </button>
        </div>
      </div>
    </>
  );
}
