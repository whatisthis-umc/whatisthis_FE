import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaHeart } from "react-icons/fa";

// 📌 게시물 타입 정의
interface Post {
  id: number;
  category: string;
  tags: string[];
  title: string;
  desc: string;
  writer: string;
  date: string;
  views: number;
  likes: number;
  comments: number;
}

// 📌 정렬 옵션
const sortOptions: string[] = ["인기순", "최신순"];

// 📌 더미 게시물 데이터
const dummyPosts: Post[] = [
  {
    id: 1,
    category: "생활꿀팁",
    tags: ["#생활꿀팁"],
    title: "전자레인지에 용기 돌렸는데 녹았어요",
    desc: "PP보다 PS같기도 모르고 그냥 돌렸다가 바닥에 구멍 뚫어져...",
    writer: "강주영",
    date: "3일 전",
    views: 106,
    likes: 244,
    comments: 32,
  },
  {
    id: 2,
    category: "생활꿀팁",
    tags: ["#자취생팁"],
    title: "세탁기 돌릴 때 섬유유연제 따로 넣는 법?",
    desc: "처음 자취하는데 세탁기 설정 어렵네요... 순서 좀 알려주세요.",
    writer: "이채은",
    date: "2일 전",
    views: 87,
    likes: 134,
    comments: 18,
  },
  {
    id: 3,
    category: "생활꿀팁",
    tags: ["Best", "#청소꿀팁"],
    title: "배수구 청소할 때 이 조합 진짜 미쳤어요",
    desc: "베이킹소다 + 식초 조합으로 싹 해결됨. 냄새도 없어졌어요.",
    writer: "박세현",
    date: "1일 전",
    views: 193,
    likes: 289,
    comments: 45,
  },
  {
    id: 4,
    category: "생활꿀팁",
    tags: ["Best", "#반려동물"],
    title: "고양이 털 제거하는 장갑 후기!",
    desc: "고양이 키우면 이거 무조건 사세요. 천국됩니다.",
    writer: "황유빈",
    date: "5시간 전",
    views: 222,
    likes: 301,
    comments: 56,
  },
  {
    id: 5,
    category: "생활꿀팁",
    tags: ["#자취방정리"],
    title: "자취방 좁은데 수납공간 늘리는 꿀팁",
    desc: "벽 선반 설치하면 진짜 깔끔해져요. 추천템 링크도 있어요!",
    writer: "이승리",
    date: "1시간 전",
    views: 152,
    likes: 167,
    comments: 23,
  },
  {
    id: 6,
    category: "생활꿀팁",
    tags: ["#알뜰쇼핑", "#쿠팡"],
    title: "쿠팡에서 반값 득템한 후기 🔥",
    desc: "진짜 싸게 산 것 같아서 공유해요~ 다들 득템하세요!",
    writer: "김민정",
    date: "방금 전",
    views: 73,
    likes: 91,
    comments: 12,
  },
];

const CommunityPage = () => {
  const navigate = useNavigate();

  const [sort, setSort] = useState<string>("인기순");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const selectSort = (option: string) => {
    setSort(option);
    setDropdownOpen(false);
  };

  // 정렬된 게시물 목록
  const sortedPosts: Post[] = [...dummyPosts].sort((a, b) => {
    if (sort === "인기순") return b.likes - a.likes;
    if (sort === "최신순") return b.id - a.id; // id 기준으로 최신 판단
    return 0;
  });

  return (
    <div className="max-w-[1200px] mx-auto p-6">
      {/* 🔽 드롭다운 정렬 메뉴 */}
      <div className="relative inline-block mb-6">
        <button
          onClick={toggleDropdown}
          className="bg-white border border-gray-400 rounded-full px-4 py-1 text-sm font-semibold flex items-center gap-2"
        >
          {sort} ▼
        </button>
        {dropdownOpen && (
          <div className="absolute mt-2 w-full bg-white border rounded shadow z-10">
            {sortOptions.map((option) => (
              <div
                key={option}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => selectSort(option)}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 📝 게시물 리스트 */}
      <div className="flex flex-col gap-4">
        {sortedPosts.map((post) => (
          <div
            key={post.id}
            className="bg-blue-50 rounded-xl p-4 shadow cursor-pointer hover:bg-blue-100 transition"
            onClick={() => navigate(`/post/${post.id}`)}
          >
            <div className="flex gap-2 mb-2">
              <span className="bg-gray-200 px-2 py-1 rounded text-xs">
                {post.category}
              </span>
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded text-xs"
                  style={{ backgroundColor: "#CCFF00" }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-lg font-semibold truncate">{post.title}</h2>
            <p className="text-gray-600 text-sm truncate">{post.desc}</p>
            <div className="text-gray-500 text-xs mt-2 flex gap-4">
              <span>👤 {post.writer}</span>
              <span>📅 {post.date}</span>
              <span>👁 {post.views}</span>
              <span>❤️ {post.likes}</span>
              <span>💬 {post.comments}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityPage;
