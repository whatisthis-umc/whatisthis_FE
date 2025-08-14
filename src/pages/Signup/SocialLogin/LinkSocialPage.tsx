// src/pages/Signup/SocialLogin/LinkSocialPage.tsx
import { useLocation, useNavigate } from 'react-router-dom';

export default function LinkSocialPage() {
  const { state } = useLocation() as {
    state?: { email?: string; provider?: string; providerId?: string };
  };
  const navigate = useNavigate();

  const email = state?.email ?? '';
  const provider = state?.provider ?? '';
  const providerId = state?.providerId ?? '';
  const API = import.meta.env.VITE_API_BASE_URL ;

   // 잘못된 접근 가드
  if (!email || !provider || !providerId) {
    navigate('/login', { replace: true, state: { error: '잘못된 접근입니다.' } });
    return null;
  }

  const handleLink = async () => {
  try {
    if (!API) throw new Error('API URL not set');

    const res = await fetch(`${API}/members/link-social`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' ,Accept: 'application/json' },
      credentials: 'include', // 쿠키 사용 시 필수
      body: JSON.stringify({
        email,        // useLocation()에서 받은 값
        provider,     // 'kakao' | 'naver' | 'google'
        providerId,   // 소셜 고유 id
      }),
    });

    const data = await res.json().catch(() => ({}));
      if (!res.ok || data.isSuccess === false) {
        throw new Error(data?.message || '연동에 실패했습니다.');
      }

      // (선택) me 호출로 세션 확인
      // await fetch(`${API}/members/me`, { credentials: 'include' });

      navigate('/community', { replace: true }); // ★ 오타 수정
    } catch (e: any) {
      alert(e?.message || '네트워크 오류가 발생했습니다.');
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
