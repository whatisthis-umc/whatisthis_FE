import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerNav from "../../components/customer/CustomerNav";
import Searchbar from "../../components/Searchbar";
import Pagination from "../../components/customer/Pagination";
import { useInquiry } from "../../contexts/InquiryContext";

const InquiryPage = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showPrivateModal, setShowPrivateModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const itemsPerPage = 5;
  const { inquiries } = useInquiry();

  // 로그인 상태 (false: 로그인 안됨, true: 로그인됨)
  const isLoggedIn = false; // 테스트용으로 false로 설정
  const currentUserId = isLoggedIn ? 999 : null; // 로그인하지 않으면 null

  // 페이지네이션 계산
  const totalPages = Math.ceil(inquiries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = inquiries.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleInquiryClick = () => {
    navigate("/customer/inquiry/write");
  };

  const handleItemClick = (item: any) => {
    // 비공개 글인 경우
    if (!item.isPublic) {
      // 로그인하지 않은 상태
      if (!isLoggedIn) {
        setShowLoginModal(true);
        return;
      }
      // 로그인은 했지만 작성자가 아닌 경우
      if (item.authorId !== currentUserId) {
        setShowPrivateModal(true);
        return;
      }
    }
    
    // 공개 글이거나 작성자 본인인 경우 아코디언 토글
    toggleExpand(item.id);
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handlePrivateModalConfirm = () => {
    setShowPrivateModal(false);
    // 현재 페이지에 그대로 있음
  };

  const handleLoginModalCancel = () => {
    setShowLoginModal(false);
    // 최근에 봤던 게시물로 이동 (현재는 그대로 있음)
  };

  const handleLoginModalLogin = () => {
    setShowLoginModal(false);
    navigate("/login");
  };

  return (
    <div className="flex-1 bg-white">
      <div className="w-full pb-8">
        {/* 검색바 */}
        <div className="w-full max-w-[1440px] mx-auto flex justify-between items-center px-4 mt-4">
          <Searchbar />
        </div>
        
        {/* 고객센터 네비게이션 */}
        <CustomerNav />

        {/* 1:1 문의 목록 */}
        <div className="space-y-3">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* 문의글 헤더 */}
              <div
                onClick={() => handleItemClick(item)}
                className="p-5 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium mr-3 ${
                          item.status === "미답변"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {item.status}
                      </span>
                      {/* 비공개 표시 */}
                      {!item.isPublic && (
                        <span className="inline-block px-2 py-1 bg-gray-600 text-white text-xs rounded-full">
                          🔒 비공개
                        </span>
                      )}
                    </div>
                    <h3 
                      className="mb-3"
                      style={{
                        color: '#333',
                        fontFamily: 'Pretendard',
                        fontSize: '20px',
                        fontStyle: 'normal',
                        fontWeight: 700,
                        lineHeight: '150%',
                        letterSpacing: '-0.4px'
                      }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-xs">{item.date}</p>
                  </div>
                  
                  {/* 화살표 아이콘 */}
                  <div className="ml-4">
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedId === item.id ? "rotate-180" : ""
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
                  </div>
                </div>
              </div>

              {/* 아코디언 내용 (문의 질문과 답변) - 공개글이거나 로그인한 작성자 본인인 경우만 표시 */}
              {expandedId === item.id && (item.isPublic || (isLoggedIn && item.authorId === currentUserId)) && (
                <div className="border-t border-gray-200 bg-gray-50">
                  <div className="p-5">
                    {/* 문의 질문 */}
                    <div className="mb-6">
                      <div className="flex items-center mb-3">
                        <span className="text-sm font-semibold text-gray-700">Q</span>
                        <h4 className="text-sm font-medium text-gray-700 ml-2">문의 내용</h4>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                          {item.content}
                        </p>
                      </div>
                    </div>

                    {/* 답변 */}
                    <div>
                      <div className="flex items-center mb-3">
                        <span className="text-sm font-semibold text-blue-600">A</span>
                        <h4 className="text-sm font-medium text-gray-700 ml-2">답변</h4>
                      </div>
                      
                      {item.answer ? (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                            {item.answer}
                          </p>
                          <div className="mt-4 pt-3 border-t border-blue-200">
                            <p className="text-xs text-gray-500">
                              답변일: {item.date}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-500 text-center">
                            아직 답변이 등록되지 않았습니다.<br/>
                            빠른 시일 내에 답변드리겠습니다.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 빈 상태일 때 */}
        {inquiries.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-lg mb-2">💬</div>
            <p className="text-gray-500">등록된 문의가 없습니다.</p>
          </div>
        )}

        {/* 문의하기 버튼 - 문의 목록 아래 오른쪽 정렬 */}
        <div className="flex justify-end mt-8 mb-8">
          <button
            onClick={handleInquiryClick}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full shadow-md transition-all duration-200 flex items-center space-x-2"
          >
            <span className="text-sm font-medium">✏️ 문의하기</span>
          </button>
        </div>

        {/* 페이지네이션 */}
        <div className="mt-20">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* 로그인된 사용자의 비밀글 접근 불가 모달 */}
      {showPrivateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
            <p className="text-gray-700 mb-6 text-sm leading-relaxed">
              비밀글은 작성자만 확인할 수 있습니다.
            </p>
            <button
              onClick={handlePrivateModalConfirm}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 로그인 요구 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <div className="text-center mb-6">
              <p className="text-gray-700 text-sm leading-relaxed">
                비밀글을 로그인 후 확인할 수 있습니다.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleLoginModalCancel}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                취소
              </button>
              <button
                onClick={handleLoginModalLogin}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors text-sm"
              >
                로그인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryPage; 