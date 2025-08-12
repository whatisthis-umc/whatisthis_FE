import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerNav from "../../components/customer/CustomerNav";
import InformationModal from "../../components/modals/InformationModal";
import { useAuth } from "../../hooks/useAuth";
import addPhotoIcon from "../../assets/add_photo.png";
import { createSupportInquiry } from "../../api/inquiryApi";

const InquiryWritePage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    url: "",
    isPublic: null as boolean | null, // null: 미선택, true: 공개, false: 비공개
  });
  const [isPublicDropdownOpen, setIsPublicDropdownOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | boolean | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileSelect: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const selected = Array.from(e.target.files ?? []);
    setFiles(selected);
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    if (!formData.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!formData.content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }
    if (formData.isPublic === null) {
      alert("공개 여부를 선택해주세요.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title,
        content: formData.content,
        isSecret: !formData.isPublic, // 공개 여부 반전
      };
      await createSupportInquiry(payload, files);
      alert("문의가 등록되었습니다.");
      navigate("/customer/inquiry");
    } catch (e) {
      console.error("문의 등록 실패:", e);
      alert("문의 등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/customer/inquiry");
  };

  const handleFileUpload = () => {
    // 파일 선택 input 클릭 트리거
    const input = document.getElementById("file-input") as HTMLInputElement | null;
    input?.click();
  };

  const togglePublicDropdown = () => {
    setIsPublicDropdownOpen(!isPublicDropdownOpen);
  };

  const selectPublicOption = (isPublic: boolean) => {
    handleInputChange("isPublic", isPublic);
    setIsPublicDropdownOpen(false);
  };

  const handleLoginModalClose = () => {
    setShowLoginModal(false);
  };

  return (
    <div className="flex-1 bg-white">
      <div className="w-full pt-16 pb-8">
        {/* 고객센터 네비게이션 */}
        <CustomerNav />

        {/* 숨김 파일 입력 */}
        <input
          id="file-input"
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* 문의 작성 폼 */}
        <div className="max-w-full md:max-w-2xl lg:max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          {/* 공개 여부 선택 - 아코디언 형태 */}
          <div className="relative mt-16 md:mt-20 lg:mt-20">
            <button
              onClick={togglePublicDropdown}
              className="w-full focus:outline-none flex justify-between items-start p-4 md:p-6 lg:p-6 rounded-2xl md:rounded-3xl lg:rounded-[32px]"
              style={{
                background: "var(--WIT-Gray10, #E6E6E6)",
              }}
            >
              <span
                className="text-sm md:text-base lg:text-base whitespace-nowrap"
                style={{
                  color: "var(--WIT-Gray600, #333)",
                  fontFamily: "Pretendard",
                  fontStyle: "normal",
                  fontWeight: 700,
                  lineHeight: "150%",
                  letterSpacing: "-0.16px",
                }}
              >
                {formData.isPublic === null
                  ? "공개 여부"
                  : formData.isPublic
                    ? "공개"
                    : "비공개"}
              </span>
              <svg
                className={`w-4 h-4 md:w-5 md:h-5 lg:w-5 lg:h-5 text-gray-400 transition-transform ${
                  isPublicDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* 아코디언 드롭다운 */}
            {isPublicDropdownOpen && (
              <div
                className="absolute top-full left-0 z-10 mt-1 w-full flex flex-col items-start p-4 md:p-6 lg:p-6 gap-3 md:gap-4 lg:gap-4 rounded-2xl md:rounded-3xl lg:rounded-[32px]"
                style={{
                  background: "var(--WIT-Gray10, #E6E6E6)",
                }}
              >
                <button
                  onClick={() => selectPublicOption(true)}
                  className="hover:opacity-80 transition-opacity w-full text-left text-sm md:text-base lg:text-base h-5 md:h-6 lg:h-6 flex items-center"
                  style={{
                    color: "var(--WIT-Gray600, #333)",
                    fontFamily: "Pretendard",
                    fontStyle: "normal",
                    fontWeight: 700,
                    lineHeight: "150%",
                    letterSpacing: "-0.16px",
                    background: "none",
                    border: "none",
                    padding: "0",
                    cursor: "pointer",
                  }}
                >
                  공개
                </button>
                <button
                  onClick={() => selectPublicOption(false)}
                  className="hover:opacity-80 transition-opacity w-full text-left text-sm md:text-base lg:text-base h-5 md:h-6 lg:h-6 flex items-center"
                  style={{
                    color: "var(--WIT-Gray600, #333)",
                    fontFamily: "Pretendard",
                    fontStyle: "normal",
                    fontWeight: 700,
                    lineHeight: "150%",
                    letterSpacing: "-0.16px",
                    background: "none",
                    border: "none",
                    padding: "0",
                    cursor: "pointer",
                  }}
                >
                  비공개
                </button>
              </div>
            )}
          </div>

          {/* 제목 입력 */}
          <div className="mt-8 md:mt-10 lg:mt-[40px]">
            <div
              className="flex justify-center items-center p-4 md:p-5 lg:p-6 rounded-2xl md:rounded-3xl lg:rounded-[32px] border"
              style={{
                border: "1px solid var(--WIT-Gray10, #E6E6E6)",
              }}
            >
              <input
                type="text"
                placeholder="제목을 입력해주세요."
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full focus:outline-none text-lg md:text-xl lg:text-2xl"
                style={{
                  color: "var(--WIT-Gray600, #333)",
                  fontFamily: "Pretendard",
                  fontStyle: "normal",
                  fontWeight: 700,
                  lineHeight: "150%",
                  letterSpacing: "-0.48px",
                  background: "transparent",
                  border: "none",
                }}
              />
            </div>
          </div>

          {/* 내용 입력 */}
          <div className="mt-3 md:mt-4 lg:mt-4">
            <div
              className="flex items-start p-4 md:p-5 lg:p-6 h-48 md:h-56 lg:h-[248px] rounded-2xl md:rounded-3xl lg:rounded-[32px]"
              style={{
                border: "1px solid var(--WIT-Gray10, #E6E6E6)",
              }}
            >
              <textarea
                placeholder="내용을 입력해주세요."
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                className="w-full h-full focus:outline-none resize-none text-sm md:text-base lg:text-base"
                style={{
                  color: "var(--WIT-Gray600, #333)",
                  fontFamily: "Pretendard",
                  fontStyle: "normal",
                  fontWeight: 500,
                  lineHeight: "150%",
                  letterSpacing: "-0.16px",
                  background: "transparent",
                  border: "none",
                }}
              />
            </div>
          </div>

          {/* 첨부파일/URL 입력 */}
          <div className="mt-8 md:mt-10 lg:mt-[40px]">
            <div
              className="flex items-center p-4 md:p-5 lg:p-6 rounded-2xl md:rounded-3xl lg:rounded-[32px]"
              style={{
                border: "1px solid var(--WIT-Gray10, #E6E6E6)",
                gap: "40px",
              }}
            >
              <span
                style={{
                  color: "var(--WIT-Gray600, #333)",
                  fontFamily: "Pretendard",
                  fontSize: "16px",
                  fontStyle: "normal",
                  fontWeight: 700,
                  lineHeight: "150%",
                  letterSpacing: "-0.16px",
                  whiteSpace: "nowrap",
                }}
              >
                첨부파일
              </span>
              <input
                type="url"
                placeholder="URL"
                value={formData.url || ""}
                onChange={(e) => handleInputChange("url", e.target.value)}
                className="w-full focus:outline-none"
                style={{
                  color: "var(--WIT-Gray600, #333)",
                  fontFamily: "Pretendard",
                  fontSize: "16px",
                  fontStyle: "normal",
                  fontWeight: 500,
                  lineHeight: "150%",
                  letterSpacing: "-0.16px",
                  background: "transparent",
                  border: "none",
                }}
              />
            </div>
          </div>

          {/* 파일 업로드 버튼 */}
          <div className="mt-5 md:mt-6 lg:mt-6">
            <button
              onClick={handleFileUpload}
              disabled={submitting}
              className="w-full transition-colors flex items-center justify-center py-3 md:py-3 lg:py-3 px-6 md:px-8 lg:px-8 rounded-2xl md:rounded-3xl lg:rounded-[32px]"
              style={{
                background: "var(--WIT-Blue, #0080FF)",
                border: "none",
                cursor: "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              <img src={addPhotoIcon} alt="사진 추가" className="w-6 h-6" />
              <span
                className="text-base md:text-lg lg:text-xl ml-4"
                style={{
                  color: "var(--WIT-White, var(--White, #FFF))",
                  fontFamily: "Pretendard",
                  fontStyle: "normal",
                  fontWeight: 500,
                  lineHeight: "150%",
                  letterSpacing: "-0.4px",
                }}
              >
                파일에서 업로드
              </span>
            </button>
            {files.length > 0 && (
              <div className="mt-2 text-sm text-gray-500">선택된 파일 {files.length}개</div>
            )}
          </div>

          {/* 취소/게시 버튼 */}
          <div className="flex mt-10 md:mt-11 lg:mt-11 gap-4 md:gap-5 lg:gap-6 justify-end w-full">
            <button
              onClick={handleCancel}
              disabled={submitting}
              className="transition-colors flex justify-center items-center px-4 md:px-4 lg:px-4 py-3 md:py-3 lg:py-3 w-32 md:w-36 lg:w-40 h-12 md:h-13 lg:h-[54px] rounded-2xl md:rounded-3xl lg:rounded-[32px]"
              style={{
                background: "var(--WIT-Blue, #0080FF)",
                border: "none",
                cursor: "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              <span
                className="text-base md:text-lg lg:text-xl"
                style={{
                  color: "var(--WIT-White, var(--White, #FFF))",
                  fontFamily: "Pretendard",
                  fontStyle: "normal",
                  fontWeight: 500,
                  lineHeight: "150%",
                  letterSpacing: "-0.4px",
                }}
              >
                취소
              </span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="transition-colors flex justify-center items-center px-4 md:px-4 lg:px-4 py-3 md:py-3 lg:py-3 w-32 md:w-36 lg:w-40 h-12 md:h-13 lg:h-[54px] rounded-2xl md:rounded-3xl lg:rounded-[32px]"
              style={{
                background: "var(--WIT-Blue, #0080FF)",
                border: "none",
                cursor: "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              <span
                className="text-base md:text-lg lg:text-xl"
                style={{
                  color: "var(--WIT-White, var(--White, #FFF))",
                  fontFamily: "Pretendard",
                  fontStyle: "normal",
                  fontWeight: 500,
                  lineHeight: "150%",
                  letterSpacing: "-0.4px",
                }}
              >
                게시
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 정보 모달 */}
      <InformationModal
        isOpen={showLoginModal}
        message="이 기능은 로그인 후 이용 가능합니다."
        onClose={handleLoginModalClose}
      />
    </div>
  );
};

export default InquiryWritePage;
