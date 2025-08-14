import ItemCard from "../components/ItemCard";
import Searchbar from "../components/Searchbar";
import { left, right, more } from "../assets";
import { useNavigate, useLocation } from "react-router-dom";
import CommunityCard from "../components/CommunityCard";
import { useState, useEffect } from "react";

import { tipService } from "../api/lifeTipsApi";
import { itemService } from "../api/lifeItemsApi";
import useGetCommunity from "../hooks/queries/useGetCommunity";
import { dummyPosts2 } from "../data/dummyPosts2";
import type { TipPost } from "../api/types";
import type { ItemPost } from "../api/types";

const MainPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get("keyword") || "";

  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tipPosts, setTipPosts] = useState<TipPost[]>([]);
  const [itemPosts, setItemPosts] = useState<ItemPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 커뮤니티 데이터 가져오기 (인기순)
  const { data: communityData, isLoading: communityLoading } = useGetCommunity({
    page: 1,
    size: 4,
    sort: "BEST",
    uiCategory: "인기글"
  });

  const postsPerPage = 4;

  // 실제 데이터 로딩
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 팁 데이터 로딩 (첫 페이지만)
        const tipResult = await tipService.getAllPosts(0);
        const uniqueTipPosts = Array.from(
          new Map(tipResult.posts.map((post) => [post.postId, post])).values()
        ) as TipPost[];

        // 최신순 정렬
        const sortedTipPosts = uniqueTipPosts.sort(
          (a, b) => b.postId - a.postId
        );
        setTipPosts(sortedTipPosts);

        // 아이템 데이터 로딩 (첫 페이지만)
        const itemResult = await itemService.getAllPosts(0);
        const uniqueItemPosts = Array.from(
          new Map(itemResult.posts.map((post) => [post.postId, post])).values()
        ) as ItemPost[];

        // 최신순 정렬
        const sortedItemPosts = uniqueItemPosts.sort(
          (a, b) => b.postId - a.postId
        );
        setItemPosts(sortedItemPosts);


      } catch (e) {
        console.error("데이터 로딩 실패:", e);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - postsPerPage, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      Math.min(prev + postsPerPage, tipPosts.length - postsPerPage)
    );
  };

  const handleSearch = (input: string) => {
    navigate(`/search?keyword=${encodeURIComponent(input)}`);
  };

  // 메인 포스터(바꿀 예정)
  const visiblePosts = tipPosts.slice(
    currentIndex,
    currentIndex + postsPerPage
  );

  // 검색 필터링 (팁 + 아이템 데이터 모두 검색)
  const allPosts = [...tipPosts, ...itemPosts];
  const filteredPosts = keyword
    ? allPosts.filter((post) =>
        [
          post.title,
          post.summary,
          ...(Array.isArray(post.hashtags) ? post.hashtags : [post.hashtags]),
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword.toLowerCase())
      )
    : allPosts;

  // 로딩 상태
  if (loading) {
    return (
      <div>
        <div className="hidden md:w-full md:max-w-[1440px] md:mx-auto md:flex md:justify-between md:items-center md:px-4 md:mt-4">
          <Searchbar onSearch={handleSearch} />
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div>
        <div className="hidden md:w-full md:max-w-[1440px] md:mx-auto md:flex md:justify-between md:items-center md:px-4 md:mt-4">
          <Searchbar onSearch={handleSearch} />
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="hidden md:w-full md:max-w-[1440px]  md:mx-auto md:flex md:justify-between md:items-center md:px-4 md:mt-4">
        <Searchbar onSearch={handleSearch} />
      </div>
      {keyword ? (
        // 검색 결과 화면
        <div className="mt-10 px-8">
          <h2 className="text-[20px] md:text-[24px] font-bold mb-2 md:mb-4">
            <span className="inline-block bg-[#F5FFCC] rounded-2xl px-2">
              {keyword}
            </span>
            에 대한 검색 결과
          </h2>
          {filteredPosts.length > 0 ? (
            <div className="flex flex-wrap gap-1 md:gap-6">
              {filteredPosts.map((post) => (
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
          ) : (
            <div className="text-gray-500 mt-8">검색 결과가 없습니다.</div>
          )}
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center w-full mt-18 sm:mt-17 md:mt-27 h-[149px] sm:h-[280px] md:h-[430px]">
            <div>
              <img
                src={left}
                alt="왼쪽 화살표"
                className="w-6 h-6 md:w-8 md:h-8 ml-5 mr-5 cursor-pointer"
                onClick={handlePrev}
              />
            </div>
            <div className="flex w-85 sm:w-[700px] md:w-[1218px] h-[250px] md:h-[435px] rounded-4xl bg-[#E6E6E6] gap-4 sm:gap-12 md:gap-21 overflow-hidden">
              {visiblePosts.map((post) => (
                <div
                  key={post.postId}
                  onClick={() => navigate(`/tips/${post.postId}`)}
                  className="cursor-pointer flex-shrink-0 w-28 sm:w-[150px] md:w-[230px]"
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
            <div>
              <img
                src={right}
                alt="오른쪽 화살표"
                className="w-6 h-6 md:w-8 md:h-8 mr-5 ml-5 cursor-pointer"
                onClick={handleNext}
              />
            </div>
          </div>

          {/* 오늘의 생활꿀팁 */}
          <div className="w-full md:w-[1392px] h-[250px] md:h-[475px] mt-20  md:mt-36">
            <div className="flex justify-between h-12 ">
              <span className="font-[700] text-[20px] md:text-[32px]">
                오늘의 생활꿀팁
              </span>
              <button
                onClick={() => navigate("/tips")}
                className="w-[57px] md:w-[86px] h-[25px] md:h-[32px] text-[#333333] rounded-4xl flex items-center justify-between border-2 border-[#999999] cursor-pointer"
              >
                <span className="text-[10px] md:text-[16px] ml-2">더보기</span>
                <img
                  src={more}
                  alt="더보기"
                  className="w-[7px] h-[7px] md:w-[7.4px] md:h-[12px] mr-2"
                />
              </button>
            </div>
            <div className="w-full mt-[-15px] md:mt-0 h-110 flex flex-row gap-7 md:gap-20 overflow-x-hidden">
              {tipPosts.slice(0, 4).map((post) => (
                <div
                  key={post.postId}
                  onClick={() => navigate(`/tips/${post.postId}`)}
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
          </div>

          {/* 오늘의 생활꿀템 */}
          <div className="w-full md:w-[1392px] h-[260px] md:h-[475px] mt-15 md:mt-36">
            <div className="flex justify-between h-12 ">
              <span className="font-[700] text-[20px] md:text-[32px]">
                오늘의 생활꿀템
              </span>
              <button
                onClick={() => navigate("/items")}
                className="w-[57px] md:w-[86px] h-[25px] md:h-[32px] text-[#333333] rounded-4xl flex items-center justify-between border-2 border-[#999999] cursor-pointer"
              >
                <span className="text-[10px] md:text-[16px] ml-2">더보기</span>
                <img
                  src={more}
                  alt="더보기"
                  className="w-[7px] h-[7px] md:w-[7.4px] md:h-[12px] mr-2"
                />
              </button>
            </div>
            <div className="w-full mt-[-15px] md:mt-0 h-110 flex flex-row gap-7 md:gap-20 overflow-x-hidden">
              {itemPosts.slice(0, 4).map((post) => (
                <div
                  key={post.postId}
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
              ))}
            </div>
          </div>

          {/* 인기 커뮤니티 글 */}
          <div className="w-full md:w-[1392px] h-[260px] md:h-[475px] mt-15 md:mt-36">
            <div className="flex justify-between h-12">
              <span className="font-[700] text-[20px] md:text-[32px]">
                인기 커뮤니티 글
              </span>
              <button
                onClick={() => navigate("/community")}
                className="w-[57px] md:w-[86px] h-[25px] md:h-[32px] text-[#333333] rounded-4xl flex items-center justify-between border-2 border-[#999999] cursor-pointer"
              >
                <span className="text-[10px] md:text-[16px] ml-2">더보기</span>
                <img
                  src={more}
                  alt="더보기"
                  className="w-[7px] h-[7px] md:w-[7.4px] md:h-[12px] mr-2"
                />
              </button>
            </div>
            <div className="w-full mt-[-40px] md:mt-0 h-110 flex flex-row gap-5 md:gap-20 overflow-x-hidden">
              {communityLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-500">인기 커뮤니티 게시글을 불러오는 중...</p>
                </div>
              ) : communityData?.posts && communityData.posts.length > 0 ? (
                communityData.posts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => navigate(`/community/${post.id}`)}
                    className="cursor-pointer"
                  >
                    <CommunityCard 
                      hashtag={post.hashtags[0] || "커뮤니티"}
                      nickname={post.nickname}
                      date={new Date(post.createdAt)}
                      title={post.title}
                      description={post.content}
                      views={post.views}
                      likes={post.likes}
                      comments={post.comments}
                      best={post.isBest} 
                    />
                  </div>
                ))
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-500">인기 커뮤니티 게시글이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MainPage;
