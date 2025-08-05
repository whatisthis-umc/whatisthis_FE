import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Searchbar from "../../components/Searchbar";
import { more } from "../../assets";
import ItemCard from "../../components/ItemCard";
import CategoryBar from "../../components/CategoryBar";
import { tipCategories } from "../../data/categoryList";
import { tipService } from "../../api/lifeTipsApi";
import type { TipPost } from "../../api/types";
import { subCategoryEnumMap } from "../../constants/subCategoryEnumMap";

// 게시물 카드 렌더링 컴포넌트
const PostCard = ({ post, navigate }: { post: TipPost; navigate: any }) => (
  <div
    key={post.postId}
    onClick={() => navigate(`/tips/${post.postId}`)}
    className="cursor-pointer"
  >
    <ItemCard
      id={post.postId}
      category={post.category}
      hashtag={post.hashtags}
      imageUrl={post.imageUrls}
      title={post.title}
      description={post.summary}
      views={post.views}
      scraps={post.scraps}
      date={new Date(post.date)}
      type="tips"
    />
  </div>
);

// 섹션 헤더 컴포넌트
const SectionHeader = ({ 
  title, 
  onMoreClick 
}: { 
  title: string; 
  onMoreClick: () => void;
}) => (
  <div className="flex justify-between h-12">
    <span className="font-[700] text-[24px] md:text-[32px] ml-4 md:ml-0">
      {title}
    </span>
    <button
      onClick={onMoreClick}
      className="w-[68px] h-[26px] md:w-[86px] md:h-[32px] text-[#333333] rounded-4xl flex items-center justify-between border-2 border-[#999999] cursor-pointer"
    >
      <span className="ml-2 text-[14px] md:text-[16px]">더보기</span>
      <img
        src={more}
        alt="더보기"
        className="w-[7px] h-[7px] md:w-[7.4px] md:h-[12px] mr-2"
      />
    </button>
  </div>
);

const TipsPage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [allPosts, setAllPosts] = useState<TipPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 데이터 로딩
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      setError(null);

      try {
        const allData: any[] = [];
        let page = 1;
        let hasMoreData = true;

        while (hasMoreData && isMounted) {
          const result = await tipService.getAllTips(page);

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
        console.error("Error loading data:", e);
        setError(typeof e === "string" ? e : "데이터 로딩 실패");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 카테고리 매핑 (UI 카테고리 -> 서버 카테고리)
  const getServerCategory = (uiCategory: string): string => {
    if (uiCategory === "전체") return "";
    return (
      subCategoryEnumMap[uiCategory as keyof typeof subCategoryEnumMap] || ""
    );
  };

  // 카테고리 필터링
  const filteredPosts =
    selectedCategory === "전체"
      ? allPosts
      : allPosts.filter((post) => {
          const serverCategory = getServerCategory(selectedCategory);
          return post.subCategories?.some((cat: string) =>
            cat.toLowerCase().includes(serverCategory.toLowerCase())
          ) || false;
        });

  // 인기순 정렬 (조회수 + 스크랩 수)
  const popularPosts = [...filteredPosts].sort((a, b) => {
    const popularityA = (a.views || 0) + (a.scraps || 0);
    const popularityB = (b.views || 0) + (b.scraps || 0);
    return popularityB - popularityA;
  });

  // 최신순 정렬 (postId 기준)
  const recentPosts = [...filteredPosts].sort((a, b) => b.postId - a.postId);

  // AI 추천순 (랜덤)
  function getRandomPosts(posts: TipPost[], count: number) {
    const shuffled = [...posts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  const recommendedPosts = getRandomPosts(filteredPosts, 4);

  const handleSearch = (input: string) => {
    setKeyword(input);
  };

  // 검색 필터링
  const searchfilteredPosts = keyword
    ? allPosts.filter((post) =>
        [post.title, post.summary, ...post.hashtags]
          .join(" ")
          .toLowerCase()
          .includes(keyword.toLowerCase())
      )
    : allPosts;
  return (
    <div>
      <div className="flex justify-between items-center px-4 mt-4 ">
        <CategoryBar
          categories={["전체", ...tipCategories]}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
        <div className="hidden md:w-full md:max-w-[1440px]  md:mx-auto md:flex md:justify-between md:items-center md:px-4 md:mt-4">
          <Searchbar onSearch={handleSearch} />
        </div>
      </div>
      {keyword ? (
        // 검색 결과 화면
        <div className="mt-10 px-8">
          <h2 className="text-[20px] md:text-[24px] font-bold mb-2 md:mb-4">
            <span className="inline-block bg-[#F5FFCC] rounded-2xl px-2">
              {keyword}
            </span>
            에 대한 검색 결과
          </h2>
          {filteredPosts.length > 0 ? (
            <div className="flex flex-wrap gap-1 md:gap-6">
              {searchfilteredPosts.map((post) => (
                <PostCard key={post.postId} post={post} navigate={navigate} />
              ))}
            </div>
          ) : (
            <div className="text-gray-500 mt-8">검색 결과가 없습니다.</div>
          )}
        </div>
      ) : (
        <>
          <div className="w-full h-[400px] md:h-[475px] mt-15 md:mt-36 mb-120 md:mb-300">
            <SectionHeader 
              title="인기 게시물" 
              onMoreClick={() => navigate("/tips/list?sort=popular")} 
            />
            {/*게시글 목록*/}
            <div className="w-full h-70 md:h-110 flex felx-row gap-6 md:gap-20 overflow-hidden">
              {popularPosts.map((post) => (
                <PostCard key={post.postId} post={post} navigate={navigate} />
              ))}
            </div>
            {/*AI 추천 게시물*/}
            <div className="w-full h-[700px] md:h-[475px] mt-5 md:mt-36 mb-300">
              <SectionHeader 
                title="AI 추천 게시물" 
                onMoreClick={() => navigate("./recommend")} 
              />
              {/*게시글 목록*/}
              <div className="w-full h-70 md:h-110 flex felx-row gap-6 md:gap-20 overflow-hidden">
                {recommendedPosts.map((post) => (
                  <PostCard key={post.postId} post={post} navigate={navigate} />
                ))}
              </div>
              {/*최신 게시물*/}
              <div className="w-full h-[700px] md:h-[475px] mt-5 md:mt-36 mb-300">
                <SectionHeader 
                  title="최신 게시물" 
                  onMoreClick={() => navigate("/tips/list?sort=latest")} 
                />
                {/*게시글 목록*/}
                <div className="w-full h-70 md:h-110 flex felx-row gap-6 md:gap-20 overflow-hidden">
                  {recentPosts.map((post) => (
                    <PostCard key={post.postId} post={post} navigate={navigate} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TipsPage;
