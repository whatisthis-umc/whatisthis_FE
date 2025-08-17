// src/pages/Signup/SocialLogin/LinkSocialPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LinkSocialPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // 절대주소 보장 (환경변수 잘못된 경우 대비)
  const ENV = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const API_BASE = ENV && ENV.startsWith('http') ? ENV : 'https://api.whatisthis.co.kr';

  // 주소 정리: conflict=true만 남기기
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('conflict') === 'true') {
      url.search = '?conflict=true';
      if (url.toString() !== window.location.href) {
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, []);

  const handleLink = async () => {
    try {
      setLoading(true);
      setErr(null);

      const res = await fetch(`${API_BASE}/members/link-social`, {
        method: 'POST',
        credentials: 'include',   // linkToken/세션 쿠키 전송
        // 바디/Content-Type 없음 (사전요청 줄이고 스펙에 맞춤)
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok || data.isSuccess === false) {
        throw new Error(data?.message || `연동 실패 (${res.status})`);
      }

      
      navigate('/community', { replace: true });
    } catch (e: any) {
      setErr(e?.message || '네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
    <div
      className="
        bg-white w-[686px] h-[249px] rounded-[40px] p-[40px]
        shadow-[0_8px_24px_rgba(0,0,0,0.12)]
        flex flex-col
      "
    >
      {/* 메시지 */}
      <p
        className="
          font-[Pretendard] font-bold text-[24px]
          leading-[150%] tracking-[-0.02em] text-[#333333]
          text-left ml-[20px] mt-[20px]
        "
      >
        기존 계정과 연동하시겠습니까?
      </p>

      {/* 버튼 영역 */}
      <div className="ml-[190px] mt-[50px] flex justify-center gap-[16px]">
        <button
          onClick={() => navigate('/login')}
          className="
            w-[160px] h-[54px] rounded-[32px]
            bg-[#0080FF] text-white
            font-[Pretendard] font-medium text-[20px]
            leading-[150%] tracking-[-0.02em]
            hover:brightness-95 active:brightness-90 transition
          "
        >
          취소
        </button>
        <button
          onClick={handleLink}
          className="
            w-[160px] h-[54px] rounded-[32px]
            bg-[#0080FF] text-white
            font-[Pretendard] font-medium text-[20px]
            leading-[150%] tracking-[-0.02em]
            hover:brightness-95 active:brightness-90 transition
          "
        >
          연동하기
        </button>
      </div>
    </div>
  </div>
);

}
function setShowErrorModal(arg0: boolean) {
  throw new Error('Function not implemented.');
}

