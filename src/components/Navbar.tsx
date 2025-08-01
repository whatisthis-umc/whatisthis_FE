import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { profile, favorite, bookmark, logo, menu } from "../assets";
import Searchbar from "./Searchbar";
import Sidebar from "./Sidebar";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAdmin =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/adminlogin"; //admin관리자 부분은 navbar 숨겨야해서
  const currentPath = location.pathname;
  const handleSearch = (input: string) => {
    navigate(`/search?keyword=${encodeURIComponent(input)}`);
  };

  const getButton = (path: string) => {
    const isActive = currentPath.startsWith(path);
    return `text-sm sm:text-lg md:text-xl w-[80px] sm:w-[100px] md:w-[116px] h-[36px] sm:h-[45px] md:h-[54px] rt-[24px] bt-[12px] lt-[24px] rounded-4xl cursor-pointer
    ${isActive ? "bg-black text-white" : "bg-white text-black"}`;
  };
  if (isAdmin) return null; //admin 관리자 부분은 navbar 적용 안해야함
  return (
    <div className="sticky w-full">
      <div className="hidden sm:flex justify-end w-full gap-3">
        <button className="cursor-pointer" onClick={() => navigate("/login")}>
          로그인/회원가입
        </button>
        <button
          className="cursor-pointer"
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
