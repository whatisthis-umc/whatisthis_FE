import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SortDropdown from "../../components/common/SortDropdown";
import Pagination from "../../components/customer/Pagination";
import { eye, like, commentIcon, bestBadge, writeIcon } from "../../assets";

const categories = [
  "전체",
  "인기글",
  "생활꿀팁",
  "꿀템 추천",
  "살까말까?",
  "궁금해요!",
];

const dummyData = [
  {
    id: 1,
    category: "생활꿀팁",
    title: "전자레인지에 물기 흘렸는데 녹았어요 등등 등등 등등 등등...",
    content: "PPT까지 PPS까지 모르고 그냥 물티슈랑 키친타올만 구입 넣어야...",
    nickname: "강주영",
    time: "3일 전",
    views: 106,
    likes: 244,
    comments: 32,
    hashtags: ["#전자레인지", "#물기처리", "#생활꿀팁"],
    isBest: true,
  },
  {
    id: 2,
    category: "생활꿀팁",
    title: "냉장고 청소 쉽게 하는 방법 알려드림",
    content: "식초랑 물만 있으면 됩니다. 정말 간단해요.",
    nickname: "생활고수",
    time: "2일 전",
    views: 54,
    likes: 122,
    comments: 10,
    hashtags: ["#냉장고", "#청소", "#생활팁"],
    isBest: false,
  },
  {
    id: 3,
    category: "꿀템 추천",
    title: "다이소에서 산 USB 선풍기 개좋음",
    content: "진짜 조용하고 강력해요. 5000원이면 개이득.",
    nickname: "꿀템수집가",
    time: "5시간 전",
    views: 78,
    likes: 210,
    comments: 18,
    hashtags: ["#다이소", "#선풍기", "#추천템"],
    isBest: false,
  },
  {
    id: 4,
    category: "살까말까?",
    title: "스탠드형 무선 청소기 써보신 분?",
    content: "삼성, LG, 샤오미 중 고민 중인데 어떤 게 제일 실용적인지 궁금합니다.",
    nickname: "청소고민남",
    time: "1시간 전",
    views: 12,
    likes: 4,
    comments: 3,
    hashtags: ["#청소기", "#무선", "#추천"],
    isBest: false,
  },
];

const CommunityPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sortType, setSortType] = useState("인기순");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const navigate = useNavigate();

  useEffect(() => {
    const updateItemsPerPage = () => {
      setItemsPerPage(window.innerWidth < 768 ? 4 : 6);
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  const filteredData = dummyData.filter((item) => {
    if (selectedCategory === "전체") return true;
    if (selectedCategory === "인기글") return item.isBest;
    return item.category === selectedCategory;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortType === "인기순") {
      if (a.isBest && !b.isBest) return -1;
      if (!a.isBest && b.isBest) return 1;
      return b.likes - a.likes;
    }
    return 0;
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="font-[Pretendard] px-4 md:px-8 py-6 w-full relative z-0">
      <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
        {categories.map((cat) => (
          <div
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentPage(1);
            }}
            className={`cursor-pointer px-3 py-1 md:px-4 md:py-2 rounded-full border text-[12px] md:text-[14px] ${
              selectedCategory === cat
                ? "border-[#0080FF] text-[#0080FF]"
                : "border-[#E6E6E6] text-[#999999]"
            }`}
          >
            {cat}
          </div>
        ))}
      </div>

      <div className="flex justify-end mb-4">
        <SortDropdown defaultValue={sortType} onChange={setSortType} />
      </div>

      <div className="flex flex-col gap-4">
        {paginatedData.length === 0 ? (
          <div className="text-center text-[#999] text-[14px] mt-10">
            게시글이 없습니다.
          </div>
        ) : (
          paginatedData.map((item, index) => (
            <div
              key={item.id}
              onClick={() => index === 0 && navigate("/post")}
              className={`flex flex-col cursor-pointer ${
                item.isBest ? "bg-[#CCE5FF] border-none" : "bg-white border border-[#CCCCCC]"
              } rounded-[32px] p-4 md:p-6 gap-3 md:gap-4 w-full md:w-[1132px]`}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center px-2 py-[2px] md:px-3 md:py-1 border rounded-[32px] text-[10px] md:text-[14px] border-[#999999] text-[#333333]">
                  {item.category}
                </div>
                {item.isBest && (
                  <div className="flex items-center px-2 py-[2px] md:px-3 md:py-1 rounded-[32px] text-[10px] md:text-[14px] bg-[#66B2FF] text-white">
                    Best
                  </div>
                )}
                {item.hashtags.map((tag, idx) => (
                  <div
                    key={idx}
                    className="flex items-center px-2 py-[2px] md:px-3 md:py-1 rounded-[32px] text-[10px] md:text-[14px] bg-[#CCE5FF] text-[#666666]"
                  >
                    {tag}
                  </div>
                ))}
              </div>

              <div className="text-[16px] md:text-[18px] font-medium">{item.title}</div>
              <div className="text-[12px] md:text-[14px] text-[#666666]">{item.content}</div>
              <div className="flex items-center gap-3 text-[12px] md:text-[14px] text-[#999]">
                <span className="flex items-center gap-1 text-[#333333]">
                  {item.isBest && (
                    <img src={bestBadge} alt="best" className="w-[14px] h-[14px] md:w-[16px] md:h-[16px]" />
                  )}
                  {item.nickname} · {item.time}
                </span>
                <div className="flex items-center gap-1">
                  <img src={eye} alt="views" className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{item.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <img src={like} alt="likes" className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{item.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <img src={commentIcon} alt="comments" className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{item.comments}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8">
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(sortedData.length / itemsPerPage)}
          onPageChange={setCurrentPage}
        />
      </div>

      <div className="fixed bottom-5 right-5 md:static md:mt-10 flex justify-end z-[50]">
        <button
          onClick={() => alert("글쓰기 버튼 클릭됨")}
          className="bg-[#0080FF] text-white flex items-center gap-2 rounded-[32px] px-6 py-3 text-sm md:text-base"
        >
          <img src={writeIcon} alt="write" className="w-5 h-5" />
          글쓰기
        </button>
      </div>
    </div>
  );
};

export default CommunityPage;