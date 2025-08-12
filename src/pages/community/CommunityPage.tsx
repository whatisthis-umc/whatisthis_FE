import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SortDropdown from "../../components/common/SortDropdown";
import Pagination from "../../components/customer/Pagination";
import { eye, like, commentIcon, bestBadge, writeIcon } from "../../assets";
import useGetCommunity from "../../hooks/queries/useGetCommunity";
import LoginModal from "../../components/modals/LoginModal";
import type { CommunityPost, CommunitySortType } from "../../types/community";

const categories = ["전체", "인기글", "생활꿀팁", "꿀템 추천", "살까말까?", "궁금해요!"];

// 정렬 변환
const convertToAPIType = (uiType: "인기순" | "최신순"): CommunitySortType =>
  uiType === "인기순" ? "BEST" : "LATEST";

const CommunityPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]>("전체");
  // ✅ 기본은 최신순으로 시작 (BEST가 서버에서 500나는 현상 회피)
  const [sortType, setSortType] = useState<"인기순" | "최신순">("최신순");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const updateItemsPerPage = () => setItemsPerPage(window.innerWidth < 768 ? 4 : 6);
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  // "인기글" 탭을 누르면 정렬을 BEST로 맞추되, 실제 요청은 popular 엔드포인트가 사용됨
  useEffect(() => {
    if (selectedCategory === "인기글" && sortType !== "인기순") {
      setSortType("인기순");
    }
  }, [selectedCategory, sortType]);

  const { data, isLoading, isError } = useGetCommunity({
    page: currentPage,
    size: itemsPerPage,
    sort: convertToAPIType(sortType),
    uiCategory: selectedCategory,
  });

  const posts: CommunityPost[] = data?.posts ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="font-[Pretendard] px-4 md:px-8 py-6 w-full relative z-0">
      {/* 카테고리 */}
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

      {/* 정렬 */}
      <div className="flex justify-end mb-7">
        <SortDropdown defaultValue={sortType} onChange={setSortType} />
      </div>

      {/* 리스트 */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="text-center text-[#999] text-[14px] mt-10">불러오는 중…</div>
        ) : isError ? (
          <div className="text-center text-red-500 text-[14px] mt-10">
            목록을 불러오지 못했습니다.
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-[#999] text-[14px] mt-10">게시글이 없습니다.</div>
        ) : (
          posts.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/post/${item.id}`)}
              className="grid grid-cols-[1fr_110px] sm:grid-cols-[1fr_140px] md:grid-cols-[1fr_220px] gap-4 sm:gap-5 md:gap-6 items-start cursor-pointer"
            >
              {/* 좌측 카드 */}
              <div
                className={`${
                  (item as any).isBest ? "bg-[#CCE5FF] border-none" : "bg-white border border-[#CCCCCC]"
                } rounded-[32px] p-4 md:p-6 w-full min-h-[110px] sm:min-h-[140px] md:min-h-[220px]`}
              >
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <div className="flex items-center px-2 py-[2px] md:px-3 md:py-1 border rounded-[32px] text-[10px] md:text-[14px] border-[#999999] text-[#333333]">
                    {item.category}
                  </div>
                  {(item as any).isBest && (
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

                <div className="text-[15px] sm:text-[16px] md:text-[18px] font-medium mb-1 line-clamp-2">
                  {item.title}
                </div>
                <div className="text-[12px] sm:text-[13px] md:text-[14px] text-[#666666] line-clamp-2 md:line-clamp-3">
                  {item.content}
                </div>

                <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-3 text-[12px] md:text-[14px] text-[#999]">
                  <span className="flex items-center gap-1 text-[#333333]">
                    {(item as any).isBest && (
                      <img
                        src={bestBadge}
                        alt="best"
                        className="w-[14px] h-[14px] md:w-[16px] md:h-[16px]"
                      />
                    )}
                    {item.nickname} · {item.createdAt}
                  </span>
                  <div className="flex items-center gap-1">
                    <img src={eye} alt="views" className="w-3 h-3 md:w-4 md:h-4" />
                    <span>{(item as any).views ?? (item as any).viewCount ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <img src={like} alt="likes" className="w-3 h-3 md:w-4 md:h-4" />
                    <span>{(item as any).likes ?? (item as any).likeCount ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <img src={commentIcon} alt="comments" className="w-3 h-3 md:w-4 md:h-4" />
                    <span>{(item as any).comments ?? (item as any).commentCount ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* 우측 썸네일 */}
              <div className="justify-self-end">
                <div className="w-[110px] h-[110px] sm:w-[140px] sm:h-[140px] md:w-[220px] md:h-[220px] rounded-[32px] overflow-hidden bg-[#E6E6E6]">
                  {item.imageUrls?.length ? (
                    <img
                      src={item.imageUrls[0]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (item as any).thumbnailUrl ? (
                    <img
                      src={(item as any).thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#9CA3AF] text-xs sm:text-sm">
                      이미지 없음
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 페이지네이션: 서버 totalPages 사용 */}
      <div className="mt-8">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* 글쓰기 + 로그인 모달 */}
      <div className="fixed bottom-5 right-5 md:static md:mt-10 flex justify-end z-[50]">
        <button
          onClick={() => {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
              setShowLoginModal(true);
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

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </div>
  );
};

export default CommunityPage;