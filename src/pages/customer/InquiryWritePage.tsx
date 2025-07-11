import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerNav from "../../components/customer/CustomerNav";
import { useInquiry } from "../../contexts/InquiryContext";

const InquiryWritePage = () => {
  const navigate = useNavigate();
  const { addInquiry } = useInquiry();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    attachmentType: "파일첨부", // "파일첨부" 또는 "URL"
    isPublic: true // true: 공개, false: 비공개
  });
  const [isPublicDropdownOpen, setIsPublicDropdownOpen] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!formData.content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    // Context에 새 문의글 추가
    addInquiry({
      title: formData.title,
      content: formData.content,
      isPublic: formData.isPublic,
      authorId: 999 // 현재 로그인한 사용자 ID
    });

    alert("문의가 등록되었습니다.");
    navigate("/customer/inquiry");
  };

  const handleCancel = () => {
    navigate("/customer/inquiry");
  };

  const handleFileUpload = () => {
    // 파일 업로드 기능
    alert("파일 업로드 기능을 구현해주세요!");
  };

  const togglePublicDropdown = () => {
    setIsPublicDropdownOpen(!isPublicDropdownOpen);
  };

  const selectPublicOption = (isPublic: boolean) => {
    handleInputChange("isPublic", isPublic);
    setIsPublicDropdownOpen(false);
  };

  return (
    <div className="flex-1 bg-white">
      <div className="w-full pt-16 pb-8">
        {/* 고객센터 네비게이션 */}
        <CustomerNav />

        {/* 문의 작성 폼 */}
        <div className="max-w-2xl mx-auto space-y-6">
          {/* 공개 여부 선택 - 아코디언 형태 */}
          <div className="relative">
            <button
              onClick={togglePublicDropdown}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-left text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
            >
              <span>{formData.isPublic ? "공개" : "비공개"}</span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${
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
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => selectPublicOption(true)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    formData.isPublic ? "bg-blue-50 text-blue-600" : "text-gray-700"
                  }`}
                >
                  공개
                </button>
                <button
                  onClick={() => selectPublicOption(false)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-t border-gray-100 ${
                    !formData.isPublic ? "bg-blue-50 text-blue-600" : "text-gray-700"
                  }`}
                >
                  비공개
                </button>
              </div>
            )}
          </div>

          {/* 제목 입력 */}
          <div>
            <input
              type="text"
              placeholder="제목을 입력해주세요."
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-base"
            />
          </div>

          {/* 내용 입력 */}
          <div>
            <textarea
              placeholder="내용을 입력해주세요."
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              rows={10}
              className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 resize-none text-base"
            />
          </div>

          {/* 파일첨부/URL 선택 */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => handleInputChange("attachmentType", "파일첨부")}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                formData.attachmentType === "파일첨부"
                  ? "bg-white text-gray-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-700"
              }`}
            >
              파일첨부
            </button>
            <button
              onClick={() => handleInputChange("attachmentType", "URL")}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                formData.attachmentType === "URL"
                  ? "bg-white text-gray-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-700"
              }`}
            >
              URL
            </button>
          </div>

          {/* 파일 업로드 버튼 */}
          <div>
            <button
              onClick={handleFileUpload}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-base"
            >
              <span>📁</span>
              <span>파일에서 업로드</span>
            </button>
          </div>

          {/* 취소/등록 버튼 */}
          <div className="flex space-x-4 pt-4">
            <button
              onClick={handleCancel}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-lg font-medium transition-colors text-base"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-lg font-medium transition-colors text-base"
            >
              등록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryWritePage; 