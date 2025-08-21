// src/pages/Signup/SocialLogin/OAuthCallbackPage.tsx
import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../../api/axiosInstance';

function toBool(v: string | null): boolean | null {
  if (v === null) return null;
  const s = v.toLowerCase();
  if (s === 'true') return true;
  if (s === 'false') return false;
  return null;
}

export default function OAuthCallbackPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const qp = useMemo(() => new URLSearchParams(search), [search]);

  const isNew        = toBool(qp.get('isNew'));            // true | false | null
  const conflict     = toBool(qp.get('conflict'));         // true | null
  const error        = qp.get('error');                    // 'conflict-provider' | null

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // 소셜 로그인 성공 후 /auth/bootstrap 호출하여 토큰 발급
        const bootstrapRes = await axiosInstance.post('/auth/bootstrap');
        
        if (bootstrapRes.data?.isSuccess && bootstrapRes.data?.result) {
          // 토큰을 localStorage에 저장
          const { accessToken, refreshToken } = bootstrapRes.data.result;
          if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
            console.log('accessToken 저장됨');
          }
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
            console.log('refreshToken 저장됨');
          }
        }

        // 3) 다른 소셜과 이미 연동된 이메일
        if (error === 'conflict-provider') {
          navigate('/login', {
            replace: true,
            state: { error: '이미 다른 소셜과 연동된 계정입니다.' },
          });
          return;
        }

        // 1) 기존 일반계정은 있는데 소셜 연동 안 됨 → 연동 안내
        if (conflict === true) {
          // state 없이 이동 (서버 세션이 모든 정보 보유)
           navigate('/link-social', { replace: true });
          return;
        }

        // 4) 신규 유저 → 약관 동의 + 닉네임 설정 플로우 시작
        if (isNew === true) {
          // 소셜 플로우 표식만 전달
          navigate('/signup', { replace: true, state: { from: 'social' } });
          return;
        }

        // 2) 연동까지 완료된 기존 소셜 회원 → 바로 로그인 처리 완료 화면/홈으로
        if (isNew === false) {
          navigate('/community', { replace: true });
          return;
        }

        // 안전장치
        navigate('/login', { replace: true });
      } catch (error) {
        console.error(' OAuth 콜백 처리 실패:', error);
        navigate('/login', { replace: true });
      }
    };

    handleOAuthCallback();
  }, [isNew, conflict, error, navigate]);

  return (
    <div className="w-full h-screen flex items-center justify-center text-[#666]">
      소셜 로그인 처리 중...
    </div>
  );
}
