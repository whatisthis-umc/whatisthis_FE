// src/pages/Signup/SocialLogin/LinkSocialPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../../api/axiosInstance';

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
    setLoading(true);
    setErr(null);
    try {
      // 1) 연동
      await axiosInstance.post('/members/link-social'); // 바디 없음, 쿠키 기반

      // 2) 로그인 상태 확인
      const meRes = await axiosInstance.get('/members/me'); // 쿠키 포함
      
      // 응답 구조 확인 (Swagger 문서 기준)
      if (meRes.data?.isSuccess && meRes.data?.result) {
        // 사용자 정보 저장 (자동 로그인을 위해)
        const userInfo = meRes.data.result;
        console.log('연동 성공, 사용자 정보:', userInfo);
        
        // 토큰이 있다면 저장 (쿠키 기반이지만 혹시 헤더에 토큰이 올 수도 있음)
        const authHeader = meRes.headers?.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          localStorage.setItem('accessToken', token);
        }
        
        navigate('/community', { replace: true });
        return;
      }

      // 응답 구조가 예상과 다른 경우
      throw new Error('사용자 정보를 가져올 수 없습니다.');
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      
      if (status === 401) {
        alert('로그인 세션이 없습니다. 다시 시도해 주세요.');
        navigate('/login', { replace: true });
      } else {
        console.error('연동 실패:', err);
        setErr(msg || '연동에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      }
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

