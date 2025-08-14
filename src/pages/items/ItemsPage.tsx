import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { itemService } from "../../api/lifeItemsApi";
import { getAiRecommendedItems } from "../../api/lifeItemsApi";
import type { ItemPost } from "../../api/types";
import CategoryBar from "../../components/CategoryBar";
import Searchbar from "../../components/Searchbar";
import { itemCategories } from "../../data/categoryList";
import ItemCard from "../../components/ItemCard";


const ItemsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [allPosts, setAllPosts] = useState<ItemPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("최신순");
  const [aiRecommendedPosts, setAiRecommendedPosts] = useState<ItemPost[]>([]);
  const [aiLoading, setAiLoading] = useState(true);

  // URL 파라미터에서 카테고리와 검색어 가져오기
  useEffect(() => {
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");

    if (category) {
      setSelectedCategory(category);
    }
    if (search) {
      setSearchQuery(search);
    }
    if (sort) {
      setSortBy(sort === "popular" ? "인기순" : "최신순");
    }
  }, [searchParams]);

  // 카테고리별 필터링
  const filteredPosts = useMemo(() => {
    if (selectedCategory === "전체") {
      return allPosts;
    }

    const categoryMap: { [key: string]: string } = {
      "자취 필수템": "SELF_LIFE_ITEM",
      "주방템": "KITCHEN_ITEM",
      "청소템": "CLEAN_ITEM",
      "살림도구템": "HOUSEHOLD_ITEM",
      "브랜드 꿀템": "BRAND_ITEM",
    };

    const serverCategory = categoryMap[selectedCategory];
    return allPosts.filter((post) => post.category === serverCategory);
  }, [allPosts, selectedCategory]);

  // 검색어 필터링
  const searchedPosts = useMemo(() => {
    if (!searchQuery.trim()) {
      return filteredPosts;
    }

    const query = searchQuery.toLowerCase();
    return filteredPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.summary.toLowerCase().includes(query) ||
        post.hashtags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [filteredPosts, searchQuery]);

  // 정렬
  const sortedPosts = useMemo(() => {
    if (sortBy === "인기순") {
      return [...searchedPosts].sort((a, b) => {
        const aScore = (a.views || 0) + (a.scraps || 0) * 2;
        const bScore = (b.views || 0) + (b.scraps || 0) * 2;
        return bScore - aScore;
      });
    }
    return [...searchedPosts].sort((a, b) => b.postId - a.postId);
  }, [searchedPosts, sortBy]);

  // 최신순 정렬된 포스트 (메모이제이션)
  const recentPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => b.postId - a.postId);
  }, [filteredPosts]);

  // 초기 데이터 로딩 (첫 페이지만)
  // AI 추천 게시물 로딩
  useEffect(() => {
    let isMounted = true;

    const loadAiRecommendedPosts = async () => {
      if (!isMounted) return;

      setAiLoading(true);
      try {
        console.log("AI 추천 아이템 로딩 시작...");
        const result = await getAiRecommendedItems(0, 6);

        if (!isMounted) return;

        console.log("AI 추천 아이템 로딩 성공:", result);
        setAiRecommendedPosts(result.posts);
      } catch (e) {
        if (!isMounted) return;
        console.error("Error loading AI recommended items:", e);
        // 에러가 발생해도 UI가 깨지지 않도록 빈 배열로 설정
        setAiRecommendedPosts([]);
      } finally {
        if (isMounted) {
          setAiLoading(false);
        }
      }
    };

    loadAiRecommendedPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  // 초기 데이터 로딩 (첫 페이지만 로딩)
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      if (!isMounted) return;

      setLoading(true);
      setError(null);

      try {
        // 첫 페이지만 로딩 (성능 최적화)
        const result = await itemService.getAllPosts(0);

        if (!isMounted) return;

        // 중복 제거 (Set 사용으로 성능 향상)
        const uniquePosts = Array.from(
          new Map(result.posts.map((post) => [post.postId, post])).values()
        ) as ItemPost[];

        setAllPosts(uniquePosts);
        setHasMore(result.posts.length > 0); // 더 로딩할 수 있는지 확인
        setCurrentPage(1); // 다음 로딩할 페이지
      } catch (e) {
        if (!isMounted) return;
        console.error("Error loading initial data:", e);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
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

  // 추가 데이터 로딩 (무한 스크롤 또는 더보기 버튼용)
  const loadMoreData = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = currentPage + 1;
      const result = await itemService.getAllPosts(nextPage);

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
      const newPosts = result.posts.filter(
        (newPost) =>
          !allPosts.some(
            (existingPost) => existingPost.postId === newPost.postId
          )
      ) as ItemPost[];

      setAllPosts((prev) => [...prev, ...newPosts]);
      setCurrentPage(nextPage);
    } catch (e) {
      console.error("Error loading more data:", e);
      setError("추가 데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, currentPage, allPosts]);

  const handleSearch = (input: string) => {
    setSearchQuery(input);
    const params = new URLSearchParams(searchParams);
    if (input.trim()) {
      params.set("search", input);
    } else {
      params.delete("search");
    }
    navigate(`/items/list?${params.toString()}`);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams();
    if (category !== "전체") {
      params.set("category", category);
    }
    if (searchQuery.trim()) {
      params.set("search", searchQuery);
    }
    if (sortBy !== "최신순") {
      params.set("sort", sortBy === "인기순" ? "popular" : "latest");
    }
    navigate(`/items/list?${params.toString()}`);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    const params = new URLSearchParams(searchParams);
    if (sort === "인기순") {
      params.set("sort", "popular");
    } else {
      params.set("sort", "latest");
    }
    navigate(`/items/list?${params.toString()}`);
  };

  if (error) {
    return (
      <div className="px-8 py-12 text-center text-red-500 text-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="px-8">
      <div className="flex justify-between items-center mt-4">
        <CategoryBar
          categories={["전체", ...itemCategories]}
          selected={selectedCategory}
          onSelect={handleCategorySelect}
        />
        <div className="hidden md:block">
          <Searchbar onSearch={handleSearch} />
        </div>
      </div>

      {/*AI 추천 게시물*/}
      <div className="w-full h-[700px] md:h-[475px] mt-5 md:mt-36 mb-300">
        <div className="flex justify-between h-12">
          <span className="font-[700] text-[24px] md:text-[32px] ml-2 md:ml-0">
            AI 추천 게시물
          </span>
        </div>
        {aiLoading ? (
          <div className="w-full h-70 md:h-110 flex items-center justify-center">
            <p className="text-gray-500">AI 추천 게시물을 불러오는 중...</p>
          </div>
        ) : aiRecommendedPosts.length > 0 ? (
          <div className="flex gap-5 md:gap-10 overflow-x-auto hide-scrollbar">
            {aiRecommendedPosts.map((post) => (
              <div
                key={post.postId}
                onClick={() => navigate(`/items/${post.postId}`)}
                className="cursor-pointer"
              >
                <ItemCard
                  hashtag={post.hashtags[0] || ""}
                  imageUrl={post.imageUrls[0] || ""}
                  title={post.title}
                  description={post.content}
                  views={post.views || 0}
                  scraps={post.scraps || 0}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-70 md:h-110 flex items-center justify-center">
            <p className="text-gray-500">AI 추천 게시물이 없습니다.</p>
          </div>
        )}
      </div>

             {/*전체 게시물*/}
       <div className="w-full h-[700px] md:h-[475px] mt-5 md:mt-36 mb-300">
         <div className="flex justify-between h-12">
           <span className="font-[700] text-[24px] md:text-[32px] ml-2 md:ml-0">
             전체 게시물
           </span>
           <button
             onClick={() => navigate("/items/list")}
             className="w-[68px] h-[26px] md:w-[86px] md:h-[32px] text-[#333333] rounded-4xl flex items-center justify-between border-2 border-[#999999] cursor-pointer"
           >
             <span className="ml-2 text-[14px] md:text-[16px]">더보기</span>
             <img
               src="/src/assets/right.png"
               alt="더보기"
               className="w-[7px] h-[7px] md:w-[7.4px] md:h-[12px] mr-2"
             />
           </button>
         </div>
        {loading && allPosts.length === 0 ? (
          <div className="w-full h-70 md:h-110 flex items-center justify-center">
            <p className="text-gray-500">게시물을 불러오는 중...</p>
          </div>
        ) : sortedPosts.length > 0 ? (
          <div className="flex gap-5 md:gap-10 overflow-x-auto hide-scrollbar">
            {sortedPosts.slice(0, 5).map((post) => (
              <div
                key={post.postId}
                onClick={() => navigate(`/items/${post.postId}`)}
                className="cursor-pointer"
              >
                <ItemCard
                  hashtag={post.hashtags[0] || ""}
                  imageUrl={post.imageUrls[0] || ""}
                  title={post.title}
                  description={post.content}
                  views={post.views || 0}
                  scraps={post.scraps || 0}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-70 md:h-110 flex items-center justify-center">
            <p className="text-gray-500">
              {searchQuery.trim()
                ? "검색 결과가 없습니다."
                : "게시물이 없습니다."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemsPage;
