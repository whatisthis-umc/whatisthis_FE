import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Searchbar from "../../components/Searchbar";
import { more } from "../../assets";
import ItemCard from "../../components/ItemCard";
import CategoryBar from "../../components/CategoryBar";
import { itemCategories } from "../../data/categoryList";
import type { ItemPost } from "../../api/types";
import { subCategoryEnumMap } from "../../constants/subCategoryEnumMap";
import { itemService } from "../../api/lifeItemsApi";

// 게시물 카드 렌더링 컴포넌트
const PostCard = React.memo(({ post, navigate }: { post: ItemPost; navigate: any }) => (
  <div
    key={post.postId}
    onClick={() => navigate(`/items/${post.postId}`)}
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
      type="items"
    />
  </div>
));

// 공통 구역 컴포넌트
const SectionHeader = React.memo(({
  title,
  onMoreClick,
}: {
  title: string;
  onMoreClick: () => void;
}) => (
  <div className="flex justify-between h-12">
    <span className="font-[700] text-[24px] md:text-[32px] ml-2 md:ml-0">
      {title}
    </span>
    <button
      onClick={onMoreClick}
      className="w-[68px] h-[26px] md:w-[86px] md:h-[32px] text-[#333333] rounded-4xl flex items-center justify-between border-2 border-[#999999] cursor-pointer"
    >
      <span className="ml-2 text-[14px] md:text-[16px]">더보기</span>
      <img
        src={more}
        alt="더보기"
        className="w-[7px] h-[7px] md:w-[7.4px] md:h-[12px] mr-2"
      />
    </button>
  </div>
));

const ItemsPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [allPosts, setAllPosts] = useState<ItemPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

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
        post.subCategories?.some((cat: string) =>
          cat.toLowerCase().includes(serverCategory.toLowerCase())
        ) || false
      );
    });
  }, [allPosts, selectedCategory, getServerCategory]);

  // 인기순 정렬된 포스트 (메모이제이션)
  const popularPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      const popularityA = (a.views || 0) + (a.scraps || 0);
      const popularityB = (b.views || 0) + (b.scraps || 0);
      return popularityB - popularityA;
    });
  }, [filteredPosts]);

  // 최신순 정렬된 포스트 (메모이제이션)
  const recentPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => b.postId - a.postId);
  }, [filteredPosts]);

  // 초기 데이터 로딩 (첫 페이지만)
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
          new Map(result.posts.map(post => [post.postId, post])).values()
        ) as ItemPost[];

        setAllPosts(uniquePosts);
        setHasMore(result.posts.length > 0);
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

      // 기존 데이터와 새 데이터 합치기 (중복 제거)
      const newPosts = result.posts.filter(
        newPost => !allPosts.some(existingPost => existingPost.postId === newPost.postId)
      ) as ItemPost[];

      setAllPosts(prev => [...prev, ...newPosts]);
      setCurrentPage(nextPage);
    } catch (e) {
      console.error("Error loading more data:", e);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, currentPage, allPosts]);

  // 더보기 버튼 핸들러
  const handleMoreClick = useCallback(() => {
    loadMoreData();
  }, [loadMoreData]);

  // 카테고리 변경 핸들러
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  // AI 추천순 (일단랜덤)
  function getRandomPosts(posts: ItemPost[], count: number) {
    const shuffled = [...posts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  const recommendedPosts = getRandomPosts(filteredPosts, 4);

  const handleSearch = (input: string) => {};

  if (loading) {
    return (
      <div className="px-8 py-12 text-center text-gray-500 text-xl">
        로딩 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-8 py-12 text-center text-red-500 text-xl">{error}</div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center px-4 mt-4">
        <CategoryBar
          categories={["전체", ...itemCategories]}
          selected={selectedCategory}
          onSelect={handleCategoryChange}
        />
        <div className="hidden md:block">
          <Searchbar onSearch={handleSearch} />
        </div>
      </div>

      <div className="w-full h-[400px] md:h-[475px] mt-15 md:mt-36 mb-120 md:mb-300">
        <SectionHeader
          title="인기 게시물"
          onMoreClick={() => navigate("/items/list?sort=popular")}
        />
        {/*게시글 목록*/}
        <div className="w-full h-70 md:h-110 flex felx-row gap-6 md:gap-20 overflow-hidden">
          {popularPosts.map((post) => (
            <PostCard key={post.postId} post={post} navigate={navigate} />
          ))}
        </div>
        {/*AI 추천 게시물*/}
        <div className="w-full h-[700px] md:h-[475px] mt-5 md:mt-36 mb-300">
          <div className="flex justify-between h-12">
            <span className="font-[700] text-[24px] md:text-[32px] ml-2 md:ml-0">
              AI 추천 게시물
            </span>
          </div>
          <div className="w-full h-70 md:h-110 flex felx-row gap-6 md:gap-20 overflow-hidden">
            {recommendedPosts.map((post) => (
              <PostCard key={post.postId} post={post} navigate={navigate} />
            ))}
          </div>
          {/*최신 게시물*/}
          <div className="w-full h-[700px] md:h-[475px] mt-5 md:mt-36 mb-300">
            <SectionHeader
              title="최신 게시물"
              onMoreClick={() => navigate("/items/list?sort=latest")}
            />
            <div className="w-full h-70 md:h-110 flex felx-row gap-6 md:gap-20 overflow-hidden">
              {recentPosts.map((post) => (
                <PostCard key={post.postId} post={post} navigate={navigate} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemsPage;
