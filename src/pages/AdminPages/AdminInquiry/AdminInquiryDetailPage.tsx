import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminLayout from "../../../layouts/AdminLayout/AdminLayout";
import ConfirmModal from "../../../components/modals/ConfirmModal";
import { getInquiryDetail, createInquiryAnswer, updateInquiryAnswer, getInquiryAnswer, getSupportInquiryDetail } from "../../../api/inquiryApi";
import type { InquiryDetail } from "../../../types/adminInquiry";
import lock from "../../../assets/lock.svg";

export default function AdminInquiryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [answeredAt, setAnsweredAt] = useState<string | null>(null);

  const formatKoreanDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      return `${y}. ${m}. ${day} ${hh}:${mm}:${ss}`;
    } catch {
      return iso;
    }
  };

  // 본문에서 이미지 URL 추출 (http/https, 확장자 이미지)
  const extractImageUrls = (text: string): string[] => {
    if (!text) return [];
    const urls = new Set<string>();
    // 1) 마크다운 ![](url) 패턴
    const mdRegex = /!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/gi;
    let m: RegExpExecArray | null;
    while ((m = mdRegex.exec(text)) !== null) {
      urls.add(m[1]);
    }
    // 2) 일반 URL 패턴
    const urlRegex = /(https?:\/\/[^\s)]+\.(?:png|jpg|jpeg|gif|webp))/gi;
    let u: RegExpExecArray | null;
    while ((u = urlRegex.exec(text)) !== null) {
      urls.add(u[1]);
    }
    return Array.from(urls);
  };

  // 문의 상세 정보 조회
  const fetchInquiryDetail = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // 문의 정보와 답변 정보를 병렬로 조회
      const [inquiryResponse, answerResponse] = await Promise.allSettled([
        getInquiryDetail(Number(id)),
        getInquiryAnswer(Number(id))
      ]);

      // 문의 정보 처리
      if (inquiryResponse.status === 'fulfilled' && inquiryResponse.value.isSuccess) {
        setInquiry(inquiryResponse.value.result);
        // 상세 응답에 답변이 포함되어 있는 경우 대비해 바로 세팅
        try {
          const detail: any = inquiryResponse.value.result;
          const inlineAnswer = detail?.answer ?? detail?.answerContent ?? detail?.adminAnswer;
          if (typeof inlineAnswer === 'string' && inlineAnswer.trim()) {
            setAnswer(inlineAnswer);
            const inlineAnsweredAt = detail?.answeredAt ?? detail?.answerCreatedAt ?? detail?.updatedAt;
            if (inlineAnsweredAt) setAnsweredAt(inlineAnsweredAt as string);
          }
        } catch {}
      } else {
        setError("문의 정보를 불러오는데 실패했습니다.");
        return;
      }

      // 답변 정보 처리 (다양한 응답 형태 대응)
      if (answerResponse.status === 'fulfilled') {
        const maybe = (answerResponse.value as any)?.result ?? (answerResponse.value as any);
        if (maybe && typeof maybe === 'object' && 'isSuccess' in maybe && !(maybe as any).isSuccess) {
          // 실패 응답은 무시
        } else {
          const result: any = (answerResponse.value as any)?.result ?? {};
          const answerData =
            (typeof result === 'string' ? result : undefined) ??
            (typeof result?.answer === 'string' ? result.answer : undefined) ??
            (typeof result?.content === 'string' ? result.content : undefined) ??
            (typeof result?.answer?.content === 'string' ? result.answer.content : undefined) ??
            (Array.isArray(result?.answers) && typeof result.answers[0]?.content === 'string' ? result.answers[0].content : undefined);
          if (answerData) {
            setAnswer(answerData);
            const answeredTime =
              result?.answeredAt ??
              result?.createdAt ??
              result?.answer?.answeredAt ??
              result?.answer?.createdAt ??
              (Array.isArray(result?.answers) ? result.answers[0]?.createdAt : undefined);
            if (answeredTime) {
              setAnsweredAt(answeredTime as string);
            }
          }
        }
      }

      // 폴백: 아직 answer가 없으면 고객센터 상세에서 answerContent 사용
      if (!answer) {
        try {
          const supportDetail = await getSupportInquiryDetail(Number(id));
          if (supportDetail?.isSuccess) {
            const ac = (supportDetail.result as any)?.answerContent;
            if (typeof ac === 'string' && ac.trim()) {
              setAnswer(ac);
              const when = (supportDetail.result as any)?.answeredAt ?? (supportDetail.result as any)?.updatedAt ?? null;
              if (when) setAnsweredAt(when as string);
            }
          }
        } catch {}
      }
    } catch (err) {
      console.error("문의 상세 조회 오류:", err);
      setError("문의 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiryDetail();
  }, [id]);

  // 답변 등록/수정 처리
  const handleAnswerSubmit = async () => {
    if (!answerText.trim()) {
      alert("답변 내용을 입력해주세요.");
      return;
    }

    if (!inquiry) return;

    try {
      setLoading(true);
      
      // 답변이 이미 있으면 수정, 없으면 등록
      const response = answer 
        ? await updateInquiryAnswer(inquiry.id, { content: answerText })
        : await createInquiryAnswer(inquiry.id, { content: answerText });

      if (response.isSuccess) {
        // 답변 상태 업데이트
        setAnswer(answerText);
        setShowAnswerForm(false);
        setModalMessage(answer ? "답변이 수정되었습니다." : "답변이 등록되었습니다.");
        setModalOpen(true);
        
        // 문의 상태도 업데이트 (답변 완료로)
        if (inquiry.status === 'UNPROCESSED') {
          setInquiry({ ...inquiry, status: 'PROCESSED' });
        }
      } else {
        setModalMessage(response.message || "답변 처리에 실패했습니다.");
        setModalOpen(true);
      }
    } catch (err) {
      console.error("답변 처리 오류:", err);
      setModalMessage("답변 처리에 실패했습니다.");
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !inquiry) {
    return (
      <AdminLayout>
        <div className="px-10 py-6">
          <h2 className="text-2xl font-bold mb-6">문의내용</h2>
          <p>로딩 중...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="px-10 py-6">
          <h2 className="text-2xl font-bold mb-6">문의내용</h2>
          <p className="text-red-500">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  if (!inquiry) {
    return (
      <AdminLayout>
        <div className="px-10 py-6">
          <h2 className="text-2xl font-bold mb-6">문의내용</h2>
          <p>문의를 찾을 수 없습니다.</p>
        </div>
      </AdminLayout>
    );
  }

  const handleModalClose = () => {
    setModalOpen(false);
    setModalMessage("");
    navigate('/admin/inquiry');
  };

  const contentLines = inquiry.content ? inquiry.content.split('\n') : [];
  const firstLine = contentLines[0] || "";
  const restContent = contentLines.slice(1).join('\n');
  const contentImageUrls = extractImageUrls(inquiry.content);

  return (
    <AdminLayout>
      <div className="px-10 py-6">
        {/* 상단 제목 */}
        <div className="mt-[54px] mb-20 text-left">
          <h2 className="text-[#333333] text-left font-[Pretendard] text-[32px] font-[700] leading-[48px] -tracking-[0.64px]">문의내용</h2>
        </div>

        {/* 상단 잠금 아이콘 + 제목 배지 (문의글 제목 박스) */}
        <div className="mb-6">
          <div className="flex flex-col items-start gap-6 w-[1149px] p-6 rounded-[32px] border border-[#E6E6E6]">
            <div className="flex items-center gap-3">
              <img src={lock} alt="lock" className="w-5 h-5 opacity-70" />
              <span className="text-[#333333] font-[Pretendard] text-[20px] font-[700] leading-[30px] tracking-[-0.4px]">{inquiry.title}</span>
            </div>
          </div>
        </div>

        {/* Q&A 섹션 */}
        <div className="space-y-4">
          {/* 질문 섹션 (질문 박스) */}
          <div className="flex w-full p-6 items-start gap-6 self-stretch rounded-[32px] border border-[#E6E6E6]">
            <div className="text-[#333333] font-[Pretendard] text-[20px] font-[700] leading-[30px] tracking-[-0.4px] shrink-0">Q</div>
            <div className="flex-1">
              <h3 className="text-[#333333] font-[Pretendard] text-[20px] font-[700] leading-[30px] tracking-[-0.4px] mb-2">{firstLine || inquiry.title}</h3>
              {restContent && (
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{restContent}</p>
              )}
            </div>
          </div>

          {/* 질문 이미지 박스 (16px 아래) */}
          {contentImageUrls.length > 0 && (
            <div
              className="mt-4 w-full h-[240px] rounded-[24px] border border-[#E6E6E6]"
              style={{
                backgroundImage: `url(${contentImageUrls[0]})`,
                backgroundColor: 'lightgray',
                backgroundPosition: '0px -0.917px',
                backgroundSize: '100% 136.897%',
                backgroundRepeat: 'no-repeat',
              }}
            />
          )}

          {/* 답변 섹션 (답변 박스) */}
          <div className="flex flex-col justify-end items-end gap-6 w-full p-6 rounded-[32px] border border-[#E6E6E6]">
            <div className="flex items-start w-full">
              <div className="text-[#333333] font-[Pretendard] text-[20px] font-[700] leading-[30px] tracking-[-0.4px] shrink-0">A</div>
              <div className="w-6" />
              <div className="flex-1">
                {answer && !showAnswerForm ? (
                  <p className="text-[#333333] font-[Pretendard] text-[20px] font-[500] leading-[30px] tracking-[-0.4px] whitespace-pre-line">{answer}</p>
                ) : (
                  <div className="w-full">
                    <input
                      autoFocus
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder="내용을 입력하세요."
                      className="w-full bg-transparent outline-none placeholder-[#333333] placeholder-opacity-60"
                      style={{ fontFamily: 'Pretendard', fontSize: '20px', fontWeight: 500, lineHeight: '30px', letterSpacing: '-0.4px' }}
                    />
                  </div>
                )}
              </div>
            </div>
            {answer && (
              <div className="w-full flex justify-end items-center">
                <span className="text-xs text-gray-400">{formatKoreanDateTime(answeredAt || inquiry.createdAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* 등록 버튼 - 박스 아래 80px, 우측 정렬 */}
        {(!answer || showAnswerForm) && (
          <div className="mt-20 w-full flex justify-end">
            <button
              onClick={handleAnswerSubmit}
              className="flex w-[160px] px-4 py-3 justify-center items-center rounded-[32px] bg-[#0080FF] text-white"
              disabled={loading}
            >
              {loading ? "처리중..." : (answer ? "수정" : "등록")}
            </button>
          </div>
        )}

        {/* 답변이 이미 있는 경우 수정 버튼 */}
        {answer && !showAnswerForm && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => {
                setAnswerText(answer);
                setShowAnswerForm(true);
              }}
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md transition-colors"
            >
              답변 수정
            </button>
          </div>
        )}

        {/* 확인 모달 */}
        <ConfirmModal
          open={modalOpen}
          onClose={handleModalClose}
          message={modalMessage}
        />
      </div>
    </AdminLayout>
  );
} 