import React from "react";
import ItemCard from "../components/ItemCard";
import Searchbar from "../components/Searchbar";
import { left, right, more } from "../assets";
import { useNavigate, useLocation } from "react-router-dom";
import CommunityCard from "../components/CommunityCard";
import { useState } from "react";
import { dummyPosts } from "../data/dummyPosts";
import { dummyPosts2 } from "../data/dummyPosts2";

const MainPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get("keyword") || "";

  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const postsPerPage = 4;
  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - postsPerPage, 0));
  };
  const handleNext = () => {
    setCurrentIndex((prev) =>
      Math.min(prev + postsPerPage, dummyPosts.length - postsPerPage)
    );
  };
  const handleSearch = (input: string) => {
    navigate(`/search?keyword=${encodeURIComponent(input)}`);
  };

  const visiblePosts = dummyPosts.slice(
    currentIndex,
    currentIndex + postsPerPage
  );
  const filteredPosts = keyword
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
      <div className="hidden md:w-full md:max-w-[1440px]  md:mx-auto md:flex md:justify-between md:items-center md:px-4 md:mt-4">
        <Searchbar onSearch={handleSearch} />
      </div>
      {keyword ? (
        // 검색 결과 화면
        <div className="mt-10 px-8">
          <h2 className="text-[24px] font-bold mb-4">검색 결과</h2>
          {filteredPosts.length > 0 ? (
            <div className="flex flex-wrap gap-6">
              {filteredPosts.map((post) => (
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
          <div className="flex justify-between items-center w-full mt-27 sm:mt-17 md:mt-27 h-[149px] sm:h-[280px] md:h-[430px]">
            <div>
              <img
                src={left}
                alt="왼쪽 화살표"
                className="w-8 h-8 ml-10 mr-5 cursor-pointer"
                onClick={handlePrev}
              />
            </div>
            <div className="flex w-[320px] sm:w-[700px] md:w-[1218px] h-[435px] rounded-4xl bg-[#E6E6E6] gap-4 overflow-hidden">
              {visiblePosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/items/${post.id}`)}
                  className="cursor-pointer flex-shrink-0 w-[120px] sm:w-[150px] md:w-[230px]"
                >
                  <ItemCard {...post} />
                </div>
              ))}
            </div>
            <div>
              <img
                src={right}
                alt="오른쪽 화살표"
                className="w-8 h-8 mr-5 ml-5 cursor-pointer"
                onClick={handleNext}
              />
            </div>
          </div>
          {/* 오늘의 생활꿀팁 */}
          <div className="w-full md:w-[1392px] h-[250px] md:h-[475px] mt-15  md:mt-36">
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
              {dummyPosts.map((post) => (
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
              {dummyPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/items/${post.id}`)}
                  className="cursor-pointer"
                >
                  <ItemCard {...post} />
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
              {dummyPosts2.map((post, index) => (
                <CommunityCard key={index} {...post} best={true} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MainPage;
