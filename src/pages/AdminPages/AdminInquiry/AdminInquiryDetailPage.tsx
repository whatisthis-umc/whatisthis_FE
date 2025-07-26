import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import AdminLayout from "../../../layouts/AdminLayout/AdminLayout";
import { useInquiry } from "../../../contexts/InquiryContext";
import ConfirmModal from "../../../components/modals/ConfirmModal";

export default function AdminInquiryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { inquiries, updateInquiry } = useInquiry();
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const inquiry = inquiries.find(i => i.id === Number(id));

  if (!inquiry) {
    return (
      <AdminLayout>
        <Box className="px-10 py-6">
          <h2 className="text-2xl font-bold mb-6">문의내용</h2>
          <p>문의를 찾을 수 없습니다.</p>
        </Box>
      </AdminLayout>
    );
  }

  const handleAnswerSubmit = () => {
    if (!answerText.trim()) {
      alert("답변 내용을 입력해주세요.");
      return;
    }

    updateInquiry(inquiry.id, {
      answer: answerText,
      status: "답변완료"
    });

    setModalMessage("답변이 등록되었습니다.");
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalMessage("");
    navigate('/admin/inquiries');
  };

  return (
    <AdminLayout>
      <Box className="px-10 py-6">
        {/* 상단 제목 */}
        <Box className="text-left mb-8">
          <h2 className="text-2xl font-bold">문의내용</h2>
        </Box>



        {/* Q&A 섹션 */}
        <Box className="space-y-6">
          {/* 질문 섹션 */}
          <Box className="bg-gray-50 rounded-lg p-6">
            <Box className="flex items-center mb-4">
              <span className="text-lg font-bold text-gray-700 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                Q
              </span>
              <h3 className="text-lg font-medium text-gray-800">{inquiry.title}</h3>
            </Box>
            <Box className="ml-11">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {inquiry.content}
              </p>
            </Box>
          </Box>

          {/* 답변 섹션 */}
          <Box className="bg-blue-50 rounded-lg p-6 relative">
            <Box className="flex items-center mb-4">
              <span className="text-lg font-bold text-white bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                A
              </span>
              <h3 className="text-lg font-medium text-gray-800">답변</h3>
            </Box>
            <Box className="ml-11">
              {inquiry.answer && !showAnswerForm ? (
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {inquiry.answer}
                </p>
              ) : (
                <TextField
                  multiline
                  rows={6}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="내용을 입력하세요."
                  fullWidth
                  variant="outlined"
                  sx={{
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#3B82F6',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#3B82F6',
                      },
                    },
                  }}
                />
              )}
            </Box>

            {/* 등록 버튼 - 우측 하단에 고정 */}
            {(!inquiry.answer || showAnswerForm) && (
              <Box className="absolute bottom-4 right-4">
                <Button
                  variant="contained"
                  onClick={handleAnswerSubmit}
                  sx={{
                    backgroundColor: '#3B82F6',
                    color: 'white',
                    px: 4,
                    py: 1,
                    borderRadius: 2,
                    fontSize: '14px',
                    '&:hover': {
                      backgroundColor: '#2563EB'
                    }
                  }}
                >
                  등록
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        {/* 답변이 이미 있는 경우 수정 버튼 */}
        {inquiry.answer && !showAnswerForm && (
          <Box className="flex justify-center mt-8">
            <Button
              variant="outlined"
              onClick={() => {
                setAnswerText(inquiry.answer || "");
                setShowAnswerForm(true);
              }}
              sx={{ px: 4 }}
            >
              답변 수정
            </Button>
          </Box>
        )}

        {/* 확인 모달 */}
        <ConfirmModal
          open={modalOpen}
          onClose={handleModalClose}
          message={modalMessage}
        />
      </Box>
    </AdminLayout>
  );
} 