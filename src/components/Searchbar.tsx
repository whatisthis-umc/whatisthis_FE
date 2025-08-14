import { useEffect } from "react";
import { search, arrowDownIcon } from "../assets";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getPopularKeywords } from "../api/popularKeywordsApi";

const Searchbar = ({}: { onSearch: (keyword: string) => void }) => {
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeywordIndex, setCurrentKeywordIndex] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setInput("");
  }, [location.pathname]);

  // 인기 검색어 데이터 가져오기
  useEffect(() => {
    const loadPopularKeywords = async () => {
      try {
        const popularKeywords = await getPopularKeywords();
        setKeywords(popularKeywords.slice(0, 6)); // 상위 6개만 표시
      } catch (error) {
        console.error("인기 검색어 로딩 실패:", error);
        // 기본값 사용
        setKeywords([
          "청소",
          "분리수거", 
          "세탁",
          "요리",
          "냉장고",
          "옷"
        ]);
      }
    };

    loadPopularKeywords();
  }, []);

  // placeholder 자동 순환
  useEffect(() => {
    if (keywords.length === 0) return;

    const interval = setInterval(() => {
      setCurrentKeywordIndex((prev) => (prev + 1) % keywords.length);
    }, 2000); // 2초마다 변경

    return () => clearInterval(interval);
  }, [keywords]);

  const handleSearch = () => {
    if (input.trim()) {
      // 통합 검색
      navigate(`/search?q=${encodeURIComponent(input.trim())}`);
    }
  };



  return (
    <div className="relative w-[80px] md:w-[240px] ml-auto mt-4 md:sticky md:top-4 md:right-4 md:z-50 md:mt-0 md:float-right">
      <div className="flex w-full h-[30px] md:h-[40px] border-b border-[#333333] relative">
        {/* 모바일 + 데스크톱 공통 검색창 */}
        <div className="flex-1 w-full text-start">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder={keywords.length > 0 ? `${currentKeywordIndex + 1}. ${keywords[currentKeywordIndex]}` : "검색어를 입력하세요"}
            className="w-full text-xs md:text-base placeholder-gray-400"
          />
        </div>
        
        {/* 데스크톱용 화살표 */}
        <img
          src={arrowDownIcon}
          alt="보기"
          className="hidden md:inline-block w-[24px] h-[24px] md:cursor-pointer md:ml-auto"
          onClick={() => setIsOpen(!isOpen)}
        />
        
        {/* 검색 아이콘 */}
        <img
          src={search}
          alt="검색"
          onClick={handleSearch}
          className="w-6 md:w-[24px] h-6 md:h-[24px] ml-2 cursor-pointer z-30"
        />
      </div>
      {/*인기검색어 목록*/}
      {isOpen && (
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
