import { useState } from "react";
import CustomerNav from "../../components/customer/CustomerNav";
import Searchbar from "../../components/Searchbar";
import Pagination from "../../components/customer/Pagination";

interface Notice {
  id: number;
  title: string;
  date: string;
  author: string;
  isRequired: boolean;
  content: string;
}

const NoticeListPage = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 더미 데이터 (상세 내용 추가)
  const notices: Notice[] = [
    {
      id: 1,
      title: "베스트 올 선정 기준 변경 안내",
      date: "24일 전",
      author: "관리자",
      isRequired: true,
      content: `안녕하세요, 운영팀입니다.

항상 저희 커뮤니티에 활발히 참여해주시는 여러분께 감사드립니다.
최근 베스트 올 선정 기준과 관련하여 여러 사용자분들의 의견을 수렴한 결과, 보다 공정하고 유의한 콘텐츠가 선정될 수 있도록 다음과 같이 기준을 변경하게 되었습니다.

📅 변경된 기준
• 추천 수 10개 이상 + 조회수 500회 이상
• 운영팀의 수동 선정 포함

🔄 변경 후 기준 (2025년 6월 15일부터 적용)
• 추천 수 5개 이상 + 댓글 수 3개 이상 + 조회수 300회 이상
• 신고 미달은 게시물만 대상 포함
• 운영팀의 수동 검토는 유지되며, 자율 조직 출석 시 우선 검토 대상

⚠️ 변경 사유
실시간 인기 게시물을 방영을 위해 기준을 완화하여서도
커뮤니티의 집중 유지차선이 위함입니다.

🔻 추가 안내가 늘어나는 분들도 있지만, 사용자 간 활발한 소통이 이루어지는 게시물을 우선 선정합니다.

익명이나 건의사항이 있으시면 언제든지 [문의하기]를 통해 말씀해주세요.

감사합니다.

운영팀 드림`,
    },
    {
      id: 2,
      title: "리뷰 점멸 강화 안내",
      date: "3일 전",
      author: "관리자",
      isRequired: true,
      content: `안녕하세요, 운영팀입니다.

더 나은 커뮤니티 환경 조성을 위해 리뷰 점검을 강화합니다.

📋 강화 내용
• 부적절한 리뷰 자동 필터링 시스템 도입
• 허위 리뷰 신고 시스템 강화
• 리뷰 품질 평가 기준 명확화

🎯 적용 대상
• 모든 제품 리뷰
• 커뮤니티 게시글
• 댓글 및 답글

감사합니다.`,
    },
    {
      id: 3,
      title: "신규 기능 업데이트 안내",
      date: "1주 전",
      author: "관리자",
      isRequired: false,
      content: `새로운 기능이 추가되었습니다!

✨ 새로운 기능
• 북마크 기능 개선
• 알림 설정 세분화
• 다크 모드 지원

자세한 사용법은 도움말을 참조해주세요.`,
    },
    {
      id: 4,
      title: "시스템 점검 안내",
      date: "2주 전",
      author: "관리자",
      isRequired: false,
      content: `시스템 점검으로 인한 서비스 중단 안내

🔧 점검 일시: 2025년 1월 15일 오전 2:00 ~ 6:00 (4시간)
🔧 점검 내용: 서버 성능 개선 및 보안 업데이트

점검 시간 동안 일시적으로 서비스 이용이 어려울 수 있습니다.
이용에 불편을 드려 죄송합니다.`,
    },
    {
      id: 5,
      title: "개인정보 처리방침 변경 안내",
      date: "3주 전",
      author: "관리자",
      isRequired: false,
      content: `개인정보 처리방침이 변경되었습니다.

📄 주요 변경사항
• 개인정보 보유기간 명시
• 제3자 제공 동의 절차 강화
• 개인정보 처리 목적 구체화

변경된 처리방침은 홈페이지에서 확인하실 수 있습니다.`,
    },
    {
      id: 6,
      title: "서비스 이용약관 개정 안내",
      date: "4주 전",
      author: "관리자",
      isRequired: true,
      content: `서비스 이용약관이 개정되었습니다.

📋 주요 개정사항
• 서비스 제공 범위 확대
• 회원 권리 및 의무 명시
• 분쟁 해결 절차 개선

자세한 내용은 이용약관을 확인해주세요.`,
    },
    {
      id: 7,
      title: "할인 이벤트 종료 안내",
      date: "1달 전",
      author: "관리자",
      isRequired: false,
      content: `겨울 할인 이벤트가 종료됩니다.

🎁 이벤트 내용
• 전 상품 10-30% 할인
• 무료배송 혜택
• 추가 적립금 지급

많은 관심과 참여 감사드립니다.`,
    },
    {
      id: 8,
      title: "고객센터 운영시간 변경 안내",
      date: "1달 전",
      author: "관리자",
      isRequired: false,
      content: `고객센터 운영시간이 변경됩니다.

⏰ 변경 전: 평일 09:00 ~ 18:00
⏰ 변경 후: 평일 09:00 ~ 19:00

더 나은 서비스 제공을 위한 변경사항입니다.`,
    },
    {
      id: 9,
      title: "모바일 앱 업데이트 안내",
      date: "1달 전",
      author: "관리자",
      isRequired: false,
      content: `모바일 앱이 업데이트되었습니다.

🆕 새로운 기능
• 푸시 알림 개선
• 검색 기능 강화
• UI/UX 개선

앱스토어에서 업데이트해주세요.`,
    },
    {
      id: 10,
      title: "배송 정책 변경 안내",
      date: "2달 전",
      author: "관리자",
      isRequired: true,
      content: `배송 정책이 변경됩니다.

📦 주요 변경사항
• 무료배송 기준 상향 조정
• 당일배송 지역 확대
• 배송비 일부 조정

자세한 내용은 배송정책을 확인해주세요.`,
    },
    {
      id: 11,
      title: "회원 등급제 도입 안내",
      date: "2달 전",
      author: "관리자",
      isRequired: false,
      content: `회원 등급제가 도입됩니다.

⭐ 등급별 혜택
• 브론즈: 5% 할인
• 실버: 10% 할인  
• 골드: 15% 할인
• 플래티넘: 20% 할인

구매 금액에 따라 등급이 결정됩니다.`,
    },
    {
      id: 12,
      title: "신상품 출시 안내",
      date: "3달 전",
      author: "관리자",
      isRequired: false,
      content: `새로운 상품이 출시되었습니다.

🆕 신상품 라인업
• 생활용품 카테고리 확장
• 친환경 제품 라인 추가
• 한정판 컬렉션 출시

많은 관심 부탁드립니다.`,
    },
    {
      id: 13,
      title: "결제 수단 추가 안내",
      date: "3달 전",
      author: "관리자",
      isRequired: true,
      content: `새로운 결제 수단이 추가되었습니다.

💳 추가 결제 수단
• 카카오페이
• 토스페이
• 페이코
• 네이버페이

더 편리한 결제 서비스를 이용해보세요.`,
    },
    {
      id: 14,
      title: "여름 휴가철 배송 안내",
      date: "4달 전",
      author: "관리자",
      isRequired: false,
      content: `여름 휴가철 배송 일정 안내입니다.

🏖️ 배송 지연 예상 기간
• 8월 1일 ~ 8월 15일
• 평소보다 1-2일 지연 예상

양해 부탁드립니다.`,
    },
    {
      id: 15,
      title: "사이트 리뉴얼 완료 안내",
      date: "5달 전",
      author: "관리자",
      isRequired: true,
      content: `사이트 리뉴얼이 완료되었습니다.

✨ 주요 개선사항
• 전체적인 디자인 개선
• 검색 기능 강화
• 모바일 최적화
• 속도 개선

새로워진 사이트를 경험해보세요!`,
    },
  ];

  // 페이지네이션 계산
  const totalPages = Math.ceil(notices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = notices.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleExpanded = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="flex-1 bg-white">
      <div className="w-full pb-8">
        {/* 검색바 */}
        <div className="w-full max-w-[1440px] mx-auto flex justify-between items-center px-4 mt-4">
          <Searchbar
            onSearch={(keyword: string) => {
              // 검색 기능 구현 필요시 여기에 추가
              console.log("검색어:", keyword);
            }}
          />
        </div>

        {/* 고객센터 네비게이션 */}
        <CustomerNav />

        {/* 공지사항 목록 */}
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
                      {notice.isRequired && (
                        <span
                          className="px-2 py-1 md:px-3 md:py-1 rounded-[32px] self-start text-sm md:text-base lg:text-lg"
                          style={{
                            color: "#333",
                            fontFamily: "Pretendard",
                            fontStyle: "normal",
                            fontWeight: 500,
                            lineHeight: "150%",
                            letterSpacing: "-0.4px",
                            border: "1px solid var(--WIT-Gray200, #999)",
                            background: "transparent",
                          }}
                        >
                          필독
                        </span>
                      )}
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
                      <div className="flex items-center text-xs md:text-sm text-gray-500 space-x-2">
                        <span>{notice.author}</span>
                        <span>{notice.date}</span>
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

        {/* 페이지네이션 */}
        <div className="mt-8 md:mt-20 max-w-[1440px] mx-auto px-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        {/* 빈 상태일 때 */}
        {notices.length === 0 && (
          <div className="text-center py-8 md:py-16 max-w-[1440px] mx-auto px-4">
            <div className="text-gray-400 text-base md:text-lg mb-2">📢</div>
            <p className="text-gray-500 text-sm md:text-base">
              등록된 공지사항이 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeListPage;
