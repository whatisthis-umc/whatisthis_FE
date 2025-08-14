import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import Searchbar from "../components/Searchbar";
import type { Post } from "../api/types";
import { tipService } from "../api/lifeTipsApi";
import { itemService } from "../api/lifeItemsApi";

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("q") || "";
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모든 게시물 데이터 가져오기
  useEffect(() => {
    let isMounted = true;

    const loadAllPosts = async () => {
      if (!isMounted) return;

      setLoading(true);
      setError(null);

      try {
        const allData: Post[] = [];

        // 꿀팁 데이터
        let tipPage = 1;
        let hasMoreTipData = true;
        while (hasMoreTipData && isMounted) {
          const tipResult = await tipService.getAllPosts(tipPage);
          if (tipResult.posts.length === 0) {
            hasMoreTipData = false;
          } else {
            allData.push(...tipResult.posts);
            tipPage++;
          }
        }

        // 꿀템 데이터
        let itemPage = 1;
        let hasMoreItemData = true;
        while (hasMoreItemData && isMounted) {
          const itemResult = await itemService.getAllPosts(itemPage);
          if (itemResult.posts.length === 0) {
            hasMoreItemData = false;
          } else {
            allData.push(...itemResult.posts);
            itemPage++;
          }
        }

        if (!isMounted) return;

        // 중복 제거
        const uniqueData = allData.reduce((acc: Post[], current: Post) => {
          const exists = acc.find(
            (item: Post) => item.postId === current.postId
          );
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, []);

        setAllPosts(uniqueData);
      } catch (e) {
        if (!isMounted) return;
        console.error("Error loading all posts:", e);
        setError("데이터 로딩 실패");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAllPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  // 검색 필터링
  const searchResults = keyword
    ? allPosts.filter((post) =>
        [post.title, post.summary, ...post.hashtags]
          .join(" ")
          .toLowerCase()
          .includes(keyword.toLowerCase())
      )
    : [];

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
              <div
                key={post.postId}
                onClick={() => navigate(`/${post.type}/${post.postId}`)}
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
