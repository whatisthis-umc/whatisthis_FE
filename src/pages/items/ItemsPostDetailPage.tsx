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
  const [selectedCategory, setSelectedCategory] = useState(
    post?.hashtag || "전체"
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const relatedPosts = dummyPosts.slice(0, 5); // 관련 게시물
  const images = Array.isArray(post?.imageUrl)
    ? post.imageUrl
    : [post?.imageUrl];

  if (!post) {
    return (
      <div className="px-8 py-12 text-center text-red-500 text-xl">
        게시글을 찾을 수 없습니다.
      </div>
    );
  }

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
        <div className=" relative w-[1100px] h-[600px] overflow-hidden">
          <img
            src={images[currentImageIndex]}
            alt="꿀템"
            className="w-full h-full object-cover rounded-4xl"
          />
          {/* 인디케이터 */}
          {images.length > 1 && (
            <div className="absolute bottom-4  left-1/2 transform -translate-x-1/2 flex gap-2 bg-[#FFFFFF80] bg-opacity-50 px-3 py-1 rounded-4xl gap-3">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-4 h-4 rounded-4xl cursor-pointer ${
                    currentImageIndex === idx ? "bg-[#0080FF]" : "bg-gray-400"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/*내용*/}
        <div className="flex flex-col justify-between w-full">
          <div className="flex flex-col items-start">
            <h2 className="text-[28px] font-bold text-black mb-4">
              {post?.title}
            </h2>
            <p className="text-[16px] text-[#333] mb-8 whitespace-pre-line">
              {post?.description}
            </p>
            <div className="inline-block bg-[#CCE5FF] text-[#666] rounded-4xl px-3 py-1 text-sm mt-100">
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
      <div className="mt-25">
        <h3 className="text-[24px] font-bold mb-6 ">관련 꿀팁 게시물</h3>
        <div className="flex gap-10 overflow-x-auto hide-scrollbar">
          {relatedPosts.map((relatedPost) => (
            <ItemCard key={relatedPost.id} {...relatedPost} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItemsPostDetailPage;
