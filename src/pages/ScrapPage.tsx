import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getScrapList, deleteScrap, type ScrapItem } from "../api/scrapApi";

const ScrapPage = () => {
  const navigate = useNavigate();
  const [scraps, setScraps] = useState<ScrapItem[]>([]);
  const [allScraps, setAllScraps] = useState<ScrapItem[]>([]); // 모든 스크랩 데이터
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 10;

  // 스크랩 목록 조회
  const fetchScraps = async () => {
    try {
      setLoading(true);
      setError(null);

      // 모든 스크랩 데이터를 가져옴 (페이지네이션 없이)
      const result = await getScrapList(0, 1000); // 서버와 동일하게 0부터 시작

      // 중복 제거 (id 기준으로 중복 제거)
      const uniqueScraps = result.scraps.reduce(
        (acc: ScrapItem[], current: ScrapItem) => {
          const exists = acc.find((item) => item.id === current.id);
          if (!exists) {
            acc.push(current);
          }
          return acc;
        },
        []
      );

      console.log("받은 스크랩 데이터:", result.scraps);
      console.log("중복 제거 후:", uniqueScraps);
      console.log(
        "첫 번째 스크랩 아이템의 모든 필드:",
        uniqueScraps[0] ? Object.keys(uniqueScraps[0]) : "데이터 없음"
      );

      setAllScraps(uniqueScraps);
      setTotalElements(uniqueScraps.length);
      setTotalPages(Math.ceil(uniqueScraps.length / itemsPerPage));
    } catch (err: any) {
      console.error("스크랩 목록 조회 실패:", err);
      setError(err.message || "스크랩 목록을 불러오는 중 오류가 발생했습니다.");
      setAllScraps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScraps();
  }, []);

  // 현재 페이지의 스크랩 계산
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentScraps = allScraps.slice(startIndex, endIndex);
    setScraps(currentScraps);
  }, [currentPage, allScraps]);

  const handleToggleBookmark = async (scrapId: number) => {
    try {
      // 스크랩 해제 API 호출
      await deleteScrap(scrapId);

      // 성공 시 목록에서 제거 (postId 기준으로 제거)
      setAllScraps((prev) => {
        const item = prev.find((item) => item.id === scrapId);
        const postId = item?.postId || item?.id;
        return prev.filter((item) => item.id !== scrapId);
      });

      // 총 개수 감소
      setTotalElements((prev) => prev - 1);

      // 현재 페이지에 아이템이 없고 이전 페이지가 있으면 이전 페이지로 이동
      if (allScraps.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      console.log(`스크랩 해제 - scrapId: ${scrapId}`);
      console.log(
        `현재 로컬 스토리지:`,
        JSON.parse(localStorage.getItem("scrappedPosts") || "[]")
      );

      alert("스크랩이 해제되었습니다.");
    } catch (err: any) {
      console.error("스크랩 해제 실패:", err);
      alert(err.message || "스크랩 해제 중 오류가 발생했습니다.");
    }
  };

  const handleItemClick = (item: ScrapItem) => {
    // API에서 postId가 없으므로 id를 postId로 사용
    const postId = item.id;
    const type = item.category?.includes("TIP") ? "tips" : "items";
    navigate(`/${type}/${postId}`);
  };

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-6 py-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-screen-xl mx-auto px-6 py-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10">
      <h2 className="text-xl font-semibold mt-15 mb-15 text-left">
        나의 스크랩
      </h2>

      {scraps.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">스크랩한 게시물이 없습니다.</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-10">
            {scraps.map((item) => (
              <div key={item.id} className="flex flex-col">
                {/* 이미지 박스 */}
                <div
                  className="relative w-full aspect-[1/1] rounded-lg cursor-pointer overflow-hidden"
                  onClick={() => handleItemClick(item)}
                  style={{ backgroundColor: "#D9D9D9" }}
                >
                  {item.thumbnailUrl &&
                  item.thumbnailUrl !==
                    "https://via.placeholder.com/300x200?text=No+Image" ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400 text-sm">이미지 없음</span>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleBookmark(item.id);
                    }}
                    className="absolute bottom-2 right-2"
                  >
                    <img
                      src="/src/assets/darkBookmark.png"
                      alt="bookmark"
                      className="w-4 h-4 opacity-100"
                    />
                  </button>
                </div>

                {/* 텍스트 */}
                <div
                  className="mt-2 cursor-pointer"
                  onClick={() => handleItemClick(item)}
                >
                  <h3 className="font-medium text-sm truncate">{item.title}</h3>
                  <p className="text-gray-500 text-sm truncate">
                    {item.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 페이지네이션 */}
      {scraps.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center gap-1 text-sm">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`px-2 ${currentPage === 1 ? "text-gray-400" : "text-gray-600"}`}
          >
            &lt;
          </button>

          {Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i
          ).map((page) => (
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
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className={`px-2 ${
              currentPage === totalPages ? "text-gray-400" : "text-gray-600"
            }`}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default ScrapPage;
