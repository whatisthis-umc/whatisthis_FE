import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { logo } from "../assets";
import { useAuth } from "../hooks/useAuth";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { logout } = useAuth(); // logout 함수만 사용

  // 로그인 상태 체크
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('accessToken');
      setIsLoggedIn(!!token);
    };

    checkLoginStatus();

    // 주기적으로 체크 (간단하게)
    const interval = setInterval(checkLoginStatus, 100);
    
    return () => clearInterval(interval);
  }, []);

  const handleClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogin = () => {
    navigate("/login");
    onClose();
  };

  const handleSignup = () => {
    navigate("/signup");
    onClose();
  };
  
  // 로그아웃
  const handleLogout = async () => {
    await logout(); // useAuth의 logout 함수 사용 (API 호출 + localStorage 삭제)
    setIsLoggedIn(false); // 로컬 상태도 업데이트
    onClose();
    // 홈페이지로 이동
    navigate("/");
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[1000] flex">
      <div className="fixed inset-0 bg-black opacity-30" onClick={onClose} />
      <div className="relative w-[238px] rounded-r-3xl bg-white shadow-xl p-5">
        <img src={logo} alt="로고" className="ml-2 mt-2 w-[50px] h-[27px]" />
        <div className="mt-15">
          <ul className="space-y-2">
            <li
              className="p-2 rounded hover:bg-gray-100 cursor-pointer"
              onClick={() => handleClick("/my")}
            >
              마이페이지
            </li>
            <li
              className="p-2 rounded hover:bg-gray-100 cursor-pointer"
              onClick={() => handleClick("/likes")}
            >
              나의 좋아요
            </li>
            <li
              className="p-2 rounded hover:bg-gray-100 cursor-pointer"
              onClick={() => handleClick("/scrap")}
            >
              나의 스크랩
            </li>
            <li
              className="p-2 rounded hover:bg-gray-100 cursor-pointer"
              onClick={() => handleClick("/customer/notice")}
            >
              고객센터
            </li>
          </ul>
        </div>
        <div className="mt-70 absolute bottom-10">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="w-[80px] h-[40px] border-2 rounded-4xl px-3 py-2 cursor-pointer ml-2 bg-[#0080FF] text-white text-[14px] hover:bg-red-600 transition-colors"
            >
              로그아웃
            </button>
          ) : (
            <>
              <button
                onClick={handleLogin}
                className="w-[80px] h-[40px] border-2 rounded-4xl px-3 py-2 cursor-pointer ml-2 bg-[#0080FF] text-white text-[14px] hover:bg-blue-600 transition-colors"
              >
                로그인
              </button>
              <button
                onClick={handleSignup}
                className="w-[80px] h-[40px] border-2 rounded-4xl px-3 py-2 cursor-pointer ml-2 bg-[#0080FF] text-white text-[14px] hover:bg-blue-600 transition-colors"
              >
                회원가입
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Sidebar;
