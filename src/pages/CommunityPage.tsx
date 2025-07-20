import { useState } from "react";
import SortDropdown from "../components/common/SortDropdown";
import { eye } from "../assets";
import { like } from "../assets";
import { commentIcon } from "../assets";
import { bestBadge } from "../assets";
import { writeIcon } from "../assets";

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
];

const CommunityPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sortType, setSortType] = useState("인기순");

  const filteredData = dummyData.filter((item) => {
    if (selectedCategory === "전체") return true;
    if (selectedCategory === "인기글") return item.isBest;
    if (selectedCategory === "생활꿀팁") return item.category === "생활꿀팁";
    if (selectedCategory === "꿀템 추천") return item.category === "꿀템 추천";
    if (selectedCategory === "살까말까?") return item.category === "살까말까?";
    if (selectedCategory === "궁금해요!") return item.category === "궁금해요!";
    return false;
  });

  return (
    <div className="font-[Pretendard] px-8 py-6 w-full">
      {/* 카테고리 탭 */}
      <div className="flex gap-3 mb-6">
        {categories.map((cat) => (
          <div
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`cursor-pointer px-4 py-2 rounded-full border ${
              selectedCategory === cat
                ? "border-[#0080FF] text-[#0080FF]"
                : "border-[#E6E6E6] text-[#999999]"
            }`}
            style={{ fontSize: "14px" }}
          >
            {cat}
          </div>
        ))}
      </div>

      {/* 드롭다운 */}
      <div className="flex justify-end mb-4">
        <SortDropdown
          defaultValue="인기순"
          onChange={(value) => setSortType(value)}
        />
      </div>

      {/* 게시글 목록 */}
      <div className="flex flex-col gap-4">
        {filteredData.length === 0 ? (
          <div className="text-center text-[#999] text-[14px] mt-10">
            게시글이 없습니다.
          </div>
        ) : (
          filteredData.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col ${
                item.isBest
                  ? "bg-[#CCE5FF] border-none"
                  : "bg-white border border-[#CCCCCC]"
              } rounded-[32px] p-6 gap-4`}
              style={{ width: "1132px" }}
            >
              {/* 카테고리 & 해시태그 & Best 뱃지 */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center px-3 py-1 border rounded-[32px] text-[14px] border-[#999999] text-[#333333]">
                  {item.category}
                </div>
                {item.isBest && (
                  <div className="flex items-center px-3 py-1 rounded-[32px] text-[14px] bg-[#66B2FF] text-white">
                    Best
                  </div>
                )}
                {item.hashtags.map((tag, idx) => (
                  <div
                    key={idx}
                    className="flex items-center px-3 py-1 rounded-[32px] text-[14px] bg-[#CCE5FF] text-[#666666]"
                  >
                    {tag}
                  </div>
                ))}
              </div>

              {/* 제목 */}
              <div className="text-[18px] font-medium">{item.title}</div>

              {/* 내용 */}
              <div className="text-[14px] text-[#666666]">{item.content}</div>

              {/* 아이콘 영역 */}
              <div className="flex items-center gap-3 text-[14px] text-[#999]">
                <span className="flex items-center gap-1 text-[#333333]">
                  {item.isBest && (
                    <img
                      src={bestBadge}
                      alt="best"
                      className="w-[16px] h-[16px]"
                    />
                  )}
                  {item.nickname} · {item.time}
                </span>
                <div className="flex items-center gap-1">
                  <img src={eye} alt="views" className="w-4 h-4" />
                  <span>{item.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <img src={like} alt="likes" className="w-4 h-4" />
                  <span>{item.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <img src={commentIcon} alt="comments" className="w-4 h-4" />
                  <span>{item.comments}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 글쓰기 버튼 */}
      <div className="flex justify-end mt-10 relative">
        <button
          onClick={() => alert("글쓰기 버튼 클릭됨")}
          className="bg-[#0080FF] text-white flex items-center gap-2 rounded-[32px]"
          style={{ width: "156px", height: "54px", padding: "12px 32px" }}
        >
          <img src={writeIcon} alt="write" className="w-5 h-5" />
          글쓰기
        </button>
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center mt-4 gap-2 text-[#999] text-[14px]">
        <span>&lt;</span>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <span key={n} className="mx-1 cursor-pointer">
            {n}
          </span>
        ))}
        <span>&gt;</span>
      </div>
    </div>
  );
};

export default CommunityPage;
