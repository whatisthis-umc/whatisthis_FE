import { useState } from "react";
import CustomerNav from "../../components/customer/CustomerNav";

interface QnaItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const QnaPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const itemsPerPage = 5;

  // 더미 Q&A 데이터 (답변 추가)
  const qnaItems: QnaItem[] = [
    {
      id: 1,
      question: "더 많은 카테고리의 상품 전개를 요구합니다.",
      answer: "추천 수 5개 이상 + 댓글 수 3개 이상 + 조회수 300회 이상이어야만 자동 등록이 되며, 신고 여러이 많은 운영팀 검토 후 선정됩니다.",
      category: "상품문의"
    },
    {
      id: 2,
      question: "한게 불스아이예서니 마크 구매하는 방법은 무니까?",
      answer: "상품 상세 페이지에서 '구매하기' 버튼을 클릭하시면 구매 절차를 진행하실 수 있습니다. 결제는 카드, 계좌이체, 간편결제 등 다양한 방법을 지원합니다.",
      category: "구매문의"
    },
    {
      id: 3,
      question: "베스트 올 선정 기준이 무엇인가요?",
      answer: "추천 수 5개 이상 + 댓글 수 3개 이상 + 조회수 300회 이상이어야만 자동 등록이 되며, 신고 여러이 많은 운영팀 검토 후 선정됩니다.",
      category: "서비스문의"
    },
    {
      id: 4,
      question: "다른 동유럽 상품 홍보는 무니까이고.",
      answer: "상품 홍보는 커뮤니티 게시판을 통해 진행하실 수 있습니다. 다만, 과도한 홍보성 게시물은 운영정책에 따라 제한될 수 있습니다.",
      category: "상품문의"
    },
    {
      id: 5,
      question: "베스트 올 선정 기준이 무엇인가요?",
      answer: "추천 수 5개 이상 + 댓글 수 3개 이상 + 조회수 300회 이상이어야만 자동 등록이 되며, 신고 여러이 많은 운영팀 검토 후 선정됩니다.",
      category: "서비스문의"
    },
    {
      id: 6,
      question: "배송비는 어떻게 계산되나요?",
      answer: "주문 금액 3만원 이상 시 무료배송이며, 3만원 미만 시 2,500원의 배송비가 부과됩니다. 제주도 및 도서산간 지역은 추가 배송비가 발생할 수 있습니다.",
      category: "배송문의"
    },
    {
      id: 7,
      question: "회원 탈퇴는 어떻게 하나요?",
      answer: "마이페이지 > 계정관리 > 회원탈퇴에서 진행하실 수 있습니다. 탈퇴 시 모든 개인정보가 삭제되며, 복구가 불가능하니 신중히 결정해주세요.",
      category: "회원문의"
    },
    {
      id: 8,
      question: "포인트 적립 기준을 알고 싶습니다.",
      answer: "구매 금액의 1%가 포인트로 적립되며, 리뷰 작성 시 추가 100포인트가 지급됩니다. 적립된 포인트는 다음 구매 시 현금처럼 사용 가능합니다.",
      category: "포인트문의"
    },
    {
      id: 9,
      question: "리뷰 작성 후 수정이 가능한가요?",
      answer: "리뷰 작성 후 7일 이내에는 수정이 가능합니다. 상품 상세 페이지의 '내가 작성한 리뷰'에서 수정하실 수 있습니다.",
      category: "리뷰문의"
    },
    {
      id: 10,
      question: "교환/환불 절차가 궁금합니다.",
      answer: "구매 후 7일 이내에 마이페이지 > 주문내역에서 교환/환불 신청이 가능합니다. 상품 하자가 아닌 단순 변심의 경우 왕복 배송비가 발생할 수 있습니다.",
      category: "교환/환불"
    }
  ];

  // 페이지네이션 계산
  const totalPages = Math.ceil(qnaItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = qnaItems.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleExpanded = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="flex-1 bg-white">
      <div className="w-full pt-16 pb-8">
        {/* 고객센터 네비게이션 */}
        <CustomerNav />

        {/* Q&A 목록 */}
        <div className="space-y-4">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-shadow hover:shadow-md"
            >
              {/* 질문 영역 */}
              <div
                className={`p-6 cursor-pointer transition-colors ${
                  expandedId === item.id ? "bg-gray-50" : "bg-white"
                }`}
                onClick={() => toggleExpanded(item.id)}
              >
                <div className="flex items-center">
                  <span className="text-gray-400 mr-3 font-medium">Q</span>
                  <p className="text-gray-800 text-sm flex-1">{item.question}</p>
                  {/* 펼침/접힘 아이콘 */}
                  <div className="ml-4">
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${
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

              {/* 답변 영역 (펼쳐질 때만 표시) */}
              {expandedId === item.id && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-start">
                    <span className="text-gray-400 mr-3 font-medium mt-0.5">A</span>
                    <p className="text-gray-700 text-sm leading-relaxed flex-1">
                      {item.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex space-x-1">
              {/* 이전 페이지 버튼 */}
              {currentPage > 1 && (
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="w-8 h-8 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  ‹
                </button>
              )}
              
              {/* 페이지 번호들 */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    page === currentPage
                      ? "bg-black text-white"
                      : "bg-white text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* 다음 페이지 버튼 */}
              {currentPage < totalPages && (
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="w-8 h-8 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  ›
                </button>
              )}
            </div>
          </div>
        )}

        {/* 빈 상태일 때 */}
        {qnaItems.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-lg mb-2">❓</div>
            <p className="text-gray-500">등록된 Q&A가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QnaPage;
