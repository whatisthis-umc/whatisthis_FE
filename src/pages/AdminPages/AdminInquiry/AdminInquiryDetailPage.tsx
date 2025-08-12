import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminLayout from "../../../layouts/AdminLayout/AdminLayout";
import ConfirmModal from "../../../components/modals/ConfirmModal";
import { getInquiryDetail, createInquiryAnswer, updateInquiryAnswer, getInquiryAnswer } from "../../../api/inquiryApi";
import type { InquiryDetail } from "../../../types/adminInquiry";

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
      } else {
        setError("문의 정보를 불러오는데 실패했습니다.");
        return;
      }

      // 답변 정보 처리 (답변이 없을 수도 있으므로 실패해도 무시)
      if (answerResponse.status === 'fulfilled' && answerResponse.value.isSuccess) {
        const answerData = answerResponse.value.result?.answer;
        if (answerData) {
          setAnswer(answerData);
        }
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
    navigate('/admin/inquiries');
  };

  return (
    <AdminLayout>
      <div className="px-10 py-6">
        {/* 상단 제목 */}
        <div className="text-left mb-8">
          <h2 className="text-2xl font-bold">문의내용</h2>
        </div>

        {/* Q&A 섹션 */}
        <div className="space-y-6">
          {/* 질문 섹션 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <span className="text-lg font-bold text-gray-700 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                Q
              </span>
              <h3 className="text-lg font-medium text-gray-800">{inquiry.title}</h3>
            </div>
            <div className="ml-11">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {inquiry.content}
              </p>
            </div>
          </div>

          {/* 답변 섹션 */}
          <div className="bg-blue-50 rounded-lg p-6 relative">
            <div className="flex items-center mb-4">
              <span className="text-lg font-bold text-white bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                A
              </span>
              <h3 className="text-lg font-medium text-gray-800">답변</h3>
            </div>
            <div className="ml-11">
              {answer && !showAnswerForm ? (
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {answer}
                </p>
              ) : (
                <textarea
                  rows={6}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="내용을 입력하세요."
                  className="w-full bg-white border border-gray-300 rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </div>

            {/* 등록 버튼 - 우측 하단에 고정 */}
            {(!answer || showAnswerForm) && (
              <div className="absolute bottom-4 right-4">
                <button
                  onClick={handleAnswerSubmit}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
                  disabled={loading}
                >
                  {loading ? "처리중..." : (answer ? "수정" : "등록")}
                </button>
              </div>
            )}
          </div>
        </div>

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