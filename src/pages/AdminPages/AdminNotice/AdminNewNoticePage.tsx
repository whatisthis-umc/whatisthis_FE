///src/pages/AdminPages/AdminNotice/AdminNewNoticePage.tsx
import { useState } from "react";
import AdminLayout from "../../../layouts/AdminLayout/AdminLayout";
import { useNavigate } from 'react-router-dom';
import { createNotice } from "../../../api/adminNotice";



export default function AdminNewNoticePage() {
  const navigate = useNavigate();


    // 폼 상태
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    const c = content.trim();

    if (!t) return alert("제목을 입력하세요.");
    if (!c) return alert("내용을 입력하세요.");


    try {
      setSubmitting(true);
      const res = await createNotice({ title: t, content: c });

      if (res?.isSuccess) {
        alert("등록되었습니다.");
        navigate("/admin/notice"); // 목록으로
      } else {
        alert(res?.message ?? "등록에 실패했습니다.");
      }
    } catch (err: any) {
      // 서버가 500을 주는 경우 메시지 노출
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "등록에 실패했습니다.";
      alert(msg);
      console.error("createNotice error:", err?.response ?? err);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <AdminLayout>
      <form
        onSubmit={onSubmit}
        className="absolute top-[230px] left-[377px] w-[1023px] flex flex-col gap-[40px]"
      >
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
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    maxLength={200}
  />
      </div>

      {/* 내용 입력란 */}
      <div className="w-[1023px] h-[78px] border border-[#E6E6E6] rounded-[40px]">
        <textarea
          placeholder="내용을 입력하세요."
          className="w-full h-[100px] resize-none text-[20px] font-medium leading-[150%] tracking-[-0.02em] text-[#333333] font-[Pretendard] outline-none
          px-6 py-4 box-border"
          value={content}
          onChange={(e) => setContent(e.target.value)}
/>
      </div>

      
      {/* 버튼 */}
        <div className="flex justify-end gap-[16px]">
          <button
            type="button"
            className="w-[148px] h-[56px] rounded-full bg-[#e5e7eb] text-[#111827] font-semibold"
            onClick={() => navigate("/admin/notice")}
            disabled={submitting}
          >
            취소
          </button>
          <button
            type="submit"
            className="w-[148px] h-[56px] rounded-full bg-blue-500 text-white font-semibold disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "저장 중…" : "저장"}
          </button>
        </div>
    
    </form>
    </AdminLayout>
  );
}
