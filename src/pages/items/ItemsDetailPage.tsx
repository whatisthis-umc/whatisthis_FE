import React from "react";
import { useState } from "react";
import CategoryBar from "../../components/CategoryBar";
import Searchbar from "../../components/Searchbar";
import { tipCategories } from "../../data/categoryList";
import ItemCard from "../../components/ItemCard";
import { useSearchParams } from "react-router-dom";
import { dummyPosts } from "../../data/dummyPosts";
import backward from "/src/assets/backward.png";
import forward from "/src/assets/forward.png";

const ItemsDetailPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchParams, setSearchParams] = useSearchParams();
  const sort = searchParams.get("sort") || "popular";
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  const filteredPosts =
    selectedCategory === "전체"
      ? dummyPosts
      : dummyPosts.filter((post) => post.hashtag === selectedCategory);
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sort === "popular") {
      return b.views - a.views;
    } else if (sort === "latest") {
      return b.date.getTime() - a.date.getTime();
    }
    return 0;
  });
  // selectbox
  const sortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    setSearchParams({ sort: newSort });
  };
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = sortedPosts.slice(
    startIndex,
    startIndex + postsPerPage
  );
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);

  return (
    <div>
      <div className="flex justify-between items-center px-4 mt-4">
        <CategoryBar
          categories={["전체", ...tipCategories]}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
        <Searchbar />
      </div>
      <div className="flex justify-end px-4 mt-6 pt-10">
        <select
          value={sort}
          onChange={sortChange}
          className="border border-[#999999] px-2 py-1 rounded-4xl "
        >
          <option value="popular">인기순</option>
          <option value="latest">최신순</option>
        </select>
      </div>
      <div className="w-full grid grid-cols-5 gap-8 pt-5">
        {paginatedPosts.map((post, index) => (
          <ItemCard key={index} {...post} />
        ))}
      </div>
      {/*페이지네이션*/}
      <div className=" flex justify-center items-center mt-30 mb-[-1100px] gap-2">
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
    </div>
  );
};

export default ItemsDetailPage;
