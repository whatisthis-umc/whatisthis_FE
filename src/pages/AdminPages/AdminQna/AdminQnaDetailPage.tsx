import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import { dummyQna } from '../../../data/dummyQna';

export default function AdminQnaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qna = dummyQna.find(q => q.id === Number(id));

  if (!qna) {
    return <div className="p-10 text-xl">존재하지 않는 Q&A입니다.</div>;
  }

  return (
    <AdminLayout>
      <div className="absolute top-[55px] left-[377px] w-[1023px] flex flex-col gap-[40px] font-[Pretendard]">
       <h2 className="text-[32px] font-bold text-[#333333] leading-[150%] tracking-[-0.02em] font-[Pretendard] mt-[60px]">
  Q&amp;A 내용
</h2>
        {/* Q영역 */}
        <div className="flex items-start gap-[12px] bg-[#E6E6E6] rounded-[20px] px-[24px] py-[20px]">
          <div className="w-[32px] h-[32px] rounded-full bg-[#D9D9D9] text-[#4D4D4D] flex items-center justify-center font-bold text-[16px]">Q</div>
          <div className="text-[16px] font-semibold text-[#333333] leading-[150%] tracking-[-0.02em]">
            {qna.title}
          </div>
        </div>

        {/* A영역 */}
        <div className="flex items-start gap-[12px] bg-white border border-[#E6E6E6] rounded-[20px] px-[24px] py-[20px]">
          <div className="w-[32px] h-[32px] rounded-full bg-[#F4F4F4] text-[#4D4D4D] flex items-center justify-center font-bold text-[16px]">A</div>
          <div className="text-[16px] font-normal text-[#333333] leading-[150%] tracking-[-0.02em] whitespace-pre-line">
            {qna.answer}
          </div>
        </div>

        {/* 수정 버튼 */}
        <div className="flex justify-end">
          <button
            onClick={() => navigate(`/admin/qna/edit/${qna.id}`)}
            className="w-[94px] h-[40px] rounded-full bg-[#3182F6] text-white text-[16px] font-semibold"
          >
            수정
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
