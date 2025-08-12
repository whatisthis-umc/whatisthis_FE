// src/pages/Signup/SocialLogin/OAuthCallbackPage.tsx
import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type Provider = 'kakao' | 'naver' | 'google';

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

  // 쿼리
  const isNew        = toBool(qp.get('isNew'));            // true | false | null
  const conflict     = toBool(qp.get('conflict'));         // true | null
  const error        = qp.get('error');                    // 'conflict-provider' | null
  const email        = qp.get('email');
  const provider     = qp.get('provider') as Provider | null;
  const providerId   = qp.get('providerId');
  const accessToken  = qp.get('accessToken');              // 로컬 테스트용
  const refreshToken = qp.get('refreshToken');             // 로컬 테스트용

  useEffect(() => {
    // 로컬 테스트에서만 사용 (배포에선 HttpOnly 쿠키 예정)
    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
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
      navigate('/link-social', {
        replace: true,
        state: { email, provider, providerId },
      });
      return;
    }

    // 4) 신규 유저 → 약관 동의 + 닉네임 설정 플로우 시작
    if (isNew === true) {
      // 너가 쓰는 회원가입 단계 라우트로 맞춰줘. (예: /signup/agreement)
      navigate('/signup', {
        replace: true,
        state: { email, provider, providerId, from: 'social' },
      });
      return;
    }

    // 2) 연동까지 완료된 기존 소셜 회원 → 바로 로그인 처리 완료 화면/홈으로
    if (isNew === false) {
      navigate('/community', { replace: true });
      return;
    }

    // 안전장치
    navigate('/login', { replace: true });
  }, [
    isNew, conflict, error,
    email, provider, providerId,
    accessToken, refreshToken, navigate
  ]);

  return (
    <div className="w-full h-screen flex items-center justify-center text-[#666]">
      소셜 로그인 처리 중...
    </div>
  );
}
