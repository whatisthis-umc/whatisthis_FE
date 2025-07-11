import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { dummyPosts } from "../../data/dummyPosts";
import CategoryBar from "../../components/CategoryBar";
import Searchbar from "../../components/Searchbar";
import { itemCategories } from "../../data/categoryList";
import whitescrap from "/src/assets/whitescrap.png";
import report from "/src/assets/report.png";
import ItemCard from "../../components/ItemCard";

const ItemsPostDetailPage = () => {
  const { id } = useParams();
  const post = dummyPosts.find((p) => p.id === Number(id));
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const relatedPosts = dummyPosts.slice(0, 5); // 관련 게시물

  return (
    <div className="px-8">
      <div className="flex justify-between items-center mt-4">
        <CategoryBar
          categories={["전체", ...itemCategories]}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
        <Searchbar />
      </div>

      <div className="flex gap-12 mt-20">
        <img
          src={post?.imageUrl}
          alt="꿀템"
          className="w-[680px] h-[680px] object-cover rounded-4xl"
        />
        {/*내용*/}
        <div className="flex flex-col justify-between w-full">
          <div className="flex flex-col items-start">
            <h2 className="text-[28px] font-bold text-black mb-4">
              {post?.title}
            </h2>
            <p className="text-[16px] text-[#333] mb-8 whitespace-pre-line">
              {post?.description}
            </p>
            <div className="inline-block bg-[#CCE5FF] text-[#666] rounded-4xl px-3 py-1 text-sm">
              #{post?.hashtag}
            </div>
          </div>
          {/*스크랩, 신고버튼*/}
          <div className="flex gap-4 mt-8 justify-between">
            <button className="w-[156px] h-[54px] text-white text-[20px] font-[500] gap-2 bg-[#0080FF] rounded-4xl flex justify-center items-center">
              <img src={whitescrap} alt="스크랩" className="w-5 h-5 mr-2" />
              스크랩
            </button>
            <button className="w-[156px] h-[54px] text-white text-[20px] font-[500] gap-2 bg-[#0080FF] rounded-4xl flex justify-center items-center">
              <img src={report} alt="신고하기" className="w-5 h-5 mr-2" />
              신고하기
            </button>
          </div>
        </div>
      </div>

      {/* 관련 게시물 */}
      <div className="mt-24">
        <h3 className="text-[24px] font-bold mb-6 ">관련 꿀팁 게시물</h3>
        <div className="flex gap-8 overflow-x-auto hide-scrollbar">
          {relatedPosts.map((relatedPost) => (
            <ItemCard key={relatedPost.id} {...relatedPost} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItemsPostDetailPage;
