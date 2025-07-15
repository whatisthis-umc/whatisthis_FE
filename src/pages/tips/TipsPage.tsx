import React from "react";
import { useNavigate } from "react-router-dom";
import Searchbar from "../../components/Searchbar";
import more from "/src/assets/more.png";
import ItemCard from "../../components/ItemCard";
import { dummyPosts } from "../../data/dummyPosts";
import type { ItemCardProps } from "../../types/post";
import CategoryBar from "../../components/CategoryBar";
import { useState } from "react";
import { itemCategories, tipCategories } from "../../data/categoryList";

const TipsPage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const filteredPosts =
    selectedCategory === "전체"
      ? dummyPosts.filter((post) => post.type === "tips")
      : dummyPosts.filter(
          (post) => post.type === "tips" && post.category === selectedCategory
        );

  const popularPosts = filteredPosts.sort((a, b) => b.views - a.views); // 인기순
  function getRandomPosts(posts: ItemCardProps[], count: number) {
    const shuffled = [...posts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  const recommendedPosts = getRandomPosts(filteredPosts, 4); // AI 추천순(일단 랜덤)
  const recentPosts = filteredPosts.sort(
    (a, b) => b.date.getTime() - a.date.getTime()
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
          .includes(keyword.toLowerCase())
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
        <Searchbar onSearch={handleSearch} />
      </div>
      {keyword ? (
        // 검색 결과 화면
        <div className="mt-10 px-8">
          <h2 className="text-[24px] font-bold mb-4">검색 결과</h2>
          {filteredPosts.length > 0 ? (
            <div className="flex flex-wrap gap-6">
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
          <div className="w-[1392px] h-[475px] mt-36 mb-300">
            <div className="flex justify-between h-12 ">
              <span className="font-[700] text-[32px]">인기 게시물</span>
              <button
                onClick={() => navigate("/tips/list?sort=popular")}
                className="w-[86px] h-[32px] text-[#333333] rounded-4xl flex items-center justify-between border-2 border-[#999999] cursor-pointer"
              >
                <span className="ml-2">더보기</span>
                <img
                  src={more}
                  alt="더보기"
                  className="w-[7.4px] h-[12px] mr-2"
                ></img>
              </button>
            </div>
            {/*게시글 목록*/}
            <div className="w-full h-110 flex felx-row gap-20 overflow-hidden">
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
            <div className="w-[1392px] h-[475px] mt-25">
              <div className="flex justify-between h-12 ">
                <span className="font-[700] text-[32px]">AI 추천 게시물</span>
                <button
                  onClick={() => navigate("./recommend")}
                  className="w-[86px] h-[32px] text-[#333333] rounded-4xl flex items-center justify-between border-2 border-[#999999] cursor-pointer"
                >
                  <span className="ml-2">더보기</span>
                  <img
                    src={more}
                    alt="더보기"
                    className="w-[7.4px] h-[12px] mr-2"
                  ></img>
                </button>
              </div>
              {/*게시글 목록*/}
              <div className="w-full h-110 flex felx-row gap-20 overflow-hidden">
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
              <div className="w-[1392px] h-[475px] mt-25">
                <div className="flex justify-between h-12 ">
                  <span className="font-[700] text-[32px]">최신 게시물</span>
                  <button
                    onClick={() => navigate("/tips/list?sort=latest")}
                    className="w-[86px] h-[32px] text-[#333333] rounded-4xl flex items-center justify-between border-2 border-[#999999] cursor-pointer"
                  >
                    <span className="ml-2">더보기</span>
                    <img
                      src={more}
                      alt="더보기"
                      className="w-[7.4px] h-[12px] mr-2"
                    ></img>
                  </button>
                </div>
                {/*게시글 목록*/}
                <div className="w-full h-110 flex felx-row gap-20 overflow-hidden">
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
