import { useState } from "react";
import CustomerNav from "../../components/customer/CustomerNav";

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

운영팀 드림`
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

감사합니다.`
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

자세한 사용법은 도움말을 참조해주세요.`
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
이용에 불편을 드려 죄송합니다.`
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

변경된 처리방침은 홈페이지에서 확인하실 수 있습니다.`
    },
  ];

  const toggleExpanded = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="flex-1 bg-white">
      <div className="w-full pt-16 pb-8">
        {/* 고객센터 네비게이션 */}
        <CustomerNav />

        {/* 공지사항 목록 */}
        <div className="space-y-4">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="bg-white border border-gray-200 rounded-4xl overflow-hidden transition-shadow hover:shadow-md"
            >
              {/* 공지사항 헤더 (클릭 가능) */}
              <div
                className="p-6 cursor-pointer"
                onClick={() => toggleExpanded(notice.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-6 text-left">
                      {notice.isRequired && (
                        <span className="bg-white text-gray-700 text-sm px-3 py-1 font-medium border border-gray-200 rounded-4xl mb-6 inline-block">
                          필독
                        </span>
                      )}
                      <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors">
                        {notice.title}
                      </h3>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 space-x-2">
                      <span>{notice.author}</span>
                      <span>•</span>
                      <span>{notice.date}</span>
                    </div>
                  </div>
                  {/* 펼침/접힘 아이콘 */}
                  <div className="ml-4">
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedId === notice.id ? "rotate-180" : ""
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

              {/* 공지사항 상세 내용 (펼쳐질 때만 표시) */}
              {expandedId === notice.id && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="pt-6">
                    <div className="prose max-w-none text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                      {notice.content}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 빈 상태일 때 */}
        {notices.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-lg mb-2">📢</div>
            <p className="text-gray-500">등록된 공지사항이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeListPage;
