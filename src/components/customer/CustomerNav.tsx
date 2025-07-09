import { Link, useLocation } from "react-router-dom";

const CustomerNav = () => {
  const location = useLocation();

  // 현재 경로에 따라 활성 버튼 결정
  const getButtonClass = (path: string) => {
    const isActive =
      location.pathname === path || location.pathname.startsWith(path + "/");
    return isActive
      ? "flex px-6 py-3 bg-gray-800 text-white rounded-full font-medium hover:bg-gray-700 transition-colors justify-center items-center"
      : "flex px-6 py-3 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors justify-center items-center";
  };

  return (
    <div className="flex justify-start space-x-3 mb-10">
      {/* 공지사항 버튼 */}
      <Link
        to="/customer/notice"
        className={getButtonClass("/customer/notice")}
      >
        공지사항
      </Link>

      {/* Q&A 버튼 */}
      <Link to="/customer/qna" className={getButtonClass("/customer/qna")}>
        Q&A
      </Link>

      {/* 1:1 문의 버튼 */}
      <Link
        to="/customer/inquiry"
        className={getButtonClass("/customer/inquiry")}
      >
        1:1 문의
      </Link>
    </div>
  );
};

export default CustomerNav;
