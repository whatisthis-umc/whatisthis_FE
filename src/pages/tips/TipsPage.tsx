import React from "react";
import { useNavigate } from "react-router-dom";
import Searchbar from "../../components/Searchbar";
import { more } from "../../assets";
import ItemCard from "../../components/ItemCard";
import { dummyPosts } from "../../data/dummyPosts";
import type { ItemCardProps } from "../../types/post";
import CategoryBar from "../../components/CategoryBar";
import { useState } from "react";
import { tipCategories } from "../../data/categoryList";

const TipsPage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const filteredPosts =
    selectedCategory === "전체"
      ? dummyPosts.filter((post) => post.type === "tips")
      : dummyPosts.filter(
          (post) => post.type === "tips" && post.category === selectedCategory,
        );

  const popularPosts = filteredPosts.sort((a, b) => b.views - a.views); // 인기순
  function getRandomPosts(posts: ItemCardProps[], count: number) {
    const shuffled = [...posts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  const recommendedPosts = getRandomPosts(filteredPosts, 4); // AI 추천순(일단 랜덤)
  const recentPosts = filteredPosts.sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );
  const handleSearch = (input: string) => {
    setKeyword(input);
  };
  const searchfilteredPosts = keyword
    ? dummyPosts.filter((post) =>
        [
          post.title,
          post.description,
          ...(Array.isArray(post.hashtag) ? post.hashtag : [post.hashtag]),
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword.toLowerCase()),
      )
    : dummyPosts;
  return (
    <div>
      <div className="flex justify-between items-center px-4 mt-4 ">
        <CategoryBar
          categories={["전체", ...tipCategories]}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
        <div className="hidden md:w-full md:max-w-[1440px]  md:mx-auto md:flex md:justify-between md:items-center md:px-4 md:mt-4">
          <Searchbar onSearch={handleSearch} />
        </div>
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
              {searchfilteredPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/${post.type}/${post.id}`)}
                  className="cursor-pointer"
                >
                  <ItemCard {...post} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 mt-8">검색 결과가 없습니다.</div>
          )}
        </div>
      ) : (
        <>
          <div className="w-full h-[400px] md:h-[475px] mt-15 md:mt-36 mb-120 md:mb-300">
            <div className="flex justify-between h-12 ">
              <span className="font-[700] text-[24px] md:text-[32px] ml-4 md:ml-0">
                인기 게시물
              </span>
              <button
                onClick={() => navigate("/tips/list?sort=popular")}
                className="w-[68px] h-[26px] md:w-[86px] md:h-[32px] text-[#333333] rounded-4xl flex items-center justify-between border-2 border-[#999999] cursor-pointer"
              >
                <span className="ml-2 text-[14px] md:text-[16px]">더보기</span>
                <img
                  src={more}
                  alt="더보기"
                  className="w-[7px] h-[7px] md:w-[7.4px] md:h-[12px] mr-2"
                ></img>
              </button>
            </div>
            {/*게시글 목록*/}
            <div className="w-full h-70 md:h-110 flex felx-row gap-6 md:gap-20 overflow-hidden">
              {popularPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/tips/${post.id}`)}
                  className="cursor-pointer"
                >
                  <ItemCard {...post} />
                </div>
              ))}
            </div>
            {/*AI 추천 게시물*/}
            <div className="w-full h-[700px] md:h-[475px] mt-5 md:mt-36 mb-300">
              <div className="flex justify-between h-12 ">
                <span className="font-[700] text-[24px] md:text-[32px] ml-4 md:ml-0">
                  AI 추천 게시물
                </span>
                <button
                  onClick={() => navigate("./recommend")}
                  className="w-[68px] h-[26px] md:w-[86px] md:h-[32px] text-[#333333] rounded-4xl flex items-center justify-between border-2 border-[#999999] cursor-pointer"
                >
                  <span className="ml-2 text-[14px] md:text-[16px]">
                    더보기
                  </span>
                  <img
                    src={more}
                    alt="더보기"
                    className="w-[7px] h-[7px] md:w-[7.4px] md:h-[12px] mr-2"
                  ></img>
                </button>
              </div>
              {/*게시글 목록*/}
              <div className="w-full h-70 md:h-110 flex felx-row gap-6 md:gap-20 overflow-hidden">
                {recommendedPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => navigate(`/tips/${post.id}`)}
                    className="cursor-pointer"
                  >
                    <ItemCard {...post} />
                  </div>
                ))}
              </div>
              {/*최신 게시물*/}
              <div className="w-full h-[700px] md:h-[475px] mt-5 md:mt-36 mb-300">
                <div className="flex justify-between h-12 ">
                  <span className="font-[700] text-[24px] md:text-[32px] ml-4 md:ml-0">
                    최신 게시물
                  </span>
                  <button
                    onClick={() => navigate("/tips/list?sort=latest")}
                    className="w-[68px] h-[26px] md:w-[86px] md:h-[32px] text-[#333333] rounded-4xl flex items-center justify-between border-2 border-[#999999] cursor-pointer"
                  >
                    <span className="ml-2 text-[14px] md:text-[16px]">
                      더보기
                    </span>
                    <img
                      src={more}
                      alt="더보기"
                      className="w-[7px] h-[7px] md:w-[7.4px] md:h-[12px] mr-2"
                    ></img>
                  </button>
                </div>
                {/*게시글 목록*/}
                <div className="w-full h-70 md:h-110 flex felx-row gap-6 md:gap-20 overflow-hidden">
                  {recentPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => navigate(`/tips/${post.id}`)}
                      className="cursor-pointer"
                    >
                      <ItemCard {...post} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TipsPage;
