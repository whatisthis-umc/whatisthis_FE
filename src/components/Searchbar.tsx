import search from "/src/assets/search.png";
import arrow_down from "/src/assets/arrow_down.png";
import { useState } from "react";

const Searchbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  // 인기 검색어 목록 임시목록
  const keywords = [
    "다이소 티슈",
    "다이소 수건",
    "다이소 물티슈",
    "다이소 옷걸이",
    "다이소 머그컵",
    "다이소 인형",
  ];

  return (
    <div className="relative w-[240px] ml-auto">
      <div className="flex w-full h-[40px] border-b border-[#333333]">
        <div className="w-[152px] text-start ">1. 인기검색어</div>
        <img
          src={arrow_down}
          alt="보기"
          className="w-[24px] h-[24px] cursor-pointer ml-auto"
          onClick={() => setIsOpen(!isOpen)}
        />
        <img src={search} alt="검색" className="w-[24px] h-[24px] ml-auto" />
      </div>
      {/*인기검색어 목록*/}
      {isOpen && (
        <ul className="relative flex flex-col items-start text-left bg-white text-[#999999] border-[#E6E6E6] border-t-white w-full shadow z-10">
          {keywords.map((word, index) => (
            <li
              key={index}
              className="px-3 py-2 text-[16px] hover:text-gray-700 cursor-pointer"
            >
              {" "}
              {index + 1}. {word}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Searchbar;
