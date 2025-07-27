import { Link, useLocation } from "react-router-dom";

const CustomerNav = () => {
  const location = useLocation();

  // 현재 경로에 따라 활성 버튼 결정
  const getButtonClass = (path: string) => {
    const isActive =
      location.pathname === path || location.pathname.startsWith(path + "/");
    return isActive
      ? "flex px-4 py-2 md:px-6 md:py-3 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors justify-center items-center"
      : "flex px-4 py-2 md:px-6 md:py-3 rounded-full hover:bg-gray-50 transition-colors justify-center items-center";
  };

  // 텍스트 스타일
  const getTextStyle = (path: string) => {
    const isActive =
      location.pathname === path || location.pathname.startsWith(path + "/");
    return {
      color: isActive ? "white" : "#333",
      fontFamily: "Pretendard",
      fontStyle: "normal",
      fontWeight: 500,
      lineHeight: "150%",
      letterSpacing: "-0.4px",
    };
  };

  // 텍스트 크기 클래스
  const getTextSizeClass = () => {
    return "text-sm md:text-lg lg:text-xl";
  };

  return (
    <div className="flex justify-start space-x-2 md:space-x-3 mb-6 md:mb-10 max-w-[1440px] mx-auto px-4">
      {/* 공지사항 버튼 */}
      <Link
        to="/customer/notice"
        className={`${getButtonClass("/customer/notice")} ${getTextSizeClass()}`}
        style={getTextStyle("/customer/notice")}
      >
        공지사항
      </Link>

      {/* Q&A 버튼 */}
      <Link
        to="/customer/qna"
        className={`${getButtonClass("/customer/qna")} ${getTextSizeClass()}`}
        style={getTextStyle("/customer/qna")}
      >
        Q&A
      </Link>

      {/* 1:1 문의 버튼 */}
      <Link
        to="/customer/inquiry"
        className={`${getButtonClass("/customer/inquiry")} ${getTextSizeClass()}`}
        style={getTextStyle("/customer/inquiry")}
      >
        1:1 문의
      </Link>
    </div>
  );
};

export default CustomerNav;
