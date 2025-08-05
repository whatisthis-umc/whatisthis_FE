import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CategoryBar from "../../components/CategoryBar";
import Searchbar from "../../components/Searchbar";
import SortDropdown from "../../components/common/SortDropdown";
import ItemCard from "../../components/ItemCard";
import { tipCategories } from "../../data/categoryList";
import { tipService, type TipPost } from "../../api/lifeTipsApi";
import Pagination from "../../components/customer/Pagination";
import { subCategoryEnumMap } from "../../constants/subCategoryEnumMap";

const TipsDetailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sortParam = searchParams.get("sort");
  const categoryParam = searchParams.get("category");
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    categoryParam || "전체"
  );
  const [sortType, setSortType] = useState<"BEST" | "LATEST">(
    sortParam === "popular" ? "BEST" : "LATEST"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [allPosts, setAllPosts] = useState<TipPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postsPerPage, setPostsPerPage] = useState(8);

  // 화면 크기에 따라 페이지당 게시물 수 바뀜
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setPostsPerPage(6);
      } else {
        setPostsPerPage(8);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      setError(null);

      try {
        const allData: any[] = [];
        let page = 1;
        let hasMoreData = true;

        while (hasMoreData && isMounted) {
          const result = await tipService.getAllTips(page);

          if (result.posts.length === 0) {
            hasMoreData = false;
          } else {
            allData.push(...result.posts);
            page++;
          }
        }

        if (!isMounted) return;

        // 전체 데이터에서 중복 제거
        const uniqueData = allData.reduce((acc: any[], current: any) => {
          const exists = acc.find(
            (item: any) => item.postId === current.postId
          );
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, []);

        setAllPosts(uniqueData);
      } catch (e) {
        if (!isMounted) return;
        console.error("Error loading data:", e);
        setError(typeof e === "string" ? e : "데이터 로딩 실패");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 검색
  const searched = keyword
    ? allPosts.filter((p: any) =>
        [p.title, p.summary, ...p.hashtags]
          .join(" ")
          .toLowerCase()
          .includes(keyword.toLowerCase())
      )
    : allPosts;

  // 카테고리 매핑 (UI 카테고리 -> 서버 카테고리)
  const getServerCategory = (uiCategory: string): string => {
    if (uiCategory === "전체") return "";
    return (
      subCategoryEnumMap[uiCategory as keyof typeof subCategoryEnumMap] || ""
    );
  };

  // 카테고리 필터 (subCategories 기준)
  const byCategory =
    selectedCategory === "전체"
      ? searched
      : searched.filter((p: any) => {
          // subCategories 필드에서 서버 카테고리와 매칭되는 항목이 있는지 확인
          const serverCategory = getServerCategory(selectedCategory);
          console.log(
            `Filtering for category: ${selectedCategory}, serverCategory: ${serverCategory}`
          );
          console.log(
            `Post subCategories: ${p.subCategories?.join(", ") || "none"}`
          );
          const matches =
            p.subCategories?.some((cat: string) =>
              cat.toLowerCase().includes(serverCategory.toLowerCase())
            ) || false;
          console.log(`Matches: ${matches}`);
          return matches;
        });

  // 정렬 적용
  const sorted = [...byCategory].sort((a, b) => {
    if (sortType === "BEST") {
      // 조회수 + 스크랩 수로 인기도
      const popularityA = (a.views || 0) + (a.scraps || 0);
      const popularityB = (b.views || 0) + (b.scraps || 0);
      return popularityB - popularityA;
    } else {
      return b.postId - a.postId;
    }
  });

  // 페이지네이션 적용
  const totalPages = Math.ceil(sorted.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = sorted.slice(startIndex, endIndex);

  return (
    <div className="px-4">
      {/* 검색 + 카테고리 */}
      {!keyword && (
        <div className="flex justify-between items-center mt-4">
          <CategoryBar
            categories={["전체", ...tipCategories]}
            selected={selectedCategory}
            onSelect={(category) => {
              setSelectedCategory(category);
              setCurrentPage(1); // 카테고리 변경 시 1페이지로 리셋
            }}
          />
          <div className="hidden md:block">
            <Searchbar onSearch={setKeyword} />
          </div>
        </div>
      )}

      {keyword && (
        <div className="flex justify-end items-center mt-4">
          <div className="hidden md:block">
            <Searchbar onSearch={setKeyword} />
          </div>
        </div>
      )}

      {keyword ? (
        <div className="mt-10 px-8">
          <h2 className="ml-2 md:ml-5 text-[16px] md:text-[24px] font-bold mb-4 text-[#333333]">
            <span className="w-fit px-1 py-1 bg-[#F5FFCC] rounded-2xl">
              {keyword}
            </span>
            에 대한 통합검색 결과
          </h2>
          {searched.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-1 md:gap-4">
              {searched.map((post, index) => (
                <div
                  key={`${post.postId}-${index}`}
                  onClick={() => navigate(`/tips/${post.postId}`)}
                  className="cursor-pointer"
                >
                  <ItemCard
                    id={post.postId}
                    category={post.category}
                    hashtag={post.hashtags}
                    imageUrl={post.imageUrls}
                    title={post.title}
                    description={post.summary}
                    views={post.views}
                    scraps={post.scraps}
                    date={new Date(post.date)}
                    type="tips"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 mt-8">검색 결과가 없습니다.</div>
          )}
        </div>
      ) : (
        <>
          {/* 로딩/에러 */}
          {loading && <p className="mt-8 text-center">로딩 중…</p>}
          {error && <p className="mt-8 text-center text-red-500">{error}</p>}

          {!loading && !error && (
            <>
              <div className="flex justify-end mt-6">
                <SortDropdown
                  defaultValue={sortType}
                  onChange={(v) => {
                    setSortType(v);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* 카드 그리드 */}
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-1 md:gap-4 mt-4">
                {currentPosts.map((post, index) => (
                  <div
                    key={`${post.postId}-${index}`}
                    onClick={() => navigate(`/tips/${post.postId}`)}
                    className="cursor-pointer"
                  >
                    <ItemCard
                      id={post.postId}
                      category={post.category}
                      hashtag={post.hashtags}
                      imageUrl={post.imageUrls}
                      title={post.title}
                      description={post.summary}
                      views={post.views}
                      scraps={post.scraps}
                      date={new Date(post.date)}
                      type="tips"
                    />
                  </div>
                ))}
              </div>

              {/* 페이지네이션 */}
              <div className="mt-20 ">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page: number) => {
                    setCurrentPage(page);
                  }}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TipsDetailPage;
