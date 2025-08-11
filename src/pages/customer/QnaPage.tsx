import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CustomerNav from "../../components/customer/CustomerNav";
import Searchbar from "../../components/Searchbar";
import Pagination from "../../components/customer/Pagination";

import { getQnaList, getQnaDetail } from "../../api/qnaApi";
import type { QnaListItem } from "../../types/supportQna";

// 서버 응답 아이템을 화면에서 사용하기 위한 변환 헬퍼 타입
// (별도 인터페이스 제거)

const QnaPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get("keyword") || "";

  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const itemsPerPage = 5;

  // 서버 QnA 목록 상태
  const [qnaItems, setQnaItems] = useState<QnaListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  // API 호출
  useEffect(() => {
    const fetchQnas = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔎 QnA 목록 요청 시작:', { page: currentPage, size: itemsPerPage });
        const res = await getQnaList(currentPage, itemsPerPage);
        if (res.isSuccess) {
          console.log('✅ QnA 목록 수신:', res.result);
          setQnaItems(res.result.qnas);
          setTotalPages(res.result.totalPages);
        } else {
          setError(res.message || 'QnA 목록을 불러오지 못했습니다.');
        }
      } catch (e) {
        console.error('QnA 목록 조회 실패:', e);
        setError('QnA 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchQnas();
  }, [currentPage]);

  // 검색 필터링 (클라이언트 단어 필터)
  const filteredQnaItems = keyword
    ? qnaItems.filter((item) =>
        [item.title, item.content]
          .join(" ")
          .toLowerCase()
          .includes(keyword.toLowerCase()),
      )
    : qnaItems;

  // 서버 페이징을 사용하므로 현재 페이지 아이템은 그대로 사용
  const currentItems = filteredQnaItems;

  // 빈 상태 처리: 서버에서 빈 목록을 반환했는지 확인
  const isEmpty = !loading && !error && currentItems.length === 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (input: string) => {
    navigate(`/customer/qna?keyword=${encodeURIComponent(input)}`);
  };

  const toggleExpanded = async (id: number) => {
    // 동일 항목을 다시 클릭하면 접기
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    // 상세 조회 호출 후 확장
    try {
      const res = await getQnaDetail(id);
      if (res.isSuccess) {
        // 서버 상세 content는 이미 목록과 동일 필드이므로 별도 병합 없이 확장만 수행
        setExpandedId(id);
      } else {
        console.warn('QnA 상세 조회 실패:', res.message);
      }
    } catch (e) {
      console.error('QnA 상세 조회 오류:', e);
    }
  };

  const renderQnaList = () => (
    <div className="flex flex-col gap-6 md:gap-10 max-w-[1440px] mx-auto px-4">
      {currentItems.map((item) => (
        <div key={item.id} className="flex flex-col gap-3 md:gap-4">
          {/* 질문 블록 */}
          <div
            className="flex w-full max-w-[1392px] p-6 flex-col items-start gap-6 cursor-pointer transition-colors rounded-[32px]"
            style={{
              border: "1px solid var(--WIT-Gray10, #E6E6E6)",
              background:
                expandedId === item.id ? "var(--WIT-Gray10, #E6E6E6)" : "white",
            }}
            onClick={() => toggleExpanded(item.id)}
          >
            <div className="flex items-center gap-6 self-stretch">
              <span
                style={{
                  color: "var(--WIT-Gray600, #333)",
                  fontFamily: "Pretendard",
                  fontSize: "20px",
                  fontStyle: "normal",
                  fontWeight: 700,
                  lineHeight: "150%",
                  letterSpacing: "-0.4px",
                }}
              >
                Q
              </span>
              <p
                className="flex-1 text-base md:text-lg lg:text-xl"
                style={{
                  color: "#333",
                  fontFamily: "Pretendard",
                  fontStyle: "normal",
                  fontWeight: 700,
                  lineHeight: "150%",
                  letterSpacing: "-0.4px",
                }}
              >
                {item.title}
              </p>
            </div>
          </div>

          {/* 답변 블록 - 별도의 독립적인 블록 */}
          {expandedId === item.id && (
            <div
              className="flex w-full max-w-[1392px] p-6 flex-col items-start gap-6 bg-white rounded-[32px]"
              style={{
                border: "1px solid var(--WIT-Gray10, #E6E6E6)",
              }}
            >
              <div className="flex items-center gap-6 self-stretch">
                <span
                  style={{
                    color: "var(--WIT-Gray600, #333)",
                    fontFamily: "Pretendard",
                    fontSize: "20px",
                    fontStyle: "normal",
                    fontWeight: 700,
                    lineHeight: "150%",
                    letterSpacing: "-0.4px",
                  }}
                >
                  A
                </span>
                <p
                  className="flex-1"
                  style={{
                    color: "var(--WIT-Gray600, #333)",
                    fontFamily: "Pretendard",
                    fontSize: "20px",
                    fontStyle: "normal",
                    fontWeight: 500,
                    lineHeight: "150%",
                    letterSpacing: "-0.4px",
                  }}
                >
                  {item.content}
                </p>
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
                {renderQnaList()}

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

          {/* Q&A 목록 */}
          {renderQnaList()}

          {/* 페이지네이션 */}
          <div className="mt-8 md:mt-20 max-w-[1440px] mx-auto px-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>

                    {/* 빈 상태일 때 */}
          {isEmpty && (
            <div className="text-center py-8 md:py-16 max-w-[1440px] mx-auto px-4">
              {loading ? (
                <div className="text-gray-500">불러오는 중...</div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : (
                <>
                  <div className="text-gray-400 text-base md:text-lg mb-2">❓</div>
                  <p className="text-gray-500 text-sm md:text-base">등록된 Q&A가 없습니다.</p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QnaPage;
