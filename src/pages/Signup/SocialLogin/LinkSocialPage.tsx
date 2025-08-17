// src/pages/Signup/SocialLogin/LinkSocialPage.tsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../../api/axiosInstance';

export default function LinkSocialPage() {
  const { state } = useLocation() as {
    state?: { email?: string; provider?: string; providerId?: string };
  };
  const navigate = useNavigate();

  const email = state?.email ?? '';
  const provider = state?.provider ?? '';
  const providerId = state?.providerId ?? '';

  // 배포 환경에서 혹시 http가 들어오면 강제로 https로 바꿔치기
  const RAW_API = import.meta.env.VITE_API_BASE_URL || '';
  const API = RAW_API.replace(/^http:\/\//, 'https://');

   // 잘못된 접근 가드
  useEffect(() => {
    if (!email || !provider || !providerId) {
      alert('잘못된 접근입니다.');
      navigate('/login');
      return;
    }
  }, [email, provider, providerId, navigate]);

  // URL 정리: conflict=true만 남기고 다른 파라미터들 모두 제거
  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const hasConflict = currentUrl.searchParams.get('conflict') === 'true';
    
    // conflict=true가 있으면 다른 파라미터들 모두 제거
    if (hasConflict) {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.search = '?conflict=true';
      
      // 현재 URL과 다르면 교체
      if (cleanUrl.toString() !== window.location.href) {
        window.history.replaceState({}, '', cleanUrl.toString());
      }
    }
  }, []);

  const handleLink = async () => {
    try {
      // axiosInstance의 baseURL을 사용하여 일관성 유지
      const res = await axiosInstance.post('/members/link-social', {
        email,        // useLocation()에서 받은 값
        provider,     // 'kakao' | 'naver' | 'google'
        providerId,   // 소셜 고유 id
      });

      if (res.data.isSuccess) {
        navigate('/community', { replace: true });
      } else {
        throw new Error(res.data.message || '연동에 실패했습니다.');
      }
    } catch (e: any) {
      console.error('연동 실패:', e);
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
function setShowErrorModal(arg0: boolean) {
  throw new Error('Function not implemented.');
}

