import { useState } from "react";

interface LikeItem {
  id: number;
  title: string;
  content: string;
  liked: boolean;
}

const initialLikes: LikeItem[] = Array.from({ length: 50 }, (_, idx) => ({
  id: idx + 1,
  title: "국가보건자료협의 의...",
  content: "다만, 직관담당관의 연례 해부...",
  liked: true,
}));

const LikesPage = () => {
  const [likes, setLikes] = useState<LikeItem[]>(initialLikes);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(likes.length / itemsPerPage);

  const handleToggleLike = (id: number) => {
    setLikes((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, liked: !item.liked } : item
      )
    );
  };

  const currentItems = likes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startPage = 1;
  const endPage = Math.min(5, totalPages);

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10">
      {/* ✅ 왼쪽 상단 정렬된 제목 */}
      <h2 className="text-xl font-semibold mb-4 text-left">나의 좋아요</h2>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-10">
        {currentItems.map((item) => (
          <div
            key={item.id}
            className="border rounded-xl p-4 flex flex-col justify-between h-40 shadow-sm"
          >
            <div>
              <h3 className="font-medium text-sm truncate">{item.title}</h3>
              <p className="text-gray-500 text-sm truncate">{item.content}</p>
            </div>
            <div className="flex justify-end">
              <button onClick={() => handleToggleLike(item.id)}>
                <img
                  src="/src/assets/darkHeart.png"
                  alt="heart"
                  className={`w-5 h-5 transition-opacity duration-150 ${
                    item.liked ? "opacity-100" : "opacity-30"
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center items-center gap-1 text-sm">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          className={`px-2 ${currentPage === 1 ? "text-gray-400" : "text-gray-600"}`}
        >
          &lt;
        </button>

        {[...Array(endPage - startPage + 1)].map((_, idx) => {
          const page = startPage + idx;
          return (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-6 h-6 rounded-full text-center ${
                currentPage === page
                  ? "bg-blue-500 text-white"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          className={`px-2 ${
            currentPage === totalPages ? "text-gray-400" : "text-gray-600"
          }`}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default LikesPage;
