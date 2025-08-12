import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { profile, favorite, bookmark, logo, menu } from "../assets";
import Searchbar from "./Searchbar";
import Sidebar from "./Sidebar";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인
  useEffect(() => {
    const checkLoginStatus = () => {
      const accessToken = localStorage.getItem("accessToken");
      setIsLoggedIn(!!accessToken);
    };

    checkLoginStatus();

    // 주기적으로 로그인 상태 확인
    const interval = setInterval(checkLoginStatus, 100);

    const handleStorageChange = () => {
      checkLoginStatus();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const isAdmin =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/adminlogin"; //admin관리자 부분은 navbar 숨겨야해서
  const currentPath = location.pathname;
  // 커뮤니티 활성 조건: /community* 또는 /post/:id (단수) /posts/:id (복수) 모두 허용
  const isCommunityActivePath =
    currentPath.startsWith("/community") ||
    /^\/post\/[^/]+$/.test(currentPath) || // 단수 경로
    /^\/posts\/[^/]+$/.test(currentPath); // 복수 경로(혹시 쓸 때 대비)

  const handleSearch = (input: string) => {
    navigate(`/search?keyword=${encodeURIComponent(input)}`);
  };

  const handleLoginLogout = () => {
    if (isLoggedIn) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setIsLoggedIn(false);
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  const getButton = (path: string) => {
    const isActive =
      path === "/community"
        ? isCommunityActivePath
        : currentPath.startsWith(path);
    return `text-sm sm:text-lg md:text-xl w-[80px] sm:w-[100px] md:w-[116px] h-[36px] sm:h-[45px] md:h-[54px] rt-[24px] bt-[12px] lt-[24px] rounded-4xl cursor-pointer
    ${isActive ? "bg-black text-white" : "bg-white text-black"}`;
  };

  if (isAdmin) return null; //admin 관리자 부분은 navbar 적용 안해야함

  return (
    <div className="sticky w-full">
      <div className="hidden sm:flex justify-end w-full gap-3">
        <button
          className="cursor-pointer hover:font-semibold transition-all"
          onClick={handleLoginLogout}
        >
          {isLoggedIn ? "로그아웃" : "로그인/회원가입"}
        </button>
        <button
          className="cursor-pointer hover:font-semibold transition-all"
          onClick={() => navigate("/customer/notice")}
        >
          고객센터
        </button>
      </div>
      {/*모바일*/}
      <div className="flex items-center justify-between mt-1 px-4 py-2 md:hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <img
          src={menu}
          alt="메뉴"
          className="w-7 h-7"
          onClick={() => setIsSidebarOpen(true)}
        />
        <img
          src={logo}
          alt="로고"
          className="w-[50px] h-[27px] cursor-pointer"
          onClick={() => navigate("/")}
        />
        <div className="flex items-center gap-4">
          <Searchbar onSearch={handleSearch} />
        </div>
      </div>
      <div className="flex justify-center  gap-0 md:hidden mt-1 px-2">
        <button
          className={getButton("/tips")}
          onClick={() => navigate("/tips")}
        >
          생활꿀팁
        </button>
        <button
          className={getButton("/items")}
          onClick={() => navigate("/items")}
        >
          생활꿀템
        </button>
        <button
          className={getButton("/community")}
          onClick={() => navigate("/community")}
        >
          커뮤니티
        </button>
      </div>

      {/*PC*/}
      <div className="hidden md:flex items-center justify-between px-6 py-3 relative w-full">
        <div className="flex items-center">
          <img
            src={logo}
            alt="로고"
            className="w-[72px] h-[36px] cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex gap-6">
          <button
            className={getButton("/tips")}
            onClick={() => navigate("/tips")}
          >
            생활꿀팁
          </button>
          <button
            className={getButton("/items")}
            onClick={() => navigate("/items")}
          >
            생활꿀템
          </button>
          <button
            className={getButton("/community")}
            onClick={() => navigate("/community")}
          >
            커뮤니티
          </button>
        </div>
        <div className="flex items-center gap-3">
          <img
            src={profile}
            className="w-14 h-14 cursor-pointer"
            onClick={() => navigate("/my")}
          />
          <img
            src={favorite}
            className="w-14 h-14 cursor-pointer"
            onClick={() => navigate("/likes")}
          />
          <img
            src={bookmark}
            className="w-14 h-14 cursor-pointer"
            onClick={() => navigate("/scrap")}
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
