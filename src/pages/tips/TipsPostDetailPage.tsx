import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dummyPosts } from "../../data/dummyPosts";
import CategoryBar from "../../components/CategoryBar";
import Searchbar from "../../components/Searchbar";
import { tipCategories } from "../../data/categoryList";
import { whitescrap, reportIcon } from "../../assets";
import ItemCard from "../../components/ItemCard";
import ReportModal from "../../components/modals/ReportModal";
import LoginModal from "../../components/modals/LoginModal";

const TipsPostDetailPage = () => {
  const { id } = useParams();
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  const post = dummyPosts.find((p) => p.id === Number(id));
  const [selectedCategory, setSelectedCategory] = useState(
    post?.category || "전체"
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const relatedPosts = dummyPosts.slice(0, 5);
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
    <div className="px-8">
      <div className="flex justify-between items-center mt-4">
        <CategoryBar
          categories={["전체", ...tipCategories]}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
        <div className="hidden md:block">
          <Searchbar onSearch={handleSearch} />
        </div>
      </div>

      {keyword ? (
        <div className="mt-10 px-8">
          <h2 className="ml-2 md:ml-5 text-[16px] md:text-[24px] font-bold mb-4 text-[#333333]">
            <span className="w-fit px-1 py-1 bg-[#F5FFCC] rounded-2xl">
              {keyword}
            </span>
            에 대한 통합검색 결과
          </h2>
          {searchfilteredPosts.length > 0 ? (
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
          <div className="flex gap-12 mt-20">
            <div className="hidden md:block md:relative md:w-[1100px] md:h-[600px] md:overflow-hidden">
              <img
                src={images[currentImageIndex]}
                alt="꿀팁"
                className="w-full h-full object-cover rounded-4xl"
              />
              {images.length > 1 && (
                <div className="md:absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 bg-[#FFFFFF80] bg-opacity-50 px-3 py-1 rounded-4xl">
                  {images.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-4 h-4 rounded-4xl cursor-pointer ${
                        currentImageIndex === idx
                          ? "bg-[#0080FF]"
                          : "bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between w-full">
              <div className="flex flex-col justify-center md:justify-between items-center md:items-start">
                <div className="items-start">
                  <h2 className="text-[22px] md:text-[28px] font-bold text-black mb-4">
                    {post.title}
                  </h2>
                  <p className="text-[14px] md:text-[16px] text-[#333] mb-4 whitespace-pre-line">
                    {post.description?.split("\n\n")[0]}
                  </p>
                </div>

                <div className="w-3xs h-3xs md:hidden relative flex justify-center">
                  <img
                    src={images[currentImageIndex]}
                    alt="꿀팁"
                    className="w-full h-full object-cover rounded-4xl"
                  />
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 md:gap-3 bg-[#FFFFFF80] bg-opacity-50 px-3 py-1 rounded-4xl">
                      {images.map((_, idx) => (
                        <div
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-3 h-3 md:w-4 md:h-4 rounded-4xl cursor-pointer ${
                            currentImageIndex === idx
                              ? "bg-[#0080FF]"
                              : "bg-gray-400"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-xs md:w-full border border-[#E6E6E6] rounded-4xl p-4 mt-4">
                  <p className="text-[14px] md:text-[16px] text-[#333] whitespace-pre-line">
                    {post.description?.split("\n\n")[1]}
                  </p>
                </div>

                <div className="flex flex-row gap-2 ml-2 mt-10 md:mt-100 flex-wrap">
                  {Array.isArray(post.hashtag) ? (
                    post.hashtag.map((tag, idx) => (
                      <div
                        key={idx}
                        className="w-fit px-3 h-[29px] flex items-center rounded-4xl bg-[#CCE5FF] text-[#666666]"
                      >
                        #{tag}
                      </div>
                    ))
                  ) : post.hashtag ? (
                    <div className="w-fit px-3 h-[29px] flex items-center rounded-4xl bg-[#CCE5FF] text-[#666666]">
                      #{post.hashtag}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex gap-4 mt-8 justify-between">
                <button
                  className="w-[93px] h-[37px] md:w-[156px] md:h-[54px] text-white text-[14px] md:text-[20px] font-[500] gap-1 md:gap-2 bg-[#0080FF] rounded-4xl flex justify-center items-center"
                  onClick={() => setShowLoginModal(true)}
                >
                  <img
                    src={whitescrap}
                    alt="스크랩"
                    className="w-5 h-5 md:mr-2"
                  />
                  스크랩
                </button>
                <button
                  className="w-[93px] h-[37px] md:w-[156px] md:h-[54px] text-white text-[14px] md:text-[20px] font-[500] gap-1 md:gap-2 bg-[#0080FF] rounded-4xl flex justify-center items-center"
                  onClick={() => setShowReportModal(true)}
                >
                  <img
                    src={reportIcon}
                    alt="신고하기"
                    className="w-5 h-5 md:mr-2"
                  />
                  신고하기
                </button>
              </div>
            </div>
          </div>

          {showReportModal && (
            <ReportModal
              onClose={() => setShowReportModal(false)}
              targetType="게시물"
            />
          )}
          {showLoginModal && (
            <LoginModal onClose={() => setShowLoginModal(false)} />
          )}

          <div className="mt-15 md:mt-25">
            <h3 className="text-[20px] md:text-[24px] font-bold mb-2 md:mb-6">
              관련 꿀팁 게시물
            </h3>
            <div className="flex gap-5 md:gap-10 overflow-x-auto hide-scrollbar">
              {relatedPosts.map((relatedPost) => (
                <div
                  key={relatedPost.id}
                  onClick={() =>
                    navigate(`/${relatedPost.type}/${relatedPost.id}`)
                  }
                  className="cursor-pointer"
                >
                  <ItemCard {...relatedPost} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TipsPostDetailPage;
