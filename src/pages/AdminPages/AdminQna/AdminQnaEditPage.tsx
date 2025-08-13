///src/pages/AdminPages/AdminQna/AdminQnaEditPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import { getQna, updateQna } from '../../../api/adminQna';


export default function AdminQnaEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qnaId = useMemo(() => Number(id), [id]);

   const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // 답변(내용)
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

   // 초기 데이터 로드
  useEffect(() => {
    if (!Number.isFinite(qnaId)) {
      setErr("잘못된 접근입니다.");
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const data = await getQna(qnaId);
        setTitle(data.title);
        setContent(data.content);
      } catch (e) {
        console.error(e);
        setErr("Q&A를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [qnaId]);

    const onSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }
    try {
      setSaving(true);
      await updateQna(qnaId, { title: title.trim(), content: content.trim() });
      alert("수정되었습니다.");
      navigate(`/admin/qna/${qnaId}`);
    } catch (e) {
      console.error(e);
      alert("수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-xl">불러오는 중…</div>;
  if (err) return <div className="p-10 text-xl">{err}</div>;

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
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="text-[16px] font-normal text-[#333333] leading-[150%] tracking-[-0.02em] w-full min-h-[120px] resize-none bg-transparent outline-none"
          />
        </div>

        {/* 버튼들 */}
        <div className="flex justify-end gap-[16px]">
          <button
            onClick={() => navigate(-1)}
            className="w-[94px] h-[40px] rounded-full bg-[#3182F6] text-white font-semibold text-[16px]"
            disabled={saving}
          >
            취소
          </button>
          <button
            onClick={onSave}
            className="w-[94px] h-[40px] rounded-full bg-[#3182F6] text-white font-semibold text-[16px]"
            disabled={saving}
          >
            {saving ? "저장중…" : "저장"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
