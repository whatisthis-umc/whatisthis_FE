import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CustomerNav from "../../components/customer/CustomerNav";
import Searchbar from "../../components/Searchbar";
import Pagination from "../../components/customer/Pagination";

import { getNoticeList, getNoticeDetail } from "../../api/noticeApi";
import type { NoticeListItem } from "../../types/supportNotice";
import { formatTimeAgo } from "../../utils/timeFormatter";

const NoticeListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get("keyword") || "";

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 서버 공지 목록 상태 + API 연결
  const [notices, setNotices] = useState<NoticeListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await getNoticeList(currentPage, itemsPerPage);
        if (res.isSuccess) {
          setNotices(res.result.notices);
          setTotalPages(res.result.totalPages);
        }
      } catch (e) {
        console.error('공지 목록 조회 실패:', e);
      }
    };
    fetchNotices();
  }, [currentPage]);

  // 검색 필터링
  const filteredNotices = keyword
    ? notices.filter((notice) =>
        [notice.title, notice.content]
          .join(" ")
          .toLowerCase()
          .includes(keyword.toLowerCase()),
      )
    : notices;

  // 서버 페이징 사용
  const currentItems = filteredNotices;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (input: string) => {
    navigate(`/customer/notice?keyword=${encodeURIComponent(input)}`);
  };

  const toggleExpanded = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    try {
      const res = await getNoticeDetail(id);
      if (res.isSuccess) {
        setExpandedId(id);
      }
    } catch (e) {
      console.error('공지 상세 조회 오류:', e);
    }
  };

  const renderNoticeList = () => (
    <div className="flex flex-col gap-4 md:gap-6 max-w-[1440px] mx-auto px-4">
      {currentItems.map((notice) => (
        <div key={notice.id} className="flex flex-col gap-3 md:gap-4">
          {/* 공지사항 헤더 - 클릭 가능한 제목 블록 */}
          <div
            className="border border-[#E6E6E6] rounded-[16px] md:rounded-[32px] flex flex-col items-start gap-4 md:gap-6 p-4 md:p-6 cursor-pointer transition-all"
            style={{
              background:
                expandedId === notice.id
                  ? "var(--WIT-Gray10, #E6E6E6)"
                  : "white",
            }}
            onClick={() => toggleExpanded(notice.id)}
          >
            <div className="flex items-start justify-between w-full">
              <div className="flex-1">
                <div className="flex flex-col gap-3 md:gap-6">
                  {/* 필독 블록 */}
                  <div
                    style={{
                      display: "flex",
                      padding: "4px 12px",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "32px",
                      border: "1px solid var(--WIT-Gray200, #999)",
                      alignSelf: "flex-start",
                    }}
                  >
                    <span
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
                      필독
                    </span>
                  </div>
                  <h3
                    className="transition-colors text-left"
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
                    {notice.title}
                  </h3>
                  <div className="flex items-center" style={{ gap: "8px" }}>
                    <span
                      style={{
                        color: "var(--WIT-Gray600, #333)",
                        fontFamily: "Pretendard",
                        fontSize: "14px",
                        fontStyle: "normal",
                        fontWeight: 500,
                        lineHeight: "150%",
                        letterSpacing: "-0.14px",
                      }}
                    >
                      관리자
                    </span>
                    <span
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
                      {formatTimeAgo(notice.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 공지사항 상세 내용 - 별도의 독립적인 블록 */}
          {expandedId === notice.id && (
            <div className="flex flex-col justify-end items-end gap-4 md:gap-6 w-full p-4 md:p-6 bg-white border border-[#E6E6E6] rounded-[16px] md:rounded-[32px]">
              <div
                className="w-full text-left whitespace-pre-line text-sm md:text-base lg:text-lg"
                style={{
                  color: "#333",
                  fontFamily: "Pretendard",
                  fontStyle: "normal",
                  fontWeight: 500,
                  lineHeight: "150%",
                  letterSpacing: "-0.4px",
                }}
              >
                {notice.content}
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
                {renderNoticeList()}

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

          {/* 공지사항 목록 */}
          {renderNoticeList()}

          {/* 페이지네이션 */}
          <div className="mt-8 md:mt-20 max-w-[1440px] mx-auto px-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>

          {/* 빈 상태일 때 */}
          {filteredNotices.length === 0 && (
            <div className="text-center py-8 md:py-16 max-w-[1440px] mx-auto px-4">
              <div className="text-gray-400 text-base md:text-lg mb-2">📢</div>
              <p className="text-gray-500 text-sm md:text-base">
                등록된 공지사항이 없습니다.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NoticeListPage;
