import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SortDropdown from "../../components/common/SortDropdown";
import Pagination from "../../components/customer/Pagination";
import { eye, like, commentIcon, bestBadge, writeIcon } from "../../assets";
import useGetCommunity from "../../hooks/queries/useGetCommunity";
import LoginModal from "../../components/modals/LoginModal";
import type { CommunityPost, CommunitySortType } from "../../types/community";

const categories = [
  "전체",
  "인기글",
  "생활꿀팁",
  "꿀템 추천",
  "살까말까?",
  "궁금해요!",
];

const mapFrontendCategoryToAPI = (category: string): string | null => {
  switch (category) {
    case "생활꿀팁":
      return "LIFE_TIP";
    case "꿀템 추천":
      return "ITEM_RECOMMEND";
    case "살까말까?":
      return "BUY_OR_NOT";
    default:
      return null;
  }
};

const convertToAPIType = (uiType: "인기순" | "최신순"): CommunitySortType =>
  uiType === "인기순" ? "BEST" : "LATEST";

const CommunityPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sortType, setSortType] = useState<"인기순" | "최신순">("인기순");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [showLoginModal, setShowLoginModal] = useState(false); // ✅ 추가
  const navigate = useNavigate();

  useEffect(() => {
    const updateItemsPerPage = () => {
      setItemsPerPage(window.innerWidth < 768 ? 4 : 6);
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  const { data: posts = [] } = useGetCommunity({
    page: currentPage,
    size: itemsPerPage,
    sort: convertToAPIType(sortType),
  });

  const filteredData = posts.filter((post: CommunityPost) => {
    if (selectedCategory === "전체") return true;
    if (selectedCategory === "인기글") return post.isBest;
    return post.category === mapFrontendCategoryToAPI(selectedCategory);
  });

  return (
    <div className="font-[Pretendard] px-4 md:px-8 py-6 w-full relative z-0">
      <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
        {categories.map((cat) => (
          <div
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentPage(1);
            }}
            className={`cursor-pointer px-3 py-1 md:px-4 md:py-2 rounded-full border text-[12px] md:text-[14px] ${
              selectedCategory === cat
                ? "border-[#0080FF] text-[#0080FF]"
                : "border-[#E6E6E6] text-[#999999]"
            }`}
          >
            {cat}
          </div>
        ))}
      </div>

      <div className="flex justify-end mb-4">
        <SortDropdown defaultValue={sortType} onChange={setSortType} />
      </div>

      <div className="flex flex-col gap-4">
        {filteredData.length === 0 ? (
          <div className="text-center text-[#999] text-[14px] mt-10">
            게시글이 없습니다.
          </div>
        ) : (
          filteredData.map((item, index) => (
            <div
              key={item.id}
              onClick={() => index === 0 && navigate("/post")}
              className={`flex flex-col cursor-pointer ${
                item.isBest
                  ? "bg-[#CCE5FF] border-none"
                  : "bg-white border border-[#CCCCCC]"
              } rounded-[32px] p-4 md:p-6 gap-3 md:gap-4 w-full md:w-[1132px]`}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center px-2 py-[2px] md:px-3 md:py-1 border rounded-[32px] text-[10px] md:text-[14px] border-[#999999] text-[#333333]">
                  {item.category}
                </div>
                {item.isBest && (
                  <div className="flex items-center px-2 py-[2px] md:px-3 md:py-1 rounded-[32px] text-[10px] md:text-[14px] bg-[#66B2FF] text-white">
                    Best
                  </div>
                )}
                {item.hashtags?.map((tag, idx) => (
                  <div
                    key={idx}
                    className="flex items-center px-2 py-[2px] md:px-3 md:py-1 rounded-[32px] text-[10px] md:text-[14px] bg-[#CCE5FF] text-[#666666]"
                  >
                    {tag}
                  </div>
                ))}
              </div>

              <div className="text-[16px] md:text-[18px] font-medium">
                {item.title}
              </div>
              <div className="text-[12px] md:text-[14px] text-[#666666]">
                {item.content}
              </div>
              <div className="flex items-center gap-3 text-[12px] md:text-[14px] text-[#999]">
                <span className="flex items-center gap-1 text-[#333333]">
                  {item.isBest && (
                    <img
                      src={bestBadge}
                      alt="best"
                      className="w-[14px] h-[14px] md:w-[16px] md:h-[16px]"
                    />
                  )}
                  {item.nickname} · {item.createdAt}
                </span>
                <div className="flex items-center gap-1">
                  <img
                    src={eye}
                    alt="views"
                    className="w-3 h-3 md:w-4 md:h-4"
                  />
                  <span>{item.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <img
                    src={like}
                    alt="likes"
                    className="w-3 h-3 md:w-4 md:h-4"
                  />
                  <span>{item.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <img
                    src={commentIcon}
                    alt="comments"
                    className="w-3 h-3 md:w-4 md:h-4"
                  />
                  <span>{item.comments}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8">
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredData.length / itemsPerPage)}
          onPageChange={setCurrentPage}
        />
      </div>

      <div className="fixed bottom-5 right-5 md:static md:mt-10 flex justify-end z-[50]">
        <button
          onClick={() => {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
              setShowLoginModal(true); // ✅ 모달 열기
              return;
            }
            navigate("/communitypost");
          }}
          className="bg-[#0080FF] text-white flex items-center gap-2 rounded-[32px] px-6 py-3 text-sm md:text-base"
        >
          <img src={writeIcon} alt="write" className="w-5 h-5" />
          글쓰기
        </button>
      </div>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
};

export default CommunityPage;
