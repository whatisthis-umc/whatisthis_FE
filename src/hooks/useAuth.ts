// src/hooks/useAuth.ts
//전역 상태로 로그인 여부를 관리
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, []);

  return {
    isLoggedIn,
  };
};

// 어떤 컴포넌트든
/*

export default function SomeComponent() {
  

const { isLoggedIn } = useAuth(); 
   useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인 후 이용 가능한 페이지입니다.");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);
  }



} 안에 집어넣고 import 까지하기
*/