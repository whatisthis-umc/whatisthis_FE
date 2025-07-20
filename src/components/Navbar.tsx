import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { profile } from "../assets";
import { favorite } from "../assets";
import { bookmark } from "../assets";

import logo from "/src/assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/adminlogin"; //admin관리자 부분은 navbar 숨겨야해서
  const currentPath = location.pathname;

  const getButton = (path: string) => {
    const isActive = currentPath.startsWith(path);
    return `text-xl w-[116px] h-[54px] rt-[24px] bt-[12px] lt-[24px] rounded-4xl cursor-pointer
    ${isActive ? "bg-black text-white" : "bg-white text-black"}`;
  };
  if (isAdmin) return null; //admin 관리자 부분 은 navbar 적용 안해야함
  return (
    <div className="sticky w-full">
      <div className="flex justify-end w-full gap-3">
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
      <div className="flex justify-between items-center w-full py-2 mt-2">
        <img
          src={logo}
          alt="로고"
          className="w-[72px] h-[36px] ml-15 cursor-pointer"
          onClick={() => navigate("/")}
        ></img>

        <div className="flex gap-3 justify-center items-center">
          <button
            className={getButton("/tips")}
            onClick={() => {
              navigate("/tips");
            }}
          >
            생활꿀팁
          </button>
          <button
            className={getButton("/items")}
            onClick={() => {
              navigate("/items");
            }}
          >
            생활꿀템
          </button>
          <button
            className={getButton("/community")}
            onClick={() => {
              navigate("/community");
            }}
          >
            커뮤니티
          </button>
        </div>
        <div className="flex gap-3 items-center">
          <img
            src={profile}
            alt="프로필"
            className="w-14 h-14 cursor-pointer"
            onClick={() => {
              navigate("/my");
            }}
          />
          <img
            src={favorite}
            alt="좋아요"
            className="w-14 h-14 cursor-pointer"
            onClick={() => {
              navigate("/likes");
            }}
          />
          <img
            src={bookmark}
            alt="스크랩"
            className="w-14 h-14 cursor-pointer"
            onClick={() => {
              navigate("/scrap");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
