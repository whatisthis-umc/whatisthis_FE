import React from "react";
import { useState } from "react";
import CategoryBar from "../../components/CategoryBar";
import Searchbar from "../../components/Searchbar";
import { itemCategories } from "../../data/categoryList";
import ItemCard from "../../components/ItemCard";
import { useNavigate } from "react-router-dom";
import { dummyPosts } from "../../data/dummyPosts";
import { backward } from "../../assets";
import { forward } from "../../assets";
import SortDropdown from "../../components/common/SortDropdown";

const ItemsDetailPage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sortType, setSortType] = useState("인기순");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  const filteredPosts =
    selectedCategory === "전체"
      ? dummyPosts.filter((post) => post.type === "items")
      : dummyPosts.filter(
          (post) => post.type === "items" && post.category === selectedCategory
        );
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortType === "인기순") return b.views - a.views;
    else if (sortType === "최신순") return b.date.getTime() - a.date.getTime();
    return 0;
  });

  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = sortedPosts.slice(
    startIndex,
    startIndex + postsPerPage
  );
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);

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
      <div className="flex justify-between items-center px-4 mt-4">
        <CategoryBar
          categories={["전체", ...itemCategories]}
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
          <div className="flex justify-end px-4 mt-6 pt-10">
            <SortDropdown onChange={setSortType} defaultValue={sortType} />
          </div>
          <div className="w-full grid grid-cols-5 gap-8 pt-5">
            {paginatedPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => navigate(`/items/${post.id}`)}
                className="cursor-pointer"
              >
                <ItemCard {...post} />
              </div>
            ))}
          </div>
          {/*페이지네이션*/}
          <div className=" flex justify-center items-center mt-30 mb-20 gap-2">
            <img
              src={backward}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="text-2xl px-2 disabled:opacity-30"
            ></img>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center transition cursor-pointer ${
                  page === currentPage
                    ? "bg-blue-500 text-white"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                {page}
              </button>
            ))}
            <img
              src={forward}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className="text-2xl px-2 disabled:opacity-30"
            ></img>
          </div>
        </>
      )}
    </div>
  );
};

export default ItemsDetailPage;
