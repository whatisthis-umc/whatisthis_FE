import { Link } from "react-router-dom";
import CustomerNav from "../../components/customer/CustomerNav";

interface Notice {
  id: number;
  title: string;
  date: string;
  author: string;
  isRequired: boolean;
}

const NoticeListPage = () => {
  // 더미 데이터
  const notices: Notice[] = [
    {
      id: 1,
      title: "베스트 올 선정 기준 변경 안내",
      date: "24일 전",
      author: "관리자",
      isRequired: true,
    },
    {
      id: 2,
      title: "리뷰 점멸 강화 안내",
      date: "3일 전",
      author: "관리자",
      isRequired: true,
    },
    {
      id: 3,
      title: "신규 기능 업데이트 안내",
      date: "1주 전",
      author: "관리자",
      isRequired: false,
    },
    {
      id: 4,
      title: "시스템 점검 안내",
      date: "2주 전",
      author: "관리자",
      isRequired: false,
    },
    {
      id: 5,
      title: "개인정보 처리방침 변경 안내",
      date: "3주 전",
      author: "관리자",
      isRequired: false,
    },
  ];

  return (
    <div className="flex-1 bg-white">
      <div className="w-full pt-16 pb-8">
        {/* 고객센터 네비게이션 */}
        <CustomerNav />

        {/* 공지사항 목록 */}
        <div className="space-y-10">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="bg-white border border-gray-200 rounded-4xl p-6 hover:shadow-md transition-shadow"
            >
              <Link to={`/customer/notice/${notice.id}`} className="block">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-6 text-left">
                      {notice.isRequired && (
                        <span
                          className="bg-white text-gray-700 text-sm px-3 py-1 font-medium
                        border border-gray-200 rounded-4xl mb-6 inline-block"
                        >
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
                </div>
              </Link>
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
