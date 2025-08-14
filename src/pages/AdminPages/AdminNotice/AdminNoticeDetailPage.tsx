//src/pages/AdminPages/AdminNotice/AdminNoticeDetailPage.tsx

import AdminLayout from "../../../layouts/AdminLayout/AdminLayout";
import { useParams, useNavigate } from 'react-router-dom';
import { dummyAdminNotice } from '../../../data/dummyAdminNotice';
import { useEffect, useMemo, useState } from "react";
import { getNotice, type Notice } from "../../../api/adminNotice";

export default function AdminNoticeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const noticeId = useMemo(() => Number(id), [id]);
  const [data, setData] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  
  useEffect(() => {
    if (!Number.isFinite(noticeId)) {
      setErr("잘못된 접근입니다.");
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const res = await getNotice(noticeId);
        setData(res);
      } catch (e) {
        console.error(e);
        setErr("공지사항을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [noticeId]);

   const fmtDate = (iso?: string) => (iso ? iso.slice(0, 10) : "");


  if (loading) return <div className="p-10 text-xl">불러오는 중…</div>;
  if (err) return <div className="p-10 text-xl">{err}</div>;
  if (!data) return <div className="p-10 text-xl">존재하지 않는 공지사항입니다.</div>;

  return (
    <AdminLayout>
       <div className="absolute top-[230px] left-[377px] w-[1023px] flex flex-col gap-[40px]">
        {/* 제목 및 필독 표시 */}
        <div className="w-full h-[185px] border border-[#E6E6E6] rounded-[32px] p-[24px] flex flex-col gap-[40px] bg-[#E6E6E6]">
          <div className="flex-col  items-center justify-between w-full">
            <div className="flex-col items-start gap-[16px]">
              <div className="w-[59px] h-[38px] flex items-center justify-center rounded-[32px] border border-[#999999] text-[#999999] text-[14px] font-medium font-[Pretendard]">
                필독
              </div>
              <div className="mt-[20px] text-[20px] font-semibold leading-[150%] tracking-[-0.02em] text-[#333333] font-[Pretendard]">
                {data.title}
              </div>
            </div>
            <div className="mt-[20px] text-[14px] text-[#999999] mr-[24px]">{fmtDate(data.createdAt)}</div>
          </div>
        </div>

        {/* 내용 */}
        <div className="w-[1023px] min-h-[200px] border border-[#E6E6E6] rounded-[40px] px-6 py-4">
          <p className="text-[20px] font-medium leading-[150%] tracking-[-0.02em] text-[#333333] font-[Pretendard] whitespace-pre-line">
            {data.content}
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-[16px]">
          <button className="w-[148px] h-[56px] rounded-full bg-blue-500 text-white text-[18px] font-semibold"
            onClick={() => navigate(`/admin/notice/edit/${data.id}`)}>
            수정
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
