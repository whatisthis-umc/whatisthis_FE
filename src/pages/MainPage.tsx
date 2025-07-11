import React from "react";
import ItemCard from "../components/ItemCard";
import Searchbar from "../components/Searchbar";
import left from "/src/assets/left.png";
import right from "/src/assets/right.png";
import more from "/src/assets/more.png";
import { useNavigate } from "react-router-dom";
import CommunityCard from "../components/CommunityCard";
import { useState } from "react";
import { dummyPosts } from "../data/dummyPosts";
import { dummyPosts2 } from "../data/dummyPosts2";

const MainPage = () => {
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

  const visiblePosts = dummyPosts.slice(
    currentIndex,
    currentIndex + postsPerPage
  );
  return (
    <div>
      <div className="w-full max-w-[1440px]  mx-auto flex justify-between items-center px-4 mt-4">
        <Searchbar />
      </div>
      <div className="flex justify-between items-center w-full mt-27 h-[435px]">
        {/*넘어가는게시물*/}
        <div>
          <img
            src={left}
            alt="왼쪽 화살표"
            className="w-8 h-8 ml-10 mr-5 cursor-pointer"
            onClick={handlePrev}
          ></img>
        </div>
        <div className="flex w-[1218px] h-[435px] rounded-4xl bg-[#E6E6E6] gap-17 overflow-hidden">
          {visiblePosts.map((post) => (
            <div
              key={post.id}
              onClick={() => navigate(`/items/${post.id}`)}
              className="cursor-pointer"
            >
              <ItemCard {...post} />
            </div>
          ))}
        </div>
        <div>
          <img
            src={right}
            alt="오른쪽 화살표"
            className="w-8 h-8 mr-10 ml-5 cursor-pointer"
            onClick={handleNext}
          ></img>
        </div>
      </div>
      {/*더보기 게시물-생활꿀팁*/}
      <div className="w-[1392px] h-[475px] mt-36">
        <div className="flex justify-between h-12 ">
          <span className="font-[700] text-[32px]">오늘의 생활꿀팁</span>
          <button
            onClick={() => navigate("/tips")}
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
        {/*오늘의 생활꿀템*/}
        <div className="w-[1392px] h-[475px] mt-25">
          <div className="flex justify-between h-12 ">
            <span className="font-[700] text-[32px]">오늘의 생활꿀템</span>
            <button
              onClick={() => navigate("/items")}
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
        {/*인기 커뮤니티 글*/}
        <div className="w-[1392px] h-[475px] mt-25">
          <div className="flex justify-between h-12 ">
            <span className="font-[700] text-[32px]">인기 커뮤니티 글</span>
            <button
              onClick={() => navigate("/community")}
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
            {dummyPosts2.map((post, index) => (
              <CommunityCard key={index} {...post} best={true} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
