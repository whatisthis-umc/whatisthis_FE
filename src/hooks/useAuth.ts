// src/hooks/useAuth.ts
//전역 상태로 로그인 여부를 관리
import { useEffect, useState } from 'react';
import { axiosInstance } from '../api/axiosInstance';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 로그인 상태 체크 함수
  const checkLoginStatus = () => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
    setIsLoading(false);
  };

  // 로그인 함수
  const login = (accessToken: string, refreshToken?: string) => {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    setIsLoggedIn(true);
    setIsLoading(false);
    console.log('✅ 로그인 상태 설정 완료');
  };

  // 로그아웃 함수
  const logout = async () => {
    try {
      // 로그아웃 API 호출
      await axiosInstance.post('/members/logout');
      console.log('✅ 로그아웃 API 호출 성공');
    } catch (error) {
      console.error('❌ 로그아웃 API 호출 실패:', error);
      // API 호출 실패해도 클라이언트에서는 로그아웃 처리
    } finally {
      // localStorage에서 토큰 삭제
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsLoggedIn(false);
      console.log('✅ 로그아웃 상태 설정 완료');
    }
  };

  useEffect(() => {
    checkLoginStatus();
    
    // 로그인 상태 변경 감지를 위한 이벤트 리스너
    const handleStorageChange = () => {
      checkLoginStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    isLoggedIn,
    isLoading,
    login,  // 로그인 함수 제공
    logout, // 로그아웃 함수 제공
  };
};

// 어떤 컴포넌트든
/*

export default function SomeComponent() {
  

  const { isLoggedIn, isLoading, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      setShowModal(true);
    }
  }, [isLoggedIn, isLoading]);

  if (!isLoggedIn && showModal) {
    return <LoginModal onClose={() => setShowModal(false)} />;
  }

  // 로그아웃 버튼 클릭 시
  <button onClick={logout}>로그아웃</button>

} 안에 집어넣고 import 까지하기
39*/