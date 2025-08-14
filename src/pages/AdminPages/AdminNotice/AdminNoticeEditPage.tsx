//src/pages/AdminPages/AdminNotice/AdminNoticeEditPage.tsx

import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import { dummyAdminNotice } from '../../../data/dummyAdminNotice';
import { getNotice, Notice, updateNotice } from '../../../api/adminNotice';

export default function AdminNoticeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const noticeId = useMemo(() => Number(id), [id]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [err, setErr] = useState<string | null>(null);
   // 기존 데이터 불러오기
  useEffect(() => {
    if (!Number.isFinite(noticeId)) {
      setErr("잘못된 접근입니다.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const n: Notice = await getNotice(noticeId);
        setTitle(n.title);
        setContent(n.content);
      } catch (e) {
        console.error(e);
        setErr("공지사항을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [noticeId]);


  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    const c = content.trim();
    if (!t) return alert("제목을 입력하세요.");
    if (!c) return alert("내용을 입력하세요.");

    try {
      setSaving(true);
      const res = await updateNotice(noticeId, { title: t, content: c });
      if (res?.isSuccess) {
        alert("수정되었습니다.");
        navigate(`/admin/notice/${noticeId}`);
      } else {
        alert(res?.message ?? "수정에 실패했습니다.");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "서버 오류로 수정에 실패했습니다.";
      alert(msg);
      console.error("updateNotice error:", err?.response ?? err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout><div className="p-10 text-xl">불러오는 중…</div></AdminLayout>;
  if (err) return <AdminLayout><div className="p-10 text-xl">{err}</div></AdminLayout>;


  return (
    <AdminLayout>
      <form
        onSubmit={onSubmit}
        className="absolute top-[160px] left-[377px] w-[1023px] flex flex-col gap-[40px] font-[Pretendard]"
      >
        {/* 상단 제목 */}
        <h2 className="text-[32px] font-bold text-[#333333] leading-[150%] tracking-[-0.02em]">
          공지사항 내용
        </h2>

        {/* 제목 및 필독 표시 */}
        <div className="w-full border border-[#E6E6E6] rounded-[32px] p-[24px] flex flex-col gap-[24px] bg-white">
          <div className="flex items-center gap-[16px]">
            <div className="w-[59px] h-[38px] flex items-center justify-center rounded-[32px] border border-[#999999] text-[#999999] text-[14px] font-medium">
            필독
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
            disabled={saving}
          >
            취소
          </button>
          <button
            type="submit"
            className="w-[94px] h-[40px] rounded-full bg-[#3182F6] text-white text-[16px] font-semibold disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
