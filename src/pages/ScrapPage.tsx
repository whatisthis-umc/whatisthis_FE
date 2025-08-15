import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getScrapList, deleteScrap, type ScrapItem } from "../api/scrapApi";
import { afterscrap, darkBookmark } from "../assets";

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

      // 스웨거 기본값에 맞춰 조회 (page=1, size=5)
      const result = await getScrapList(1, 5);

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

      // 스크랩된 게시물의 scrapId를 localStorage에 저장
      const scrappedPostIds = JSON.parse(
        localStorage.getItem("scrappedPosts") || "[]"
      );
      const scrappedPostData = JSON.parse(
        localStorage.getItem("scrappedPostData") || "{}"
      );

      // 기존 데이터와 새로운 데이터를 병합
      uniqueScraps.forEach((scrapItem) => {
        if (!scrappedPostIds.includes(scrapItem.postId)) {
          scrappedPostIds.push(scrapItem.postId);
        }
        scrappedPostData[scrapItem.postId] = {
          scrapId: scrapItem.id,
          timestamp: Date.now(),
        };
      });

      localStorage.setItem("scrappedPosts", JSON.stringify(scrappedPostIds));
      localStorage.setItem(
        "scrappedPostData",
        JSON.stringify(scrappedPostData)
      );

      console.log("업데이트된 localStorage:", {
        scrappedPosts: scrappedPostIds,
        scrappedPostData: scrappedPostData,
      });

      // 각 스크랩 아이템의 상세 정보 로그
      uniqueScraps.forEach((scrapItem) => {
        console.log(
          `스크랩 아이템 - postId: ${scrapItem.postId}, scrapId: ${scrapItem.id}, title: ${scrapItem.title}`
        );
      });

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
      // 해당 스크랩 아이템 찾기
      const scrapItem = allScraps.find((item) => item.id === scrapId);
      if (!scrapItem) {
        throw new Error("스크랩 아이템을 찾을 수 없습니다.");
      }

      // 스크랩 해제 API 호출 (postId와 scrapId 모두 전달)
      await deleteScrap(scrapItem.postId, scrapId);

      // 성공 시 목록에서 제거 (id 기준으로 제거)
      setAllScraps((prev) => {
        return prev.filter((item) => item.id !== scrapId);
      });

      // 총 개수 감소
      setTotalElements((prev) => prev - 1);

      // 현재 페이지에 아이템이 없고 이전 페이지가 있으면 이전 페이지로 이동
      if (allScraps.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      // localStorage에서도 제거
      const scrappedPostIds = JSON.parse(
        localStorage.getItem("scrappedPosts") || "[]"
      );
      const scrappedPostData = JSON.parse(
        localStorage.getItem("scrappedPostData") || "{}"
      );

      const updatedIds = scrappedPostIds.filter(
        (id: number) => id !== scrapItem.postId
      );
      delete scrappedPostData[scrapItem.postId];

      localStorage.setItem("scrappedPosts", JSON.stringify(updatedIds));
      localStorage.setItem(
        "scrappedPostData",
        JSON.stringify(scrappedPostData)
      );

      console.log(
        `스크랩 해제 - postId: ${scrapItem.postId}, scrapId: ${scrapId}`
      );
      console.log(`업데이트된 localStorage:`, {
        scrappedPosts: updatedIds,
        scrappedPostData: scrappedPostData,
      });

      alert("스크랩이 해제되었습니다.");
    } catch (err: any) {
      console.error("스크랩 해제 실패:", err);
      alert(err.message || "스크랩 해제 중 오류가 발생했습니다.");
    }
  };

  const handleItemClick = (item: ScrapItem) => {
    // 스웨거 API에서 제공하는 postId 사용
    const postId = item.postId;

    // category 정보를 기반으로 타입 결정
    let type = "tips"; // 기본값

    if (item.category === "LIFE_ITEM") {
      type = "items";
    } else if (item.category === "LIFE_TIP") {
      type = "tips";
    }

    console.log(
      `스크랩 아이템 클릭 - postId: ${postId}, type: ${type}, category: ${item.category}`
    );
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
                      <img
                        src={afterscrap}
                        alt="기본 이미지"
                        className="w-8 h-8 opacity-50"
                      />
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
                      src={darkBookmark}
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
