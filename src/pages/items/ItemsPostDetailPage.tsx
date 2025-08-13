import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dummyPosts } from "../../data/dummyPosts";
import CategoryBar from "../../components/CategoryBar";
import Searchbar from "../../components/Searchbar";
import { itemCategories } from "../../data/categoryList";
import { whitescrap, reportIcon, whitefilledscrap } from "../../assets";
import ItemCard from "../../components/ItemCard";
import ReportModal from "../../components/modals/ReportModal";
import LoginModal from "../../components/modals/LoginModal";
import { tipService } from "../../api/lifeTipsApi";
import type { ItemPost, ItemPostDetail } from "../../api/types";
import { itemDetailService } from "../../api/itemDetailApi";
import { useScrap } from "../../hooks/useInteraction";
import useReportPost from "../../hooks/mutations/useReportPost";
import { useAuth } from "../../hooks/useAuth";

const ItemsPostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [post, setPost] = useState<ItemPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [allPosts, setAllPosts] = useState<ItemPost[]>([]);
  // 신고한 게시물 ID를 localStorage에 저장하여 재방문 시에도 방지
  // localStorage에서 신고한 게시물 목록 가져오기
  const getReportedPosts = () => {
    try {
      const reportedPostsStr = localStorage.getItem("reportedPosts");
      return reportedPostsStr ? JSON.parse(reportedPostsStr) : [];
    } catch {
      return [];
    }
  };

  // localStorage에 신고한 게시물 추가
  const addReportedPost = (postId: number) => {
    try {
      const reportedPosts = getReportedPosts();
      if (!reportedPosts.includes(postId)) {
        reportedPosts.push(postId);
        localStorage.setItem("reportedPosts", JSON.stringify(reportedPosts));
      }
    } catch (error) {
      console.error("localStorage 저장 실패:", error);
    }
  };

  const relatedPosts = dummyPosts.slice(0, 5);

  // 스크랩 Hook - 항상 호출하되 postId가 없으면 0으로 초기화
  const postId = id ? parseInt(id) : 0;
  
  const [reportedPost, setReportedPost] = useState(() => {
    return getReportedPosts().includes(postId);
  });

  // postId가 변경될 때마다 신고 상태 업데이트
  useEffect(() => {
    setReportedPost(getReportedPosts().includes(postId));
  }, [postId]);
  const scrap = useScrap(postId, { isActive: false, count: 0 });
  const reportPostM = useReportPost(postId);

  console.log(
    `ItemsPostDetailPage - postId: ${postId}, scrap state:`,
    scrap.state
  );

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    itemDetailService
      .getTipDetail(parseInt(id))
      .then((data: ItemPostDetail) => {
        setPost(data);

        console.log("Item detail data:", data);

        // 서버 카테고리를 UI 카테고리로 변환
        const getUICategory = (serverCategory: string): string => {
          const categoryMap: { [key: string]: string } = {
            SELF_LIFE_ITEM: "자취 필수템",
            KITCHEN_ITEM: "주방템",
            CLEAN_ITEM: "청소템",
            HOUSEHOLD_ITEM: "살림도구템",
            BRAND_ITEM: "브랜드 꿀템",
            LIFE_ITEM: "전체",
          };
          return categoryMap[serverCategory] || "전체";
        };

        // category 또는 subCategories에서 카테고리 결정
        const categoryToUse = data.subCategories || data.category;
        console.log("Category to use:", categoryToUse);

        setSelectedCategory(getUICategory(categoryToUse) || "전체");
      })
      .catch((err: any) => {
        console.error("게시물 조회 실패:", err);
        setError("게시물을 불러올 수 없습니다.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // 모든 게시물 데이터 가져오기
  useEffect(() => {
    let isMounted = true;

    const loadAllPosts = async () => {
      if (!isMounted) return;

      try {
        const allData: any[] = [];
        let page = 1;
        let hasMoreData = true;

        while (hasMoreData && isMounted) {
          const result = await tipService.getAllPosts(page);
          if (result.posts.length === 0) {
            hasMoreData = false;
          } else {
            allData.push(...result.posts);
            page++;
          }
        }

        if (!isMounted) return;

        // 전체 데이터에서 중복 제거
        const uniqueData = allData.reduce((acc: any[], current: any) => {
          const exists = acc.find(
            (item: any) => item.postId === current.postId
          );
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, []);

        setAllPosts(uniqueData);
      } catch (e) {
        if (!isMounted) return;
        console.error("Error loading all posts:", e);
      }
    };

    loadAllPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="px-8 py-12 text-center text-gray-500 text-xl">
        로딩 중...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="px-8 py-12 text-center text-red-500 text-xl">
        {error || "게시글을 찾을 수 없습니다."}
      </div>
    );
  }

  const images =
    post.images.length > 0
      ? post.images
      : ["https://via.placeholder.com/600x400?text=No+Image"];

  const handleSearch = (input: string) => {};

  // 로그인 체크 함수
  const checkLogin = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  const handleReport = (data: { content: string; description: string | null }) => {
    if (!post) return;
    
    if (reportedPost) {
      alert("이미 이 게시물을 신고하셨습니다.");
      return;
    }
    
    reportPostM.mutate(
      { content: data.content, description: data.description },
      {
        onSuccess: () => {
          alert("신고가 완료되었습니다.");
          setReportedPost(true);
          addReportedPost(postId); // localStorage에 저장
          setShowReportModal(false);
        },
        onError: (e: any) => {
          console.error("게시물 신고 실패:", e);
          if (e?.status === 409 || e?.code === "ALREADY_REPORTED") {
            alert("이미 신고된 게시물입니다.");
            setReportedPost(true);
            addReportedPost(postId); // localStorage에 저장
          } else if (e?.status === 500) {
            alert("이미 신고한 게시물이거나 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
          } else {
            alert(e?.message ?? "신고 처리에 실패했습니다.");
          }
        },
      }
    );
  };

  return (
    <div className="px-8">
      <div className="flex justify-between items-center mt-4">
        <CategoryBar
          categories={["전체", ...itemCategories]}
          selected={selectedCategory}
          onSelect={(category) => {
            setSelectedCategory(category);
            // 현재 게시물의 카테고리가 아닌 다른 카테고리를 선택한 경우 목록 페이지로 이동
            if (category !== selectedCategory) {
              navigate(`/items/list?category=${category}`);
            }
          }}
        />
        <div className="hidden md:block">
          <Searchbar onSearch={handleSearch} />
        </div>
      </div>

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
                    currentImageIndex === idx ? "bg-[#0080FF]" : "bg-gray-400"
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
                {post.content?.split("\n\n")[0]}
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
                {post.content?.split("\n\n")[1] || post.content}
              </p>
            </div>

            <div className="flex flex-row gap-2 ml-2 mt-10 md:mt-100 flex-wrap">
              {post.hashtags.map((tag, idx) => (
                <div
                  key={idx}
                  className="w-fit px-3 h-[29px] flex items-center rounded-4xl bg-[#CCE5FF] text-[#666666]"
                >
                  #{tag}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mt-8 justify-between">
            <button
              className={`w-[93px] h-[37px] md:w-[156px] md:h-[54px] text-[14px] md:text-[20px] font-[500] gap-1 md:gap-2 rounded-4xl flex justify-center items-center 
              ${
                scrap.state.isActive
                  ? "bg-[#0080FF] text-white"
                  : "bg-[#0080FF] text-white"
              } ${scrap.state.isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => {
                if (checkLogin()) {
                  scrap.toggle();
                }
              }}
              disabled={scrap.state.isLoading}
            >
              <img
                src={scrap.state.isActive ? whitefilledscrap : whitescrap}
                alt="스크랩"
                className="w-5 h-5 md:mr-2"
              />
              {scrap.state.isLoading
                ? "처리중..."
                : scrap.state.isActive
                  ? "스크랩"
                  : "스크랩"}
            </button>
            <button
              className="w-[93px] h-[37px] md:w-[156px] md:h-[54px] text-white text-[14px] md:text-[20px] font-[500] gap-1 md:gap-2 bg-[#0080FF] rounded-4xl flex justify-center items-center"
              onClick={() => {
                if (checkLogin()) {
                  setShowReportModal(true);
                }
              }}
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
          onSubmit={handleReport}
        />
      )}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}

      <div className="mt-15 md:mt-25">
        <h3 className="text-[20px] md:text-[24px] font-bold mb-2 md:mb-6">
          관련 꿀템 게시물
        </h3>
        <div className="flex gap-5 md:gap-10 overflow-x-auto hide-scrollbar">
          {relatedPosts.map((relatedPost) => (
            <div
              key={relatedPost.id}
              onClick={() => navigate(`/${relatedPost.type}/${relatedPost.id}`)}
              className="cursor-pointer"
            >
              <ItemCard
                hashtag={relatedPost.hashtag}
                imageUrl={relatedPost.imageUrl}
                title={relatedPost.title}
                description={relatedPost.description}
                views={relatedPost.views}
                scraps={relatedPost.scraps}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItemsPostDetailPage;
