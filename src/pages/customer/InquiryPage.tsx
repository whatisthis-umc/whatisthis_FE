import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CustomerNav from "../../components/customer/CustomerNav";
import Searchbar from "../../components/Searchbar";
import Pagination from "../../components/customer/Pagination";
import type { InquiryItem } from "../../contexts/InquiryContext";
import InformationModal from "../../components/modals/InformationModal";
import LoginPromptModal from "../../components/modals/LoginPromptModal";
import { useAuth } from "../../hooks/useAuth";
import lockIcon from "../../assets/lock.svg";
import writingIcon from "../../assets/writing.svg";
import { getSupportInquiryList, getSupportInquiryDetail } from "../../api/inquiryApi";
import { formatTimeAgo } from "../../utils/timeFormatter";

const InquiryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get("keyword") || "";

  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showPrivateModal, setShowPrivateModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showInquiryLoginModal, setShowInquiryLoginModal] = useState(false);

  const itemsPerPage = 5;
  const { isLoggedIn } = useAuth();

  // 서버 데이터 상태
  const [items, setItems] = useState<InquiryItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailLoadedIds, setDetailLoadedIds] = useState<Set<number>>(new Set());

  // 목록 조회
  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getSupportInquiryList(currentPage, itemsPerPage, keyword || undefined);
        if (res.isSuccess && res.result) {
          const mapped: InquiryItem[] = res.result.inquiries.map((i) => ({
            id: i.id,
            title: i.title,
            content: i.content,
            answer: i.answerContent ?? undefined,
            status: i.answerContent ? "답변완료" as const : "미답변" as const,
            date: formatTimeAgo(i.createdAt),
            isPublic: !i.isSecret,
            authorId: 0,
            type: "post",
          }));
          setItems(mapped);
          setTotalPages(Math.max(res.result.totalPages || 1, 1));
          setDetailLoadedIds(new Set());
        } else {
          setItems([]);
          setTotalPages(1);
          setError(res.message || "문의 목록을 불러오지 못했습니다.");
        }
      } catch (err) {
        console.error("고객 문의 목록 조회 실패:", err);
        setItems([]);
        setTotalPages(1);
        setError("문의 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [currentPage, keyword]);

  const currentItems = useMemo(() => items, [items]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (input: string) => {
    // 새 검색 시 첫 페이지로
    setCurrentPage(1);
    navigate(`/customer/inquiry?keyword=${encodeURIComponent(input)}`);
  };

  const fetchDetailIfNeeded = async (inquiryId: number) => {
    if (detailLoadedIds.has(inquiryId)) return true;
    try {
      const res = await getSupportInquiryDetail(inquiryId);
      if (res.isSuccess && res.result) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === inquiryId
              ? {
                  ...it,
                  content: res.result.content,
                  answer: res.result.answerContent ?? undefined,
                  date: formatTimeAgo(res.result.createdAt),
                  isPublic: !res.result.isSecret,
                }
              : it,
          ),
        );
        setDetailLoadedIds((prev) => new Set(prev).add(inquiryId));
        return true;
      }
    } catch (e: any) {
      console.error("고객 문의 상세 조회 실패:", e);
      // 권한 없는 경우(작성자 아님) - 403 또는 500 에러인 경우 처리
      // 403: 일반적인 권한 없음, 500: 서버 내부 오류(배포환경에서 권한 없음으로 처리)
      if (e?.response?.status === 403 || e?.response?.status === 500) {
        // 비밀글 권한 부족 모달 표시
        setShowPrivateModal(true);
        return false;
      }
      // 다른 에러는 그대로 throw하여 상위에서 처리하도록 함
      throw e;
    }
    return false;
  };

  const handleInquiryClick = () => {
    if (!isLoggedIn) {
      setShowInquiryLoginModal(true);
      return;
    }
    navigate("/customer/inquiry/write");
  };

  const handleItemClick = async (item: InquiryItem) => {
    // 비공개 글 처리
    if (!item.isPublic) {
      // 로그인하지 않은 경우: 로그인 안내 모달
      if (!isLoggedIn) {
        setShowLoginModal(true);
        return;
      }
      // 로그인한 경우: 상세 권한 확인 후 성공 시에만 확장
      const ok = await fetchDetailIfNeeded(item.id);
      if (!ok) return;
      toggleExpand(item.id);
        return;
    }

    // 공개 글은 바로 확장 및 상세 로드(필요 시)
    toggleExpand(item.id);
    void fetchDetailIfNeeded(item.id);
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handlePrivateModalConfirm = () => {
    setShowPrivateModal(false);
  };

  const handleLoginModalCancel = () => {
    setShowLoginModal(false);
  };

  const handleInquiryLoginModalClose = () => {
    setShowInquiryLoginModal(false);
  };

  const handleInquiryLoginModalLogin = () => {
    setShowInquiryLoginModal(false);
    navigate("/login");
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
            onClick={() => void handleItemClick(item)}
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
                            background: "black",
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
          {expandedId === item.id && (
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
                  {!item.isPublic && !detailLoadedIds.has(item.id)
                    ? "비밀글입니다. 작성자만 볼 수 있습니다."
                    : item.content}
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
                      <div className="flex justify-end" style={{ marginTop: "24px" }}>
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
                          <span>{item.date}</span>
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
            {loading ? (
              <div className="text-gray-500 mt-8">불러오는 중...</div>
            ) : error ? (
              <div className="text-red-500 mt-8">{error}</div>
            ) : currentItems.length > 0 ? (
              <>
                {renderInquiryList()}

                {/* 페이지네이션 */}
                {totalPages >= 1 && (
                <div className="mt-8 md:mt-20">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
                )}
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
          {loading ? (
            <div className="text-center py-8 md:py-16">불러오는 중...</div>
          ) : error ? (
            <div className="text-center py-8 md:py-16 text-red-500">{error}</div>
          ) : (
            renderInquiryList()
          )}

          {/* 빈 상태일 때 */}
          {!loading && !error && currentItems.length === 0 && (
            <div className="text-center py-8 md:py-16 max-w-[1440px] mx-auto px-4">
              <div className="text-gray-400 text-base md:text-lg mb-2">💬</div>
              <p className="text-gray-500 text-sm md:text-base">등록된 문의가 없습니다.</p>
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
          {totalPages >= 1 && (
          <div className="mt-8 md:mt-20 max-w-[1440px] mx-auto px-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
          )}
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
        message="비밀글은 로그인 후 확인할 수 있습니다."
        onClose={handleLoginModalCancel}
      />

      {/* 문의하기 로그인 프롬프트 모달 */}
      <LoginPromptModal
        open={showInquiryLoginModal}
        message="문의하기 기능은 로그인 후 이용 가능합니다."
        onClose={handleInquiryLoginModalClose}
        onLogin={handleInquiryLoginModalLogin}
      />
    </div>
  );
};

export default InquiryPage;
