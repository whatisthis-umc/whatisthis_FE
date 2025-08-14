///src/pages/AdminPages/AdminQna/AdminNewQnaPage.tsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import { createQna } from '../../../api/adminQna';

export default function AdminNewQnaPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    const t = title.trim();
    const c = answer.trim();
    if (!t) return alert('제목을 입력해주세요.');
    if (!c) return alert('답변 내용을 입력해주세요.');

    try {
      setSubmitting(true);
      await createQna({ title: t, content: c });
      alert('Q&A가 등록되었습니다.');
      navigate('/admin/qna');
    } catch (err: any) {
      // 서버 메시지 있으면 보여주기
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Q&A 등록 중 문제가 발생했습니다.';
      alert(msg);
      console.error('createQna error:', err);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <AdminLayout>
      <div className="absolute top-[120px] left-[377px] w-[1023px] flex flex-col gap-[40px] font-[Pretendard]">
        {/* 상단 제목 */}
        <h2 className="text-[32px] font-bold text-[#333333] leading-[150%] tracking-[-0.02em]">
          Q&amp;A 내용
        </h2>

        {/* Q 입력 박스 */}
        <div className="flex items-start gap-[12px]  bg-white border border-[#E6E6E6]  rounded-[20px] px-[24px] py-[20px]">
          <div className="   text-[#4D4D4D] flex items-center justify-center font-bold text-[16px]">Q</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력해주세요."
            className="text-[16px] font-semibold text-[#333333] leading-[150%] tracking-[-0.02em] w-full bg-transparent outline-none placeholder:text-[#999999]"
          />
        </div>

        {/* A 입력 박스 */}
        <div className="flex items-start gap-[12px] bg-white border border-[#E6E6E6] rounded-[20px] px-[24px] py-[20px]">
          <div className="  text-[#4D4D4D] flex items-center justify-center font-bold text-[16px]">A</div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="답변을 입력해주세요."
            className="text-[16px] font-normal text-[#333333] leading-[150%] tracking-[-0.02em] w-full min-h-[120px] resize-none bg-transparent outline-none placeholder:text-[#999999]"
          />
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-[16px]">
          <button
            type="button"  
            onClick={() => navigate('/admin/qna')}
            disabled={submitting}
            className="w-[94px] h-[40px] rounded-full bg-[#3182F6] text-white  font-semibold text-[16px]"
          >
            취소
          </button>
          <button
            type="button"  
            onClick={handleSave}
            disabled={submitting}
            className="w-[94px] h-[40px] rounded-full bg-[#3182F6] text-white font-semibold text-[16px]"
          >
            {submitting ? '저장중...' : '저장'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
