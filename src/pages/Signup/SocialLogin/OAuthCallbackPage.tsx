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

// 브라우저 환경 정보 수집 함수
const collectBrowserInfo = () => {
  return {
    userAgent: navigator.userAgent,
    browser: getBrowserName(),
    version: getBrowserVersion(),
    cookiesEnabled: navigator.cookieEnabled,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    onLine: navigator.onLine,
    cookieCount: document.cookie.split(';').length,
    localStorageAvailable: !!window.localStorage,
    sessionStorageAvailable: !!window.sessionStorage
  };
};

// 브라우저 이름 추출
const getBrowserName = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) return 'Internet Explorer';
  return 'Unknown';
};

// 브라우저 버전 추출
const getBrowserVersion = () => {
  const userAgent = navigator.userAgent;
  const match = userAgent.match(/(chrome|firefox|safari|edge|msie|trident(?=\/))\/?\s*(\d+)/i);
  return match ? match[2] : 'Unknown';
};

// 에러 정보를 서버로 전송하는 함수
const sendErrorReport = async (error: any, browserInfo: any, oauthParams: any) => {
  try {
    await axiosInstance.post('/api/oauth-error-report', {
      error: {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        response: error?.response?.data,
        status: error?.response?.status
      },
      browserInfo,
      oauthParams,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });
    console.log('에러 리포트 전송 완료');
  } catch (reportError) {
    console.error('에러 리포트 전송 실패:', reportError);
  }
};


// 소셜 로그인 콜백 페이지
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
      } catch (error: any) {
        // 1단계: 에러 로그 수집
        console.error(' OAuth 콜백 처리 실패:', {
          message: error?.message,
          stack: error?.stack,
          response: error?.response?.data,
          status: error?.response?.status,
          url: window.location.href,
          searchParams: Object.fromEntries(qp.entries())
        });

        // 2단계: 브라우저 환경 정보 수집
        const browserInfo = collectBrowserInfo();
        console.log('브라우저 환경 정보:', browserInfo);

        // 에러 리포트 전송 (서버에 API가 있다면)
        const oauthParams = { isNew, conflict, error };
        await sendErrorReport(error, browserInfo, oauthParams);

        // 사용자를 로그인 페이지로 이동
        navigate('/login', { 
          replace: true,
          state: { 
            error: '소셜 로그인 처리 중 오류가 발생했습니다. 다시 시도해 주세요.',
            errorDetails: {
              message: error?.message,
              browser: browserInfo.browser,
              version: browserInfo.version
            }
          }
        });
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
