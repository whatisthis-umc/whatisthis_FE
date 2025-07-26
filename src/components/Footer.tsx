import { useLocation } from "react-router-dom"; // 관리자 페이지에서는 푸터 안 보이게
import { insta } from "../assets";
import { X } from "../assets";
import React from "react";

const Footer = () => {
  const location = useLocation(); //// 관리자 페이지에서는 푸터 안 보이게
  const isAdminPage =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/adminlogin";

  if (isAdminPage) return null; // 관리자 페이지에서는 푸터 안 보이게

  return (
    <div className="w-full bg-[#E6E6E6] h-[197px] px-4">
      <div className="flex justify-between text-[#666666]">
        {/* 왼쪽 */}
        <div className="flex flex-col gap-2 mt-4 md:mt-10 ml-2 md:ml-8 items-start text-left">
          <span className="text-[11px] md:text-[14px] font-[600]">SNS</span>
          <div className="flex flex-row gap-2 mt-2">
            <img
              src={insta}
              alt="Instagram"
              className="w-5 h-5 md:w-7 md:h-7"
            />
            <img src={X} alt="X" className="w-5 h-5 md:w-7 md:h-7" />
          </div>
        </div>
        {/* 가운데 */}
        <div className="flex flex-col gap-2 mt-4 md:mt-10 items-start text-left ml-8 md:ml-[-500px]">
          <span className="text-[11px] md:text-[14px] font-[600]">
            이게뭐예요?
          </span>
          <span className="hidden md:block md:text-[14px] md:font-[500]">
            문의전화 010-0000-0000
          </span>
          <span className="text-[10px] md:text-[12px] font-[500] mt-1 md:mt-4">
            Copyright©WIT All rights reserved.
          </span>
        </div>
        {/* 오른쪽 */}
        <div className="flex flex-col gap-2 mt-4 md:mt-10 mr-3 md:mr-10 items-start text-left">
          <span className="text-[11px]  md:text-[14px] font-[600] ml-5 md:ml-6">
            고객센터
          </span>
          <div className="flex flex-col w-full text-[10px] md:text-[14px] font-[500] border-l border-[#666666] pl-5 md:pl-6 mr-3 md:mr-10">
            <span>Q&A</span>
            <span>공지사항</span>
            <span>1:1 문의</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
