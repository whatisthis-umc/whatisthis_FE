import React from "react";
import AdminLayout from "../../../layouts/AdminLayout/AdminLayout";
import { useNavigate } from 'react-router-dom';



export default function AdminNewNoticePage() {
  
  return (
    <AdminLayout>
    <div className="absolute top-[230px] left-[377px] w-[1023px] flex flex-col gap-[40px]">
      {/* 제목 입력란 */}
      <div className="w-full h-auto border border-[#E6E6E6] rounded-[32px] p-[24px] flex flex-col gap-[24px]">
        {/* 필독 pill */}
        <div className="flex items-center justify-center border border-[#999999] text-[#999999] rounded-[32px] px-[12px] py-[4px] text-[14px] font-medium leading-[150%] w-fit">
          필독
        </div>

        {/* 제목 입력 텍스트 */}
         <input
    type="text"
    placeholder="제목을 입력해주세요."
    className="text-[24px] font-bold leading-[150%] tracking-[-0.02em] text-[#333333] font-[Pretendard] outline-none"
  />
      </div>

      {/* 내용 입력란 */}
      <div className="w-[1023px] h-[78px] border border-[#E6E6E6] rounded-[40px]">
        <textarea
  placeholder="내용을 입력하세요."
  className="w-full h-[100px] resize-none text-[20px] font-medium leading-[150%] tracking-[-0.02em] text-[#333333] font-[Pretendard] outline-none
  px-6 py-4 box-border"
/>
      </div>

      {/* 버튼 영역 - 나중에 스타일링 */}
      <div className="flex justify-end gap-[16px]">
        <button className="w-[148px] h-[56px] rounded-full bg-blue-500 text-white"
        onClick={() => navigate('/admin/notice')}>
          취소
        </button>
        <button className="w-[148px] h-[56px] rounded-full bg-blue-500 text-white">
          저장
        </button>
      </div>
    </div>
    </AdminLayout>
  );
}
