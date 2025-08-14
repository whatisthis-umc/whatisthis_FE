import Searchbar from "../components/Searchbar";
import { banner, more } from "../assets";
import { useNavigate, useLocation } from "react-router-dom";
import CommunityCard from "../components/CommunityCard";

import useGetCommunity from "../hooks/queries/useGetCommunity";

const MainPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get("keyword") || "";

  const navigate = useNavigate();

  // 커뮤니티 데이터 가져오기 (인기순)
  const { data: communityData, isLoading: communityLoading } = useGetCommunity({
    page: 1,
    size: 4,
    sort: "BEST",
    uiCategory: "인기글",
  });

  const handleSearch = (input: string) => {
    navigate(`/search?keyword=${encodeURIComponent(input)}`);
  };

  return (
    <div>
      <div className="hidden md:w-full md:max-w-[1440px] md:mx-auto md:flex md:justify-between md:items-center md:px-4 md:mt-4">
        <Searchbar onSearch={handleSearch} />
      </div>

      {keyword ? (
        // 검색 결과 화면 (기존 그대로 유지)
        <div className="mt-10 px-8">
          <h2 className="text-[20px] md:text-[24px] font-bold mb-2 md:mb-4">
            <span className="inline-block bg-[#F5FFCC] rounded-2xl px-2">
              {keyword}
            </span>
            에 대한 검색 결과
          </h2>
          <div className="text-gray-500 mt-8">검색 결과가 없습니다.</div>
        </div>
      ) : (
        <>
          {/* 메인 배너 */}
          <div className="w-full flex justify-center mt-8 md:mt-12 px-2 md:px-8">
            <img
              src={banner}
              alt="여름맞이 꿀팁 요음전"
              className="w-full max-w-[1400px] h-auto rounded-2xl"
            />
          </div>

          {/* 꿀팁/꿀템 이동 박스 */}
          <div className="w-full max-w-[1400px] mx-auto px-2 md:px-8 mt-8 md:mt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {/* 오늘의 생활꿀팁 박스 */}
              <div
                onClick={() => navigate("/tips")}
                className="bg-[#CCE5FF] rounded-2xl p-8 cursor-pointer hover:bg-[#b2ceeb] transition-colors"
              >
                <div className="text-sm md:text-base text-gray-600 mb-2">
                  생활꿀팁
                </div>
                <div className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                  오늘의 생활꿀팁
                </div>
                <div className="flex justify-end">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.5 5L15.5 12L8.5 19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* 오늘의 생활꿀템 박스 */}
              <div
                onClick={() => navigate("/items")}
                className="bg-[#CCE5FF] rounded-2xl p-8 cursor-pointer hover:bg-[#b2ceeb] transition-colors"
              >
                <div className="text-sm md:text-base text-gray-600 mb-2">
                  생활꿀템
                </div>
                <div className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                  오늘의 생활꿀템
                </div>
                <div className="flex justify-end">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.5 5L15.5 12L8.5 19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* 인기 커뮤니티 글 */}
          <div className="w-full md:w-[1392px] h-[260px] md:h-[475px] mt-15 md:mt-36">
            <div className="flex justify-between h-12">
              <span className="font-[700] text-[20px] md:text-[32px]">
                인기 커뮤니티 글
              </span>
              <button
                onClick={() => navigate("/community")}
                className="w-[57px] md:w-[86px] h-[25px] md:h-[32px] text-[#333333] rounded-4xl flex items-center justify-between border-2 border-[#999999] cursor-pointer"
              >
                <span className="text-[10px] md:text-[16px] ml-2">더보기</span>
                <img
                  src={more}
                  alt="더보기"
                  className="w-[7px] h-[7px] md:w-[7.4px] md:h-[12px] mr-2"
                />
              </button>
            </div>
            <div className="w-full mt-[-40px] md:mt-0 h-110 flex flex-row gap-5 md:gap-20 overflow-x-hidden">
              {communityLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-500">
                    인기 커뮤니티 게시글을 불러오는 중...
                  </p>
                </div>
              ) : communityData?.posts && communityData.posts.length > 0 ? (
                communityData.posts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => navigate(`/post/${post.id}`)}
                    className="cursor-pointer"
                  >
                    <CommunityCard
                      hashtag="Best"
                      nickname={post.nickname}
                      date={new Date(post.createdAt)}
                      title={post.title}
                      description={post.content}
                      views={post.views}
                      likes={post.likes}
                      comments={post.comments}
                      best={post.isBest}
                    />
                  </div>
                ))
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-500">
                    인기 커뮤니티 게시글이 없습니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MainPage;
