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
  const API = import.meta.env.VITE_API_URL ;

  const handleLink = async () => {
    try {
      // 백엔드에서 /members/link-social 만들어지면 주석 해제
      // const res = await fetch(`${API}/members/link-social`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   credentials: 'include', // 쿠키 사용할 경우
      //   body: JSON.stringify({ provider, providerId }),
      // });
      // if (!res.ok) throw new Error('link failed');

      // 연동 성공 시 원하는 페이지로 이동
      navigate('/community', { replace: true });
    } catch (e) {
      alert('연동에 실패했습니다. 잠시 후 다시 시도해주세요.');
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
