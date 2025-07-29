import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CustomerNav from "../../components/customer/CustomerNav";
import Searchbar from "../../components/Searchbar";
import Pagination from "../../components/customer/Pagination";

interface QnaItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const QnaPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get("keyword") || "";

  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const itemsPerPage = 5;

  // 더미 Q&A 데이터 (답변 추가)
  const qnaItems: QnaItem[] = [
    {
      id: 1,
      question: "더 많은 카테고리의 상품 전개를 요구합니다.",
      answer:
        "추천 수 5개 이상 + 댓글 수 3개 이상 + 조회수 300회 이상이어야만 자동 등록이 되며, 신고 여러이 많은 운영팀 검토 후 선정됩니다.",
      category: "상품문의",
    },
    {
      id: 2,
      question: "한게 불스아이예서니 마크 구매하는 방법은 무니까?",
      answer:
        "상품 상세 페이지에서 '구매하기' 버튼을 클릭하시면 구매 절차를 진행하실 수 있습니다. 결제는 카드, 계좌이체, 간편결제 등 다양한 방법을 지원합니다.",
      category: "구매문의",
    },
    {
      id: 3,
      question: "베스트 올 선정 기준이 무엇인가요?",
      answer:
        "추천 수 5개 이상 + 댓글 수 3개 이상 + 조회수 300회 이상이어야만 자동 등록이 되며, 신고 여러이 많은 운영팀 검토 후 선정됩니다.",
      category: "서비스문의",
    },
    {
      id: 4,
      question: "다른 동유럽 상품 홍보는 무니까이고.",
      answer:
        "상품 홍보는 커뮤니티 게시판을 통해 진행하실 수 있습니다. 다만, 과도한 홍보성 게시물은 운영정책에 따라 제한될 수 있습니다.",
      category: "상품문의",
    },
    {
      id: 5,
      question: "베스트 올 선정 기준이 무엇인가요?",
      answer:
        "추천 수 5개 이상 + 댓글 수 3개 이상 + 조회수 300회 이상이어야만 자동 등록이 되며, 신고 여러이 많은 운영팀 검토 후 선정됩니다.",
      category: "서비스문의",
    },
    {
      id: 6,
      question: "배송비는 어떻게 계산되나요?",
      answer:
        "주문 금액 3만원 이상 시 무료배송이며, 3만원 미만 시 2,500원의 배송비가 부과됩니다. 제주도 및 도서산간 지역은 추가 배송비가 발생할 수 있습니다.",
      category: "배송문의",
    },
    {
      id: 7,
      question: "회원 탈퇴는 어떻게 하나요?",
      answer:
        "마이페이지 > 계정관리 > 회원탈퇴에서 진행하실 수 있습니다. 탈퇴 시 모든 개인정보가 삭제되며, 복구가 불가능하니 신중히 결정해주세요.",
      category: "회원문의",
    },
    {
      id: 8,
      question: "포인트 적립 기준을 알고 싶습니다.",
      answer:
        "구매 금액의 1%가 포인트로 적립되며, 리뷰 작성 시 추가 100포인트가 지급됩니다. 적립된 포인트는 다음 구매 시 현금처럼 사용 가능합니다.",
      category: "포인트문의",
    },
    {
      id: 9,
      question: "리뷰 작성 후 수정이 가능한가요?",
      answer:
        "리뷰 작성 후 7일 이내에는 수정이 가능합니다. 상품 상세 페이지의 '내가 작성한 리뷰'에서 수정하실 수 있습니다.",
      category: "리뷰문의",
    },
    {
      id: 10,
      question: "교환/환불 절차가 궁금합니다.",
      answer:
        "구매 후 7일 이내에 마이페이지 > 주문내역에서 교환/환불 신청이 가능합니다. 상품 하자가 아닌 단순 변심의 경우 왕복 배송비가 발생할 수 있습니다.",
      category: "교환/환불",
    },
  ];

  // 검색 필터링
  const filteredQnaItems = keyword
    ? qnaItems.filter((item) =>
        [item.question, item.answer]
          .join(" ")
          .toLowerCase()
          .includes(keyword.toLowerCase()),
      )
    : qnaItems;

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredQnaItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredQnaItems.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (input: string) => {
    navigate(`/customer/qna?keyword=${encodeURIComponent(input)}`);
  };

  const toggleExpanded = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
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
                {item.question}
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
                  {item.answer}
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
          {filteredQnaItems.length === 0 && (
            <div className="text-center py-8 md:py-16 max-w-[1440px] mx-auto px-4">
              <div className="text-gray-400 text-base md:text-lg mb-2">❓</div>
              <p className="text-gray-500 text-sm md:text-base">
                등록된 Q&A가 없습니다.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QnaPage;
