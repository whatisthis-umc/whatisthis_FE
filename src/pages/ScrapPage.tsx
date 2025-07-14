import { useState } from "react";

interface ScrapItem {
  id: number;
  title: string;
  content: string;
  bookmarked: boolean;
}

const initialScraps: ScrapItem[] = Array.from({ length: 50 }, (_, idx) => ({
  id: idx + 1,
  title: "국가원로자문회의 의장은...",
  content: "다만, 직권대통령이 없을 때에는 대통령의 권한을 대행한다...",
  bookmarked: true,
}));

const ScrapPage = () => {
  const [scraps, setScraps] = useState<ScrapItem[]>(initialScraps);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(scraps.length / itemsPerPage);

  const handleToggleBookmark = (id: number) => {
    setScraps((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, bookmarked: !item.bookmarked } : item
      )
    );
  };

  const currentItems = scraps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startPage = 1;
  const endPage = Math.min(5, totalPages);

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10">
      <h2 className="text-xl font-semibold mb-4 text-left">나의 스크랩</h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-10">
        {currentItems.map((item) => (
          <div key={item.id} className="flex flex-col">
            {/* 회색 이미지 박스 */}
            <div
              className="relative w-full aspect-[1/1] rounded-lg"
              style={{ backgroundColor: "#D9D9D9" }}
            >
              <button
                onClick={() => handleToggleBookmark(item.id)}
                className="absolute bottom-2 right-2"
              >
                <img
                  src="/src/assets/darkBookmark.png"
                  alt="bookmark"
                  className={`w-4 h-4 transition-opacity ${
                    item.bookmarked ? "opacity-100" : "opacity-30"
                  }`}
                />
              </button>
            </div>

            {/* 텍스트 */}
            <div className="mt-2">
              <h3 className="font-medium text-sm truncate">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm truncate">
                {item.content}
              </p>
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

        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
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
        ))}

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

export default ScrapPage;
