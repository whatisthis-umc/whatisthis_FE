import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CustomerNav from "../../components/customer/CustomerNav";
import Searchbar from "../../components/Searchbar";
import Pagination from "../../components/customer/Pagination";
import { useInquiry, type InquiryItem } from "../../contexts/InquiryContext";
import InformationModal from "../../components/modals/InformationModal";
import lockIcon from "../../assets/lock.svg";
import writingIcon from "../../assets/writing.svg";

const InquiryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get("keyword") || "";

  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showPrivateModal, setShowPrivateModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const itemsPerPage = 5;
  const { inquiries } = useInquiry();

  // 로그인 상태 (false: 로그인 안됨, true: 로그인됨)
  const isLoggedIn = false; // 테스트용으로 false로 설정
  const currentUserId = isLoggedIn ? 999 : null; // 로그인하지 않으면 null

  // 검색 필터링
  const filteredInquiries = keyword
    ? inquiries.filter((inquiry) =>
        [inquiry.title, inquiry.content]
          .join(" ")
          .toLowerCase()
          .includes(keyword.toLowerCase()),
      )
    : inquiries;

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredInquiries.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (input: string) => {
    navigate(`/customer/inquiry?keyword=${encodeURIComponent(input)}`);
  };

  const handleInquiryClick = () => {
    // 로그인하지 않은 상태라면 모달 표시
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    navigate("/customer/inquiry/write");
  };

  const handleItemClick = (item: InquiryItem) => {
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

  const renderInquiryList = () => (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto px-4">
      {currentItems.map((item) => (
        <div key={item.id} className="flex flex-col gap-6">
          {/* 문의글 헤더 - 클릭 가능한 제목 블록 */}
          <div
            className="flex w-full max-w-[1392px] p-6 flex-col items-start gap-6 rounded-[32px] cursor-pointer transition-all"
            style={{
              border: "1px solid var(--WIT-Gray10, #E6E6E6)",
              background:
                expandedId === item.id ? "var(--WIT-Gray10, #E6E6E6)" : "white",
            }}
            onClick={() => handleItemClick(item)}
          >
            <div className="flex items-start justify-between w-full">
              <div className="flex-1">
                <div className="flex items-center mb-6">
                  <span
                    className="inline-flex justify-center items-center rounded-[32px] text-xs font-medium mr-3"
                    style={
                      item.status === "미답변"
                        ? {
                            padding: "4px 12px",
                            border: "1px solid var(--WIT-Gray200, #999)",
                            color: "#333",
                          }
                        : {
                            padding: "4px 12px",
                            background: "var(--WIT-Blue, #0080FF)",
                            color: "white",
                          }
                    }
                  >
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center mb-6 gap-2">
                  {/* 비공개 자물쇠 아이콘 */}
                  {!item.isPublic && (
                    <img src={lockIcon} alt="비공개" className="w-6 h-6" />
                  )}
                  <h3
                    className="flex-1"
                    style={{
                      color: "#333",
                      fontFamily: "Pretendard",
                      fontSize: "20px",
                      fontStyle: "normal",
                      fontWeight: 700,
                      lineHeight: "150%",
                      letterSpacing: "-0.4px",
                    }}
                  >
                    {item.title}
                  </h3>
                </div>
                <p className="text-gray-500 text-xs">{item.date}</p>
              </div>
            </div>
          </div>

          {/* 아코디언 내용 (Q&A 형태) - 별도의 독립적인 블록들 */}
          {expandedId === item.id &&
            (item.isPublic ||
              (isLoggedIn && item.authorId === currentUserId)) && (
              <div className="flex flex-col gap-4">
                {/* 질문 블록 */}
                <div
                  className="w-full max-w-[1392px] self-stretch rounded-[32px] bg-white"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    padding: "24px",
                    border: "1px solid var(--WIT-Gray10, #E6E6E6)",
                  }}
                >
                  <span
                    style={{
                      color: "var(--WIT-Gray600, #333)",
                      fontFamily: "Pretendard",
                      fontSize: "20px",
                      fontStyle: "normal",
                      fontWeight: 700,
                      lineHeight: "150%",
                      letterSpacing: "-0.4px",
                      marginRight: "24px",
                      flexShrink: 0,
                    }}
                  >
                    Q
                  </span>
                  <p
                    style={{
                      flex: "1 0 0",
                      color: "var(--WIT-Gray600, #333)",
                      fontFamily: "Pretendard",
                      fontSize: "20px",
                      fontStyle: "normal",
                      fontWeight: 700,
                      lineHeight: "150%",
                      letterSpacing: "-0.4px",
                      wordBreak: "break-word",
                    }}
                  >
                    {item.content}
                  </p>
                </div>

                {/* 답변 블록 */}
                <div
                  className="w-full max-w-[1392px] self-stretch rounded-[32px] bg-white"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    padding: "24px",
                    border: "1px solid var(--WIT-Gray10, #E6E6E6)",
                  }}
                >
                  <span
                    style={{
                      color: "var(--WIT-Gray600, #333)",
                      fontFamily: "Pretendard",
                      fontSize: "20px",
                      fontStyle: "normal",
                      fontWeight: 700,
                      lineHeight: "150%",
                      letterSpacing: "-0.4px",
                      marginRight: "24px",
                      flexShrink: 0,
                    }}
                  >
                    A
                  </span>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: "1 0 0",
                    }}
                  >
                    {item.answer ? (
                      <div>
                        <p
                          style={{
                            flex: "1 0 0",
                            color: "var(--WIT-Gray600, #333)",
                            fontFamily: "Pretendard",
                            fontSize: "20px",
                            fontStyle: "normal",
                            fontWeight: 500,
                            lineHeight: "150%",
                            letterSpacing: "-0.4px",
                            wordBreak: "break-word",
                          }}
                        >
                          {item.answer}
                        </p>
                        <div
                          className="flex justify-end"
                          style={{ marginTop: "24px" }}
                        >
                          <p
                            style={{
                              color: "var(--WIT-Gray200, #999)",
                              fontFamily: "Pretendard",
                              fontSize: "14px",
                              fontStyle: "normal",
                              fontWeight: 500,
                              lineHeight: "150%",
                              letterSpacing: "-0.14px",
                            }}
                          >
                            <span>2025.06.21</span>
                            <span style={{ marginLeft: "8px" }}>17:18:07</span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p
                        className="text-left"
                        style={{
                          flex: "1 0 0",
                          color: "var(--WIT-Gray600, #333)",
                          fontFamily: "Pretendard",
                          fontSize: "20px",
                          fontStyle: "normal",
                          fontWeight: 500,
                          lineHeight: "150%",
                          letterSpacing: "-0.4px",
                          wordBreak: "break-word",
                        }}
                      >
                        아직 답변이 등록되지 않았습니다.
                        <br />
                        빠른 시일 내에 답변드리겠습니다.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex-1 bg-white">
      {/* 검색바 */}
      <div className="hidden md:w-full md:max-w-[1440px] md:mx-auto md:flex md:justify-between md:items-center md:px-4 md:mt-4">
        <Searchbar onSearch={handleSearch} />
      </div>

      {keyword ? (
        // 검색 결과 화면
        <div className="w-full pb-8">
          {/* 고객센터 네비게이션 */}
          <CustomerNav />

          <div className="mt-10 px-8 max-w-[1440px] mx-auto">
            <h2 className="text-[24px] font-bold mb-4">검색 결과</h2>
            {currentItems.length > 0 ? (
              <>
                {renderInquiryList()}

                {/* 페이지네이션 */}
                <div className="mt-8 md:mt-20">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            ) : (
              <div className="text-gray-500 mt-8">검색 결과가 없습니다.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full pb-8">
          {/* 고객센터 네비게이션 */}
          <CustomerNav />

          {/* 1:1 문의 목록 */}
          {renderInquiryList()}

          {/* 빈 상태일 때 */}
          {filteredInquiries.length === 0 && (
            <div className="text-center py-8 md:py-16 max-w-[1440px] mx-auto px-4">
              <div className="text-gray-400 text-base md:text-lg mb-2">💬</div>
              <p className="text-gray-500 text-sm md:text-base">
                등록된 문의가 없습니다.
              </p>
            </div>
          )}

          {/* 문의하기 버튼 - 문의 목록 아래 오른쪽 정렬 */}
          <div className="flex justify-end mt-6 mb-8 max-w-[1440px] mx-auto px-4">
            <button
              onClick={handleInquiryClick}
              className="text-white shadow-md transition-all duration-200 flex justify-center items-center"
              style={{
                width: "156px",
                padding: "12px 32px",
                borderRadius: "32px",
                background: "var(--WIT-Blue, #0080FF)",
                gap: "0",
              }}
            >
              <img
                src={writingIcon}
                alt="문의하기"
                style={{
                  width: "24px",
                  height: "24px",
                  flexShrink: 0,
                  aspectRatio: "1/1",
                  opacity: 0.8,
                }}
              />
              <span
                style={{
                  color: "var(--WIT-White, var(--White, #FFF))",
                  fontFamily: "Pretendard",
                  fontSize: "20px",
                  fontStyle: "normal",
                  fontWeight: 500,
                  lineHeight: "150%",
                  letterSpacing: "-0.4px",
                  whiteSpace: "nowrap",
                }}
              >
                문의하기
              </span>
            </button>
          </div>

          {/* 페이지네이션 */}
          <div className="mt-8 md:mt-20 max-w-[1440px] mx-auto px-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}

      {/* 정보 모달들 */}
      <InformationModal
        isOpen={showPrivateModal}
        message="비밀글은 작성자만 확인할 수 있습니다."
        onClose={handlePrivateModalConfirm}
      />
      
      <InformationModal
        isOpen={showLoginModal}
        message="이 기능은 로그인 후 이용 가능합니다."
        onClose={handleLoginModalCancel}
      />
    </div>
  );
};

export default InquiryPage;
