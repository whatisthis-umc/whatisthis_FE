import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Pagination from "../components/customer/Pagination";
import PostLikeButton from "../components/common/PostLikeButton";
import { darkHeart } from "../assets";
import useMyLikes from "../hooks/queries/useMyLikes";
import type { LikeListViewModel } from "../types/likes";

const PAGE_SIZE = 10;

// ====== PostDetailPage와 동일한 방식의 이미지 URL 유틸 ======
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const toAbs = (u?: string) => {
  if (!u) return "";
  if (/^(https?:)?\/\//i.test(u) || u.startsWith("data:")) return u; // 절대/데이터 URL
  return `${API_BASE}${u.startsWith("/") ? "" : "/"}${u}`; // 상대경로 → API_BASE 붙이기
};

export default function LikesPage() {
  const [currentPage, setCurrentPage] = useState(1); // 1-based
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useMyLikes(currentPage, PAGE_SIZE);

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;
  const empty = !isLoading && items.length === 0;

  const handlePageChange = (page: number) => setCurrentPage(page);

  // 좋아요 해제 시 즉시 카드 제거(낙관적 캐시)
  const removeFromCache = (postId: number) => {
    const key = ["myLikes", currentPage, PAGE_SIZE] as const;
    qc.setQueryData<LikeListViewModel>(key, (prev) => {
      if (!prev) return prev;
      return { ...prev, items: prev.items.filter((it) => it.id !== postId) };
    });
  };

  const updateCountInCache = (postId: number, likeCount: number) => {
    const key = ["myLikes", currentPage, PAGE_SIZE] as const;
    qc.setQueryData<LikeListViewModel>(key, (prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((it) =>
          it.id === postId ? { ...it, likeCount, liked: true } : it
        ),
      };
    });
  };

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10">
      <h2 className="text-xl font-semibold mt-15 mb-15 text-left">나의 좋아요</h2>

      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-10">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse w-full aspect-[1/1] rounded-[32px] border border-gray-200 shadow-sm p-4 bg-gray-50"
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-red-500 mb-6">
          좋아요 목록을 불러오는 중 오류가 발생했어요.
          <br />
          {(error as Error)?.message}
        </div>
      )}

      {empty && (
        <div className="text-gray-500 mb-10">좋아요한 게시글이 아직 없어요.</div>
      )}

      {!isLoading && !isError && !empty && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-10">
            {items.map((item) => {
              // 첫 유효 이미지 1장만 사용 (PostDetail 방식으로 절대경로화)
              const first = (item.imageUrl || []).find((u) => !!u && u.trim() !== "");
              const cover = first ? toAbs(first) : "";

              return (
                <div key={item.id} className="flex flex-col">
                  {/* ✅ 카드 전체 클릭 → /post/:id 이동 */}
                  <div
                    role="link"
                    tabIndex={0}
                    onClick={() => navigate(`/post/${item.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/post/${item.id}`);
                      }
                    }}
                    className="group cursor-pointer relative w-full aspect-[1/1] rounded-[32px] border border-gray-300 shadow-sm p-4 flex flex-col"
                  >
                    {/* 제목/요약 */}
                    <div>
                      <h3 className="font-medium text-sm truncate">{item.title}</h3>
                      <p className="text-gray-500 text-sm truncate">{item.content}</p>
                    </div>

                    {/* 가운데 이미지: 있을 때만 렌더링 (정사각형 카드 내부에서 남는 공간 채우기) */}
                    {cover && (
                      <div className="relative mt-3 flex-1 min-h-0 rounded-2xl overflow-hidden">
                        <img
                          src={cover}
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* 하단 하트 (카드 네비게이션과 분리) */}
                    <div className="mt-auto flex justify-end pt-2">
                      <PostLikeButton
                        postId={item.id}
                        liked={true}
                        likeCount={item.likeCount ?? 0}
                        onChange={(next) => {
                          if (!next.liked) {
                            removeFromCache(item.id);
                          } else {
                            updateCountInCache(item.id, next.likeCount);
                          }
                        }}
                        render={({ liked, pending, toggle }) => (
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // ✅ 카드 클릭 막기
                              toggle();
                            }}
                            onKeyDown={(e) => e.stopPropagation()}
                            disabled={pending}
                            className="inline-flex items-center gap-2"
                            aria-label={liked ? "좋아요 취소" : "좋아요"}
                          >
                            <img
                              src={darkHeart}
                              alt="heart"
                              className={`w-5 h-5 transition-opacity duration-150 ${
                                liked ? "opacity-100" : "opacity-30"
                              }`}
                            />
                          </button>
                        )}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
}