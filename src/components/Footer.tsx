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
        <div className="flex flex-col gap-2 mt-10 ml-8 items-start text-left">
          <span className="text-[14px] font-[600]">SNS</span>
          <div className="flex flex-row gap-2 mt-2">
            <img src={insta} alt="Instagram" />
            <img src={X} alt="X" />
          </div>
        </div>
        {/* 가운데 */}
        <div className="flex flex-col gap-2 mt-10 items-start text-left ml-[-500px]">
          <span className="text-[14px] font-[600]">이게뭐예요?</span>
          <span className="text-[14px] font-[500]">문의전화 010-0000-0000</span>
          <span className="text-[12px] font-[500] mt-4">
            Copyright©WIT All rights reserved.
          </span>
        </div>
        {/* 오른쪽 */}
        <div className="flex flex-col gap-2 mt-10 mr-10 items-start text-left text-[14px]">
          <span className="font-[600] ml-6">고객센터</span>
          <div className="flex flex-col font-[500] border-l border-[#666666] pl-6 mr-10">
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
