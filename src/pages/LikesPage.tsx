import { useState } from "react";
import Pagination from "../components/customer/Pagination";
import { darkHeart } from "../assets";

interface LikeItem {
  id: number;
  title: string;
  content: string;
  liked: boolean;
}

const initialLikes: LikeItem[] = Array.from({ length: 50 }, (_, idx) => ({
  id: idx + 1,
  title: "국가원료자문회의 의장은...",
  content: "다만, 직권대통령이 없을 때에는 대통령의 권한을 대행한다...",
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const currentItems = likes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10">
      <h2 className="text-xl font-semibold mt-15 mb-15 text-left">나의 좋아요</h2>

      {/* 카드 영역 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-10">
        {currentItems.map((item) => (
          <div key={item.id} className="flex flex-col">
            {/* 카드 박스 */}
            <div className="relative w-full aspect-[1/1] rounded-[32px] border border-gray-300 shadow-sm p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-medium text-sm truncate">{item.title}</h3>
                <p className="text-gray-500 text-sm truncate">{item.content}</p>
              </div>
              <div className="flex justify-end">
                <button onClick={() => handleToggleLike(item.id)}>
                  <img
                    src={darkHeart}
                    alt="heart"
                    className={`w-5 h-5 transition-opacity duration-150 ${
                      item.liked ? "opacity-100" : "opacity-30"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="mt-12">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default LikesPage;