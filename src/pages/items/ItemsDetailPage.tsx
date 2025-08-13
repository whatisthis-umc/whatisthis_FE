import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CategoryBar from "../../components/CategoryBar";
import Searchbar from "../../components/Searchbar";
import SortDropdown from "../../components/common/SortDropdown";
import ItemCard from "../../components/ItemCard";
import { itemCategories } from "../../data/categoryList";
import type { ItemPost } from "../../api/types";
import Pagination from "../../components/customer/Pagination";
import { subCategoryEnumMap } from "../../constants/subCategoryEnumMap";
import { itemService } from "../../api/lifeItemsApi";

// 게시물 카드 렌더링 컴포넌트
const PostCard = React.memo(({ post, navigate, index }: { post: ItemPost; navigate: any; index: number }) => (
  <div
    key={`${post.postId}-${index}`}
    onClick={() => navigate(`/items/${post.postId}`)}
    className="cursor-pointer"
  >
    <ItemCard 
      hashtag={post.hashtags}
      imageUrl={post.imageUrls}
      title={post.title}
      description={post.summary}
      views={post.views}
      scraps={post.scraps}
    />
  </div>
));

const ItemsDetailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sortParam = searchParams.get("sort");
  const categoryParam = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState(
    categoryParam || "전체"
  );
  const [sortType, setSortType] = useState<"BEST" | "LATEST">(
    sortParam === "popular" ? "BEST" : "LATEST"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [allPosts, setAllPosts] = useState<ItemPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postsPerPage, setPostsPerPage] = useState(8);
  const [hasMore, setHasMore] = useState(true);
  const [currentApiPage, setCurrentApiPage] = useState(0);

  // 화면 크기에 따라 페이지당 게시물 수 바뀜 (메모이제이션)
  const handleResize = useCallback(() => {
    if (window.innerWidth < 768) {
      setPostsPerPage(6);
    } else {
      setPostsPerPage(8);
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  // 카테고리 매핑 (메모이제이션)
  const getServerCategory = useCallback((uiCategory: string): string => {
    if (uiCategory === "전체") return "";
    return (
      subCategoryEnumMap[uiCategory as keyof typeof subCategoryEnumMap] || ""
    );
  }, []);

  // 카테고리 필터링된 포스트 (메모이제이션)
  const filteredPosts = useMemo(() => {
    if (selectedCategory === "전체") return allPosts;
    
    const serverCategory = getServerCategory(selectedCategory);
    return allPosts.filter((post) => {
      return (
        Array.isArray(post.subCategories) &&
        post.subCategories.includes(serverCategory)
      );
    });
  }, [allPosts, selectedCategory, getServerCategory]);

  // 정렬된 포스트 (메모이제이션)
  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      if (sortType === "BEST") {
        // 조회수 + 스크랩 수로 인기도
        const popularityA = (a.views || 0) + (a.scraps || 0);
        const popularityB = (b.views || 0) + (b.scraps || 0);
        return popularityB - popularityA;
      } else {
        return b.postId - a.postId;
      }
    });
  }, [filteredPosts, sortType]);

  // 페이지네이션 계산 (메모이제이션)
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(sortedPosts.length / postsPerPage);
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const currentPosts = sortedPosts.slice(startIndex, endIndex);
    
    return {
      totalPages,
      currentPosts,
      hasMoreData: currentPosts.length < sortedPosts.length
    };
  }, [sortedPosts, currentPage, postsPerPage]);

  // 초기 데이터 로딩 (첫 2페이지만 로딩)
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      if (!isMounted) return;

      setLoading(true);
      setError(null);

      try {
        let allData: ItemPost[] = [];
        
        // 첫 2페이지만 로딩 (성능 최적화)
        for (let page = 0; page < 2; page++) {
          const result = await itemService.getAllPosts(page);
          
          if (!isMounted) return;

          if (result.posts.length === 0) {
            break;
          } else {
            // Post 타입을 ItemPost로 캐스팅
            const itemPosts = result.posts.map(post => ({
              ...post,
              type: "items" as const
            })) as ItemPost[];
            allData.push(...itemPosts);
          }
        }

        if (!isMounted) return;

        // 중복 제거 (Set 사용으로 성능 향상)
        const uniquePosts = Array.from(
          new Map(allData.map(post => [post.postId, post])).values()
        ) as ItemPost[];

        setAllPosts(uniquePosts);
        setHasMore(allData.length > 0); // 더 로딩할 수 있는지 확인
        setCurrentApiPage(1); // 다음 로딩할 페이지
      } catch (e) {
        if (!isMounted) return;
        console.error("Error loading initial data:", e);
        setError(typeof e === "string" ? e : "데이터 로딩 실패");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 추가 데이터 로딩 (필요시)
  const loadMoreData = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const result = await itemService.getAllPosts(currentApiPage);
      
      if (result.posts.length === 0) {
        setHasMore(false);
        return;
      }

      // Post 타입을 ItemPost로 캐스팅
      const itemPosts = result.posts.map(post => ({
        ...post,
        type: "items" as const
      })) as ItemPost[];

      // 기존 데이터와 새 데이터 합치기 (중복 제거)
      const newPosts = itemPosts.filter(
        newPost => !allPosts.some(existingPost => existingPost.postId === newPost.postId)
      );

      setAllPosts(prev => [...prev, ...newPosts]);
      setCurrentApiPage(prev => prev + 1);
    } catch (e) {
      console.error("Error loading more data:", e);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, currentApiPage, allPosts]);

  // 페이지 변경 시 추가 데이터 로딩 (필요시)
  useEffect(() => {
    const totalPostsNeeded = currentPage * postsPerPage;
    const currentTotalPosts = allPosts.length;
    
    // 현재 페이지에 필요한 데이터가 부족하면 추가 로딩
    if (currentTotalPosts < totalPostsNeeded && hasMore && !loading) {
      loadMoreData();
    }
  }, [currentPage, allPosts.length, hasMore, loading, postsPerPage, loadMoreData]);

  // 카테고리 변경 핸들러
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // 카테고리 변경 시 1페이지로 리셋
  }, []);

  // 정렬 변경 핸들러
  const handleSortChange = useCallback((sort: "BEST" | "LATEST") => {
    setSortType(sort);
    setCurrentPage(1);
  }, []);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // 검색 핸들러
  const handleSearch = useCallback((input: string) => {
    // 검색 기능 구현
  }, []);

  return (
    <div className="px-4">
      {/* 검색 + 카테고리 */}
      <div className="flex justify-between items-center mt-4">
        <CategoryBar
          categories={["전체", ...itemCategories]}
          selected={selectedCategory}
          onSelect={handleCategoryChange}
        />
        <div className="hidden md:block">
          <Searchbar onSearch={handleSearch} />
        </div>
      </div>

      {/* 로딩/에러 */}
      {loading && <p className="mt-8 text-center">로딩 중…</p>}
      {error && <p className="mt-8 text-center text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <div className="flex justify-end mt-6">
            <SortDropdown
              defaultValue={sortType}
              onChange={handleSortChange}
            />
          </div>

          {/* 카드 그리드 */}
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-1 md:gap-4 mt-4">
            {paginationData.currentPosts.map((post, index) => (
              <PostCard 
                key={`${post.postId}-${index}`} 
                post={post} 
                navigate={navigate} 
                index={index} 
              />
            ))}
          </div>

          {/* 페이지네이션 */}
          <div className="mt-20">
            <Pagination
              currentPage={currentPage}
              totalPages={paginationData.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ItemsDetailPage;
