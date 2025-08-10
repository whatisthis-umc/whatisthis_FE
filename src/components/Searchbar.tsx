import React, { useEffect } from "react";
import { search, arrowDownIcon } from "../assets";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Searchbar = ({ onSearch }: { onSearch: (keyword: string) => void }) => {
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setInput("");
    setIsSearchOpen(false);
  }, [location.pathname]);

  const handleSearch = () => {
    if (input.trim()) {
      // 통합 검색
      navigate(`/search?q=${encodeURIComponent(input.trim())}`);
    }
  };

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
    <div className="relative w-[40px] md:w-[240px] ml-auto mt-4 md:sticky md:top-4 md:right-4 md:z-50 md:mt-0 md:float-right">
      <div className="flex w-full h-[40px] md:border-b md:border-[#333333] relative">
        {/*모바일용 검색창*/}
        {isSearchOpen && (
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="검색어 입력"
            className="absolute right-4 top-0 w-[100px] h-[30px] px-2 text-sm text-black placeholder-gray-400 border-b border-b-gray-300 z-20 md:hidden"
            autoFocus
          />
        )}
        {!isSearchOpen && (
          <div className="hidden md:block w-[152px] md:text-start ">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="1. 인기검색어"
              className="placeholder:invisible md:placeholder:visible"
            />
          </div>
        )}
        {!isSearchOpen && (
          <img
            src={arrowDownIcon}
            alt="보기"
            className="hidden md:inline-block w-[24px] h-[24px] md:cursor-pointer md:ml-auto"
            onClick={() => setIsOpen(!isOpen)}
          />
        )}
        <img
          src={search}
          alt="검색"
          onClick={() => {
            if (window.innerWidth < 768) {
              if (isSearchOpen) {
                handleSearch(); // 검색창 열려 있을 때는 검색 실행
              } else {
                setIsSearchOpen(true); // 닫혀 있을 때는 검색창 열기
              }
            } else {
              handleSearch(); // PC에서는 바로 검색
            }
          }}
          className="w-6 md:w-[24px] h-6 md:h-[24px] ml-auto cursor-pointer z-30"
        />
      </div>
      {/*인기검색어 목록*/}
      {isOpen && !isSearchOpen && (
        <ul className="absolute flex flex-col items-start text-left bg-white text-[#999999] border-[#E6E6E6] border-t-white w-full shadow z-10">
          {keywords.map((word, index) => (
            <li
              key={index}
              className="px-3 py-2 text-[16px] hover:text-gray-700 cursor-pointer"
              onClick={() => {
                setInput(word);
                setIsOpen(false);
                navigate(`/search?q=${encodeURIComponent(word)}`);
              }}
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
