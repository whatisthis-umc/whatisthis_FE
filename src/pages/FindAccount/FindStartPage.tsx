import { useNavigate } from 'react-router-dom';
import arrowDown from '/src/assets/arrow_down.png';
import { useState } from 'react';
import SelectDropdown from '../../components/common/SelectDropdown';
import { findId, getErrorMessage, splitEmail } from '../../api/findAccount';


export default function FindStartPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isValid = email.trim() !== '' && domain.trim() !== '';
  


  const handleSubmit = async () => {
    if (!isValid || loading) return;
    setError('');
    try {
      setLoading(true);
      // 이메일 한 칸 + 도메인 셀렉트 → API 바디 구성
      const { emailLocal } = splitEmail(`${email}@${domain}`);
      const resp = await findId({ emailLocal, emailDomain: domain.toLowerCase() });

      // 정상(200, isSuccess=true) → 결과 페이지로 이동
      if (resp?.isSuccess && resp?.result?.maskedEmail) {
        navigate('/find/id-result', { state: { maskedEmail: resp.result.maskedEmail } });
      } else {
        setError(resp?.message || '알 수 없는 오류가 발생했습니다.');
      }
    } catch (e: any) {
      // 404: "해당 이메일로 가입된 회원이 존재하지 않습니다."
      const msg = getErrorMessage(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex justify-center pt-[80px]">
      <div
        className="w-[318px] h-[242px] px-[24px] pt-[24px] border border-[#E6E6E6] rounded-[32px] box-content md:w-[481px] md:h-[309px]"
      >
        {/* 탭 버튼 */}
        <div className="flex justify-start gap-[16px] md:gap-[24px]">
          <button
            onClick={() => navigate('/find')}
            className="cursor-pointer w-[120px] h-[37px] rounded-[32px] bg-[#0080FF] text-white text-[16px] font-medium font-[Pretendard] md:w-[160px] md:h-[54px] md:text-[20px]"
          >
            아이디 찾기
          </button>
          <button
            onClick={() => navigate('/find/password')}
            className="cursor-pointer w-[120px] h-[37px] rounded-[32px] bg-[#E6E6E6] text-[#999999] text-[16px] font-medium font-[Pretendard] md:w-[160px] md:h-[54px] md:text-[20px]"
          >
            비밀번호 찾기
          </button>
        </div>

        {/* 설명 텍스트 */}
        <div className="mt-[60px] ml-[4px] text-[16px] font-medium font-[Pretendard] text-[#000000] leading-[150%] tracking-[-0.02em] md:mt-[100px] md:ml-[20px] md:text-[20px]">
          가입 시 사용한 이메일을 입력해주세요.
        </div>

        {/* 입력 라인 */}
        <div className="mt-[50px] ml-[4px] flex items-center w-[258px] h-[28px] md:w-[433px] md:mt-[30px] md:h-[61px] md:ml-[20px]">
          <input
            type="text"
            placeholder="이메일 주소"
            className="w-[84px] border-b border-[#999] outline-none pb-[6px] text-[16px] placeholder-[#999] pr-[4px] md:w-[132.5px]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <span className="ml-[8px] mr-[8px] text-[#3333333] text-[16px] w-[15px] h-[24px] md:ml-[24px] md:mr-[24px]">
            @
          </span>
          <div className="relative">
            <select
              className="w-[84px] border-b border-[#999] pb-[6px] appearance-none bg-transparent text-[16px] text-[#999999] pr-[24px] md:w-[132.5px]"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
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
            disabled={!isValid}
            onClick={handleSubmit}
            className={`
              ml-[8px] w-[43px] h-[25px] rounded-full text-[11px] font-medium
              ${isValid ? 'bg-[#0080FF] text-white' : 'bg-[#E6E6E6] text-[#999999]'}
              md:ml-[32px] md:w-[49px] md:h-[29px] md:text-[12px]
            `}
          >
            {loading ? '조회 중...' : '입력'}
          </button>
        </div>

        {/* 에러 메시지 */}
        <div className="mt-[10px] ml-[4px] text-[11px] text-[#EE0000] tracking-[-0.01em] leading-[150%] md:mt-[-11px]  md:ml-[20px] md:text-[14px]">
          {error}
        </div>
      </div>
    </div>
  );
}
