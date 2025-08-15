import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import Searchbar from "../components/Searchbar";
import type { Post } from "../api/types";
import { tipService } from "../api/lifeTipsApi";
import { itemService } from "../api/lifeItemsApi";

// 전역 캐시 (재마운트 시에도 유지)
let globalPostsCache: Post[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시

// 검색 결과 카드 컴포넌트 (최적화)
const SearchResultCard = React.memo<{
  post: Post;
  onNavigate: (path: string) => void;
}>(({ post, onNavigate }) => {
  const handleClick = useCallback(() => {
    onNavigate(`/${post.type}/${post.postId}`);
  }, [post.type, post.postId, onNavigate]);

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <ItemCard
        hashtag={post.hashtags}
        imageUrl={post.imageUrls}
        title={post.title}
        description={post.summary}
        views={post.views}
        scraps={post.scraps}
      />
    </div>
  );
});

const SearchPage = () => {
  const navigateRouter = useNavigate();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("q") || "";
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // navigate 함수 메모이제이션
  const navigate = useCallback(
    (path: string) => {
      navigateRouter(path);
    },
    [navigateRouter]
  );

  // 캐시에서 데이터 로드 또는 새로 가져오기
  const loadAllPosts = useCallback(async () => {
    // 캐시 확인
    const now = Date.now();
    if (globalPostsCache && now - cacheTimestamp < CACHE_DURATION) {
      setAllPosts(globalPostsCache);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 병렬로 모든 페이지 데이터 가져오기
      const [tipResults, itemResults] = await Promise.all([
        loadAllTipPosts(),
        loadAllItemPosts(),
      ]);

      // 데이터 합치고 중복 제거
      const allData = [...tipResults, ...itemResults];
      const uniqueData = Array.from(
        new Map(allData.map((post) => [post.postId, post])).values()
      );

      // 캐시 업데이트
      globalPostsCache = uniqueData;
      cacheTimestamp = now;

      setAllPosts(uniqueData);
    } catch (e) {
      console.error("Error loading all posts:", e);
      setError("데이터 로딩 실패");
    } finally {
      setLoading(false);
    }
  }, []);

  // 꿀팁 데이터 모두 가져오기
  const loadAllTipPosts = async (): Promise<Post[]> => {
    const allTipPosts: Post[] = [];
    const MAX_PAGES = 20; // 최대 페이지 제한으로 무한루프 방지

    const pagePromises = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      pagePromises.push(
        tipService.getAllPosts(page).catch(() => ({ posts: [] }))
      );
    }

    const results = await Promise.all(pagePromises);

    for (const result of results) {
      if (result.posts.length === 0) break;
      allTipPosts.push(...result.posts);
    }

    return allTipPosts;
  };

  // 꿀템 데이터 모두 가져오기
  const loadAllItemPosts = async (): Promise<Post[]> => {
    const allItemPosts: Post[] = [];
    const MAX_PAGES = 20; // 최대 페이지 제한으로 무한루프 방지

    const pagePromises = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      pagePromises.push(
        itemService.getAllPosts(page).catch(() => ({ posts: [] }))
      );
    }

    const results = await Promise.all(pagePromises);

    for (const result of results) {
      if (result.posts.length === 0) break;
      allItemPosts.push(...result.posts);
    }

    return allItemPosts;
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadAllPosts();
  }, [loadAllPosts]);

  // 검색 필터링-useMemo로 최적화
  const searchResults = useMemo(() => {
    if (!keyword.trim()) return [];

    const searchTerm = keyword.toLowerCase().trim();
    return allPosts.filter((post) => {
      const searchableText = [post.title, post.summary, ...post.hashtags]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchTerm);
    });
  }, [allPosts, keyword]);

  const handleSearch = (input: string) => {};

  if (loading) {
    return (
      <div className="px-8 py-12 text-center text-gray-500 text-xl">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
          <span>검색 결과를 불러오는 중...</span>
        </div>
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
      <div className="flex justify-end items-center px-4 mt-4">
        <div className="hidden md:block">
          <Searchbar onSearch={handleSearch} />
        </div>
      </div>

      <div className="px-8">
        <h2 className="text-[20px] md:text-[24px] font-bold mb-4 mt-8">
          <span className="inline-block bg-[#F5FFCC] rounded-2xl px-2">
            {keyword}
          </span>
          에 대한 통합검색 결과
        </h2>

        {searchResults.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {searchResults.map((post) => (
              <SearchResultCard
                key={post.postId}
                post={post}
                onNavigate={navigate}
              />
            ))}
          </div>
        ) : keyword ? (
          <div className="text-gray-500 mt-8 text-center">
            검색 결과가 없습니다.
          </div>
        ) : (
          <div className="text-gray-500 mt-8 text-center">
            검색어를 입력해주세요.
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
