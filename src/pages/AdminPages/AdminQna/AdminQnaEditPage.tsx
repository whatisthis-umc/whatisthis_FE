import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import { dummyQna } from '../../../data/dummyQna';

export default function AdminQnaEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qna = dummyQna.find(q => q.id === Number(id));

  const [title, setTitle] = useState(qna?.title || '');
  const [answer, setAnswer] = useState(qna?.answer || '');

  if (!qna) {
    return <div className="p-10 text-xl">존재하지 않는 Q&A입니다.</div>;
  }

  return (
    <AdminLayout>
      <div className="absolute top-[130px] left-[377px] w-[1023px] flex flex-col gap-[40px] font-[Pretendard]">
        {/* 상단 제목 */}
        <h2 className="text-[32px] font-bold text-[#333333] leading-[150%] tracking-[-0.02em]">
          Q&amp;A 내용
        </h2>

        {/* Q 입력 박스 */}
        <div className="flex items-start gap-[12px] bg-[#E6E6E6] rounded-[20px] px-[24px] py-[20px]">
          <div className="w-[32px] h-[32px] rounded-full bg-[#D9D9D9] text-[#4D4D4D] flex items-center justify-center font-bold text-[16px]">Q</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-[16px] font-semibold text-[#333333] leading-[150%] tracking-[-0.02em] w-full bg-transparent outline-none"
          />
        </div>

        {/* A 입력 박스 */}
        <div className="flex items-start gap-[12px] bg-white border border-[#E6E6E6] rounded-[20px] px-[24px] py-[20px]">
          <div className="w-[32px] h-[32px] rounded-full bg-[#F4F4F4] text-[#4D4D4D] flex items-center justify-center font-bold text-[16px]">A</div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="text-[16px] font-normal text-[#333333] leading-[150%] tracking-[-0.02em] w-full min-h-[120px] resize-none bg-transparent outline-none"
          />
        </div>

        {/* 버튼들 */}
        <div className="flex justify-end gap-[16px]">
          <button
            onClick={() => navigate(-1)}
            className="w-[94px] h-[40px] rounded-full bg-[#3182F6] text-white font-semibold text-[16px]"
          >
            취소
          </button>
          <button
            onClick={() => {
              // 실제 저장 로직은 추후 구현
              console.log('저장됨:', title, answer);
              navigate(`/admin/qna/${qna.id}`);
            }}
            className="w-[94px] h-[40px] rounded-full bg-[#3182F6] text-white font-semibold text-[16px]"
          >
            저장
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
