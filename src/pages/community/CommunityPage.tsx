import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import useGetCommunity from "../../hooks/queries/useGetCommunity";
import SortDropdown from "../../components/common/SortDropdown";
import Pagination from "../../components/customer/Pagination";
import LoginModal from "../../components/modals/LoginModal";

import { eye, like, commentIcon, bestBadge, writeIcon } from "../../assets";
import type { CommunityPost, CommunitySortType } from "../../types/community";

/* ================= 공용 유틸 ================= */
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const toAbs = (u?: string) => {
  if (!u) return "";
  if (/^(https?:)?\/\//i.test(u) || u.startsWith("data:")) return u;
  return `${API_BASE}${u.startsWith("/") ? "" : "/"}${u}`;
};

const fmt2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const formatKST = (isoLike?: string) => {
  if (!isoLike) return "";
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return isoLike;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${Math.max(1, diffMin)}분 전`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}시간 전`;
  if (diffHr < 48) return "1일 전";
  const yy = d.getFullYear() % 100;
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  return `${fmt2(yy)}.${fmt2(mm)}.${fmt2(dd)}`;
};

/* ================= 정렬 UI ⇄ API ================= */
const uiToApi = (ui: "인기순" | "최신순"): CommunitySortType =>
  ui === "인기순" ? "BEST" : "LATEST";
const apiToUi = (api: CommunitySortType): "인기순" | "최신순" =>
  api === "BEST" ? "인기순" : "최신순";

/* ================= 카테고리 라벨/매핑 ================= */
const UI_CATEGORIES = ["전체", "인기글", "생활꿀팁", "꿀템추천", "살까말까?", "궁금해요!"] as const;
type CategoryType = typeof UI_CATEGORIES[number];

const API_TO_UI: Record<string, CategoryType> = {
  ALL: "전체",
  BEST: "인기글",

  TIP: "생활꿀팁",
  LIFEHACK: "생활꿀팁",
  LIFE_TIP: "생활꿀팁",
  "생활꿀팁": "생활꿀팁",

  RECOMMEND: "꿀템추천",
  ITEM_RECOMMEND: "꿀템추천",
  ITEMRECOMMEND: "꿀템추천",
  ITEM: "꿀템추천",
  GOODS_RECOMMEND: "꿀템추천",
  "꿀템추천": "꿀템추천",
  "꿀템 추천": "꿀템추천",

  BUY_OR_NOT: "살까말까?",
  BUYORNOT: "살까말까?",
  BUY_OR_NOT_Q: "살까말까?",
  SHOULD_I_BUY: "살까말까?",
  "살까말까?": "살까말까?",

  QUESTION: "궁금해요!",
  QNA: "궁금해요!",
  CURIOUS: "궁금해요!",
  ASK: "궁금해요!",
  "궁금해요!": "궁금해요!",
};

// 정규화: 공백/밑줄/?,! 제거 후 대문자
const NORM = (s: string) => s.replace(/[\s_?!]/g, "").toUpperCase();
const API_TO_UI_NORM: Record<string, CategoryType> = Object.fromEntries(
  Object.entries(API_TO_UI).map(([k, v]) => [NORM(k), v])
);

const getRawCategory = (item: any): string | undefined =>
  item?.category ??
  item?.categoryCode ??
  item?.categoryName ??
  item?.categoryKo ??
  item?.categoryLabel ??
  item?.categoryKr ??
  item?.categoryDto?.name;

const toDisplayCategory = (raw?: string): CategoryType => {
  if (!raw) return "전체";
  const key = String(raw).trim();
  const norm = NORM(key);
  if (API_TO_UI_NORM[norm]) return API_TO_UI_NORM[norm];
  const direct = UI_CATEGORIES.find((k) => NORM(k) === norm);
  return (direct as CategoryType) ?? "전체";
};

/* ================= 본문 미리보기 정리 ================= */
const removeExtraBlock = (text: string) => text.replace(/<!--EXTRA:\{[\s\S]*?\}-->/g, "").trim();
const removeSourceLine = (text: string) => {
  const lines = text.split(/\n+/);
  const idx = [...lines].reverse().findIndex((s) => /^출처\s*[:：]/.test(s.trim()));
  if (idx === -1) return text;
  const realIdx = lines.length - 1 - idx;
  lines.splice(realIdx, 1);
  return lines.join("\n");
};
const stripHtml = (html: string) =>
  html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
const tidyPreview = (raw?: string) => {
  const s = String(raw ?? "");
  const noExtra = removeExtraBlock(s);
  const noSrc = removeSourceLine(noExtra);
  const plain = stripHtml(noSrc);
  return plain.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
};

/* ================= 카드 필드 안전 추출 ================= */
const getThumb = (item: any): string | "" => {
  const list = Array.isArray(item?.imageUrls) ? item.imageUrls : [];
  const src = list[0] ?? item?.thumbnailUrl ?? item?.thumbnail ?? "";
  return toAbs(src);
};

const extractHashtags = (item: any): string[] => {
  const a = Array.isArray(item?.hashtags) ? item.hashtags : [];
  const b = Array.isArray(item?.hashtagList) ? item.hashtagList : [];
  const c = item?.hashtagListDto?.hashtagList?.map((h: any) => h?.content).filter(Boolean) ?? [];
  const d = Array.isArray(item?.result?.hashtags) ? item.result.hashtags : [];
  return Array.from(
    new Set<string>(
      [...a, ...b, ...c, ...d].map((t) => (typeof t === "string" ? t : t?.content ?? "")).filter(Boolean)
    )
  );
};

/* 카테고리 집합(인기글 제외) */
const categorySetOf = (item: any): Set<CategoryType> => {
  const set = new Set<CategoryType>();
  const primary = toDisplayCategory(getRawCategory(item));
  if (primary && primary !== "전체" && primary !== "인기글") set.add(primary);

  const extraSources: (string | undefined)[] = [
    item?.categoryEn,
    item?.type,
    item?.topic,
    item?.postType,
    item?.subCategory,
    item?.category2,
    item?.tagCategory,
    ...(Array.isArray(item?.categories) ? item.categories : []),
  ];
  extraSources.forEach((s) => {
    const lab = toDisplayCategory(s);
    if (lab && lab !== "전체" && lab !== "인기글") set.add(lab);
  });

  const hs = extractHashtags(item).map((h) => NORM(h));
  if (hs.some((h) => h === NORM("꿀템추천"))) set.add("꿀템추천");
  if (hs.some((h) => h === NORM("살까말까?"))) set.add("살까말까?");
  if (hs.some((h) => h === NORM("궁금해요!"))) set.add("궁금해요!");

  return set;
};

/* 카드에 표시할 카테고리 뱃지들(⚠️ '인기글' 배지는 붙이지 않음) */
const badgesFor = (item: any): CategoryType[] => {
  const set = categorySetOf(item);
  const ORDER: CategoryType[] = ["전체", "생활꿀팁", "꿀템추천", "살까말까?", "궁금해요!"];
  const primary = toDisplayCategory(getRawCategory(item));
  const ordered = new Set<CategoryType>([primary, ...ORDER]);
  return [...ordered].filter((x) => x && (x === primary || set.has(x)));
};

/* 유니크 머지 */
const mergeUniqueById = (a: any[], b: any[]) => {
  const map = new Map<number, any>();
  [...a, ...b].forEach((p: any) => {
    if (p && typeof p.id === "number" && !map.has(p.id)) map.set(p.id, p);
  });
  return [...map.values()];
};

/* ================= 컴포넌트 ================= */
const CommunityPage = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("전체");
  const [sortType, setSortType] = useState<"인기순" | "최신순">("인기순"); // 기본 '인기순'
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const updateItemsPerPage = () => setItemsPerPage(window.innerWidth < 768 ? 4 : 6);
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  // 인기글 탭은 항상 인기순 + 1페이지
  useEffect(() => {
    if (selectedCategory === "인기글") {
      if (sortType !== "인기순") setSortType("인기순");
      if (currentPage !== 1) setCurrentPage(1);
    }
  }, [selectedCategory, sortType, currentPage]);

  // 1) 주 쿼리: 실제 선택된 카테고리(인기글이면 '전체'로 대체)
  const fetchCategory: CategoryType = selectedCategory === "인기글" ? "전체" : selectedCategory;
  const { data: mainData, isLoading, isError } = useGetCommunity({
    page: currentPage,
    size: itemsPerPage,
    sort: uiToApi(sortType),
    uiCategory: fetchCategory,
  });

  // 2) 보조 쿼리: 항상 '전체'를 함께 받아서(같은 페이지/정렬) 프론트 필터/Best/즉시표시 보강
  const { data: allData } = useGetCommunity({
    page: currentPage,
    size: itemsPerPage,
    sort: uiToApi(sortType),
    uiCategory: "전체",
  });

  const posts: CommunityPost[] = mainData?.posts ?? [];
  const allPosts: CommunityPost[] = allData?.posts ?? [];
  const totalPagesFromApi = mainData?.totalPages ?? 1;

  // 현재 페이지의 '전체' 상위 4개 ID (인기순+1페이지일 때 Best로 취급)
  const bestIdSet = useMemo(() => {
    if (sortType !== "인기순" || currentPage !== 1) return new Set<number>();
    return new Set<number>(allPosts.slice(0, 4).map((p: any) => p.id));
  }, [allPosts, sortType, currentPage]);

  // 카드에 Best 플래그 부여
  const flagBest = (list: any[]) =>
    list.map((p: any) => ({ ...p, __isBestLocal: Boolean(p?.isBest) || bestIdSet.has(p.id) }));

  // 탭별 표시 목록
  const displayed = useMemo(() => {
    // 인기글: '전체'의 상위 4개만 Best로
    if (selectedCategory === "인기글") {
      const top4 = (allPosts.length ? allPosts : posts).slice(0, 4);
      return top4.map((p: any) => ({ ...p, __isBestLocal: true }));
    }

    // 일반 카테고리(생활꿀팁/꿀템추천/살까말까?/궁금해요!):
    // - API가 제대로 주면 mainData 기준
    // - 혹시 비어오면 '전체' 데이터로 보강(처음 클릭해도 바로 뜨도록)
    if (["생활꿀팁", "꿀템추천", "살까말까?", "궁금해요!"].includes(selectedCategory)) {
      const merged = mergeUniqueById(posts as any[], allPosts as any[]);
      const filtered = merged.filter((p: any) => categorySetOf(p).has(selectedCategory as CategoryType));
      return flagBest(filtered);
    }

    // 전체: mainData에 Best 플래그만 적용
    return flagBest(posts as any[]);
  }, [selectedCategory, posts, allPosts, bestIdSet]);

  // 페이지네이션: 기본은 API 값을 사용.
  // 만약 일반 카테고리인데 API가 빈 결과를 줘서 all로 보강한 경우엔 최소 1페이지 보장.
  const totalPages =
    ["생활꿀팁", "꿀템추천", "살까말까?", "궁금해요!"].includes(selectedCategory) && (posts.length === 0 && displayed.length > 0)
      ? 1
      : totalPagesFromApi;

  return (
    <div className="font-[Pretendard] px-4 md:px-8 py-6 w-full relative z-0">
      {/* 카테고리 탭 */}
      <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
        {UI_CATEGORIES.map((cat) => (
          <div
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentPage(1);
            }}
            className={`cursor-pointer px-3 py-1 md:px-4 md:py-2 rounded-full border text-[12px] md:text-[14px] ${
              selectedCategory === cat ? "border-[#0080FF] text-[#0080FF]" : "border-[#E6E6E6] text-[#999999]"
            }`}
          >
            {cat}
          </div>
        ))}
      </div>

      {/* 정렬 */}
      <div className="flex justify-end mb-7">
        <SortDropdown
          defaultValue={uiToApi(sortType)}
          onChange={(apiValue: CommunitySortType) => {
            setSortType(apiToUi(apiValue));
            setCurrentPage(1);
          }}
        />
      </div>

      {/* 리스트 */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="text-center text-[#999] text-[14px] mt-10">불러오는 중…</div>
        ) : isError ? (
          <div className="text-center text-red-500 text-[14px] mt-10">목록을 불러오지 못했습니다.</div>
        ) : displayed.length === 0 ? (
          <div className="text-center text-[#999] text-[14px] mt-10">게시글이 없습니다.</div>
        ) : (
          displayed.map((item: any, index: number) => {
            const thumb = getThumb(item);
            const hashtags = extractHashtags(item);
            const preview = tidyPreview(item?.content);
            const isBest = Boolean(item.__isBestLocal);
            const badges = badgesFor(item); // '인기글' 배지 X (카테고리들만)

            return (
              <div
                key={`${item.id}-${index}`}
                onClick={() => navigate(`/post/${item.id}`)}
                className="grid grid-cols-[1fr_110px] sm:grid-cols-[1fr_140px] md:grid-cols-[1fr_220px] gap-4 sm:gap-5 md:gap-6 items-start cursor-pointer"
              >
                {/* 좌측 카드 */}
                <div
                  className={`${isBest ? "bg-[#CCE5FF] border-none" : "bg-white border border-[#CCCCCC]"} rounded-[32px] p-4 md:p-6 w-full min-h-[110px] sm:min-h-[140px] md:min-h-[220px]`}
                >
                  {/* 카테고리/Best/해시태그 뱃지들 */}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {badges.map((label) => (
                      <div
                        key={`cat-${label}`}
                        className="flex items-center px-2 py-[2px] md:px-3 md:py-1 border rounded-[32px] text-[10px] md:text-[14px] border-[#999999] text-[#333333]"
                      >
                        {label}
                      </div>
                    ))}

                    {/* Best만 표시(‘인기글’ 배지는 없음) */}
                    {isBest && (
                      <div className="flex items-center px-2 py-[2px] md:px-3 md:py-1 rounded-[32px] text-[10px] md:text-[14px] bg-[#66B2FF] text-white">
                        Best
                      </div>
                    )}

                    {hashtags.map((tag: string, idx: number) => (
                      <div
                        key={`${tag}-${idx}`}
                        className="flex items-center px-2 py-[2px] md:px-3 md:py-1 rounded-[32px] text-[10px] md:text-[14px] bg-[#CCE5FF] text-[#666666]"
                      >
                        #{tag}
                      </div>
                    ))}
                  </div>

                  {/* 제목/본문 미리보기 */}
                  <div className="text-[15px] sm:text-[16px] md:text-[18px] font-medium mb-1 line-clamp-2">
                    {item.title}
                  </div>
                  <div className="text-[12px] sm:text-[13px] md:text-[14px] text-[#666666] line-clamp-2 md:line-clamp-3 whitespace-pre-wrap">
                    {preview}
                  </div>

                  {/* 메타 */}
                  <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-3 text-[12px] md:text-[14px] text-[#999]">
                    <span className="flex items-center gap-1 text-[#333333]">
                      {isBest && <img src={bestBadge} alt="best" className="w-[14px] h-[14px] md:w-[16px] md:h-[16px]" />}
                      {item.nickname} · {formatKST(item.createdAt)}
                    </span>
                    <div className="flex items-center gap-1">
                      <img src={eye} alt="views" className="w-3 h-3 md:w-4 md:h-4" />
                      <span>{(item as any)?.views ?? (item as any)?.viewCount ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <img src={like} alt="likes" className="w-3 h-3 md:w-4 md:h-4" />
                      <span>{(item as any)?.likes ?? (item as any)?.likeCount ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <img src={commentIcon} alt="comments" className="w-3 h-3 md:w-4 md:h-4" />
                      <span>{(item as any)?.comments ?? (item as any)?.commentCount ?? 0}</span>
                    </div>
                  </div>
                </div>

                {/* 우측 썸네일 */}
                <div className="justify-self-end">
                  <div className="w-[110px] h-[110px] sm:w-[140px] sm:h-[140px] md:w-[220px] md:h-[220px] rounded-[32px] overflow-hidden bg-[#E6E6E6]">
                    {thumb ? (
                      <img src={thumb} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#9CA3AF] text-xs sm:text-sm">
                        이미지 없음
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 페이지네이션 */}
      <div className="mt-8">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* 글쓰기 */}
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