import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';

export default function AdminNewQnaPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [answer, setAnswer] = useState('');

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
            onClick={() => navigate('/admin/qna')}
            className="w-[94px] h-[40px] rounded-full bg-[#3182F6] text-white  font-semibold text-[16px]"
          >
            취소
          </button>
          <button
            onClick={() => {
              // 실제 저장 로직은 추후 구현
              console.log('새 QnA 저장:', title, answer);
              navigate('/admin/qna');
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
