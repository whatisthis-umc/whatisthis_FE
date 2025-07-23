import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import { dummyAdminNotice } from '../../../data/dummyAdminNotice';

export default function AdminNoticeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notice = dummyAdminNotice.find(n => n.id === Number(id));

  const [title, setTitle] = useState(notice?.title || '');
  const [content, setContent] = useState(notice?.content || '');

  if (!notice) {
    return <div className="p-10 text-xl">존재하지 않는 공지사항입니다.</div>;
  }

  return (
    <AdminLayout>
      <div className="absolute top-[160px] left-[377px] w-[1023px] flex flex-col gap-[40px] font-[Pretendard]">
        {/* 상단 제목 */}
        <h2 className="text-[32px] font-bold text-[#333333] leading-[150%] tracking-[-0.02em]">
          공지사항 내용
        </h2>

        {/* 제목 및 필독 표시 */}
        <div className="w-full border border-[#E6E6E6] rounded-[32px] p-[24px] flex flex-col gap-[24px] bg-white">
          <div className="flex items-center gap-[16px]">
            <div className="w-[59px] h-[38px] flex items-center justify-center rounded-[32px] border border-[#999999] text-[#999999] text-[14px] font-medium">
              {notice.category}
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력해주세요."
              className="text-[20px] font-semibold leading-[150%] tracking-[-0.02em] text-[#333333] w-full bg-transparent outline-none placeholder:text-[#999999]"
            />
          </div>
        </div>

        {/* 내용 입력 */}
        <div className="w-[1023px] h-auto border border-[#E6E6E6] rounded-[40px] px-6 py-4">
          <textarea
          
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력해주세요."
            className="w-full min-h-[700px] resize-none"
          />
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-[16px]">
          <button
            onClick={() => navigate(-1)}
            className="w-[94px] h-[40px] rounded-full bg-[#3182F6] text-white text-[16px] font-semibold"
          >
            취소
          </button>
          <button
            onClick={() => {
              console.log('공지 수정됨:', title, content);
              navigate(`/admin/notice/${notice.id}`);
            }}
            className="w-[94px] h-[40px] rounded-full bg-[#3182F6] text-white text-[16px] font-semibold"
          >
            저장
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
