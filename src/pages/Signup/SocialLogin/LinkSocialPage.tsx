// src/pages/Signup/SocialLogin/LinkSocialPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../../api/axiosInstance';
import { useAuth } from '../../../hooks/useAuth';

export default function LinkSocialPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth(); // useAuth의 login 함수 사용
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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
    setLoading(true);
    setErr(null);
    try {
      console.log('🔗 연동 시작...');
      
      // 1) 연동 (서버에서 /auth/bootstrap 호출하여 토큰 발급)
      const linkRes = await axiosInstance.post('/members/link-social'); // 바디 없음, 쿠키 기반
      console.log('✅ 연동 API 응답:', linkRes.data);
      
      // 2) /auth/bootstrap 호출하여 토큰 발급
      console.log('🔑 토큰 발급 중...');
      const bootstrapRes = await axiosInstance.post('/auth/bootstrap');
      console.log('✅ /auth/bootstrap 응답:', bootstrapRes.data);
      
      if (bootstrapRes.data?.isSuccess && bootstrapRes.data?.result) {
        // useAuth의 login 함수 사용
        const { accessToken, refreshToken } = bootstrapRes.data.result;
        authLogin(accessToken, refreshToken);
        console.log('✅ 연동 및 로그인 완료!');
        navigate('/community', { replace: true });
        return;
      }

      // 토큰 발급 실패
      throw new Error('토큰 발급에 실패했습니다.');
    } catch (err: any) {
      console.error('❌ 연동 실패:', err);
      console.error('❌ 에러 응답:', err?.response?.data);
      
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      
      if (status === 401) {
        alert('로그인 세션이 없습니다. 다시 시도해 주세요.');
        navigate('/login', { replace: true });
      } else {
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
          
          /* 모바일 전용 */
          max-md:w-[320px] max-md:h-[180px] max-md:p-4 max-md:rounded-[24px]
        "
      >
        {/* 메시지 */}
        <p
          className="
            font-[Pretendard] font-bold text-[24px]
            leading-[150%] tracking-[-0.02em] text-[#333333]
            text-left ml-[20px] mt-[20px]
            
            /* 모바일 전용 */
            max-md:text-center max-md:text-[18px] max-md:ml-0 max-md:mt-5 max-md:mb-6
          "
        >
          기존 계정과 연동하시겠습니까?
        </p>

        {/* 버튼 영역 */}
        <div className="ml-[190px] mt-[50px] flex justify-center gap-[16px]
          /* 모바일 전용 */
          max-md:ml-0 max-md:mt-0 max-md:gap-2
        ">
          <button
            onClick={() => navigate('/login')}
            className="
              w-[160px] h-[54px] rounded-[32px]
              bg-[#0080FF] text-white
              font-[Pretendard] font-medium text-[20px]
              leading-[150%] tracking-[-0.02em]
              hover:brightness-95 active:brightness-90 transition
              
              /* 모바일 전용 */
              max-md:w-[110px] max-md:h-[40px]  max-md:text-[16px] max-md:rounded-[24px]
            "
          >
            취소
          </button>
          <button
            onClick={handleLink}
            disabled={loading}
            className="
              w-[160px] h-[54px] rounded-[32px]
              bg-[#0080FF] text-white
              font-[Pretendard] font-medium text-[20px]
              leading-[150%] tracking-[-0.02em]
              hover:brightness-95 active:brightness-90 transition
              disabled:opacity-50 disabled:cursor-not-allowed
              
              /* 모바일 전용 */
              max-md:w-[110px] max-md:h-[40px] max-md:text-[16px] max-md:rounded-[24px]
            "
          >
            {loading ? '연동 중...' : '연동하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

