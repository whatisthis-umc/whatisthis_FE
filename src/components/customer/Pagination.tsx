import React from "react";
import { chevronBackward } from "../../assets";
import { chevronForward } from "../../assets";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // 한 번에 보여줄 페이지 수 (6개)
  const maxVisiblePages = 6;

  // 시작 페이지와 끝 페이지 계산
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  // 끝 페이지가 총 페이지 수보다 작을 때 시작 페이지 조정
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // 표시할 페이지 번호 배열 생성
  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className="flex justify-center items-center" style={{ gap: "24px" }}>
      {/* 이전 페이지 버튼 - 항상 표시 */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={`w-6 h-6 rounded-full transition-colors flex flex-col justify-center items-center ${
          currentPage <= 1
            ? "opacity-30 cursor-not-allowed"
            : "hover:bg-gray-100 cursor-pointer"
        }`}
        style={{ gap: "10px" }}
      >
        <img src={chevronBackward} alt="이전 페이지" className="w-4 h-4" />
      </button>

      {/* 페이지 번호들 (최대 6개) */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-6 h-6 text-sm font-medium transition-colors flex flex-col justify-center items-center flex-shrink-0 ${
            page === currentPage
              ? "text-white"
              : "bg-white text-gray-500 hover:bg-gray-100"
          }`}
          style={{
            gap: "10px",
            borderRadius: "32px",
            ...(page === currentPage && { background: "#0080FF" }),
          }}
        >
          {page}
        </button>
      ))}

      {/* 다음 페이지 버튼 - 항상 표시 */}
      <button
        onClick={() =>
          currentPage < totalPages && onPageChange(currentPage + 1)
        }
        disabled={currentPage >= totalPages}
        className={`w-6 h-6 rounded-full transition-colors flex flex-col justify-center items-center ${
          currentPage >= totalPages
            ? "opacity-30 cursor-not-allowed"
            : "hover:bg-gray-100 cursor-pointer"
        }`}
        style={{ gap: "10px" }}
      >
        <img src={chevronForward} alt="다음 페이지" className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
