// src/pages/Signup/SocialLogin/OAuthCallbackPage.tsx
import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';


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

  // Query 파싱
  const qp = useMemo(() => new URLSearchParams(search), [search]);
  const isNew        = toBool(qp.get('isNew'));            // true | false | null
  const conflict     = toBool(qp.get('conflict'));         // true | null
  const error        = qp.get('error');                    // 'conflict-provider' | null



  // 로컬 테스트 토큰(운영에선 사용 안 함)
  const accessToken  = qp.get('accessToken');
  const refreshToken = qp.get('refreshToken');

  useEffect(() => {
    // 로컬 테스트용 토큰 저장
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
      // state 없이 이동 (서버 세션이 모든 정보 보유)
       navigate('/link-social', { replace: true });
      return;
    }

    // 4) 신규 유저 → 약관 동의 + 닉네임 설정 플로우 시작
    if (isNew === true) {
      // state 없이 이동
      navigate('/signup', { replace: true });
      return;
    }

    // 2) 연동까지 완료된 기존 소셜 회원 → 바로 로그인 처리 완료 화면/홈으로
    if (isNew === false) {
      navigate('/community', { replace: true });
      return;
    }

    // 안전장치
    navigate('/login', { replace: true });
  },  [isNew, conflict, error, accessToken, refreshToken, navigate]);

  return (
    <div className="w-full h-screen flex items-center justify-center text-[#666]">
      소셜 로그인 처리 중...
    </div>
  );
}
