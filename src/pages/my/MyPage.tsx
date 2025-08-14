import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { eye, like, commentIcon, bestBadge } from "../../assets";
import useMyPosts from "../../hooks/queries/useMyPosts";
import useMyInquiries from "../../hooks/queries/useMyInquiries";
import useDeleteMyPost from "../../hooks/mutations/useDeleteMyPost";
import useDeleteMyInquiry from "../../hooks/mutations/useDeleteMyInquiry";
import Pagination from "../../components/customer/Pagination";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";
import type {
  InquiryStatus,
  MyPostItem,
  MyInquiryItem,
} from "../../api/mypage";

/* ===== 시간 규칙 ===== */
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

/* ===== 미리보기 정리(커뮤니티와 동일) ===== */
const removeExtraBlock = (text: string) =>
  text.replace(/<!--EXTRA:\{[\s\S]*?\}-->/g, "").trim();
const removeSourceLine = (text: string) => {
  const lines = text.split(/\n+/);
  const idx = [...lines]
    .reverse()
    .findIndex((s) => /^출처\s*[:：]/.test(s.trim()));
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
  return plain
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

/* ===== 카테고리/해시태그 유틸(커뮤니티와 통일) ===== */
const UI_CATEGORIES = [
  "전체",
  "인기글",
  "생활꿀팁",
  "꿀템추천",
  "살까말까?",
  "궁금해요!",
] as const;
type CategoryType = (typeof UI_CATEGORIES)[number];

const API_TO_UI: Record<string, CategoryType> = {
  ALL: "전체",
  BEST: "인기글",
  TIP: "생활꿀팁",
  LIFEHACK: "생활꿀팁",
  LIFE_TIP: "생활꿀팁",
  생활꿀팁: "생활꿀팁",
  RECOMMEND: "꿀템추천",
  ITEM_RECOMMEND: "꿀템추천",
  ITEMRECOMMEND: "꿀템추천",
  ITEM: "꿀템추천",
  GOODS_RECOMMEND: "꿀템추천",
  꿀템추천: "꿀템추천",
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
const NORM = (s: string) => s.replace(/[\s_?!]/g, "").toUpperCase();
const API_TO_UI_NORM: Record<string, CategoryType> = Object.fromEntries(
  Object.entries(API_TO_UI).map(([k, v]) => [NORM(k), v])
);
const toDisplayCategory = (raw?: string): CategoryType => {
  if (!raw) return "전체";
  const key = String(raw).trim();
  const norm = NORM(key);
  if (API_TO_UI_NORM[norm]) return API_TO_UI_NORM[norm];
  const direct = UI_CATEGORIES.find((k) => NORM(k) === norm);
  return (direct as CategoryType) ?? "전체";
};

const extractHashtags = (item: any): string[] => {
  const a = Array.isArray(item?.hashtags) ? item.hashtags : [];
  const b = Array.isArray(item?.hashtagList) ? item.hashtagList : [];
  const c =
    item?.hashtagListDto?.hashtagList
      ?.map((h: any) => h?.content)
      .filter(Boolean) ?? [];
  return Array.from(
    new Set<string>(
      [...a, ...b, ...c]
        .map((t) => (typeof t === "string" ? t : (t?.content ?? "")))
        .filter(Boolean)
    )
  );
};

const categorySetOf = (item: any): Set<CategoryType> => {
  const set = new Set<CategoryType>();
  const primary = toDisplayCategory((item as any)?.category);
  if (primary && primary !== "전체" && primary !== "인기글") set.add(primary);

  const extraSources: (string | undefined)[] = [
    (item as any)?.categoryEn,
    (item as any)?.type,
    (item as any)?.topic,
    (item as any)?.postType,
    (item as any)?.subCategory,
    (item as any)?.category2,
    (item as any)?.tagCategory,
    ...((Array.isArray((item as any)?.categories)
      ? (item as any).categories
      : []) as string[]),
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

const badgesFor = (item: any): CategoryType[] => {
  const set = categorySetOf(item);
  const ORDER: CategoryType[] = [
    "전체",
    "생활꿀팁",
    "꿀템추천",
    "살까말까?",
    "궁금해요!",
  ];
  const primary = toDisplayCategory((item as any)?.category);
  const ordered = new Set<CategoryType>([primary, ...ORDER]);
  return [...ordered].filter((x) => x && (x === primary || set.has(x)));
};

type Tab = "나의 작성내역" | "나의 문의내역";

const statusLabel = (s?: InquiryStatus) =>
  s === "PROCESSED" ? "답변완료" : s === "WAITING" ? "대기중" : s || "대기중";

type DeleteTarget =
  | { kind: "post"; id: number }
  | { kind: "inquiry"; id: number }
  | null;

const MyPage = () => {
  const navigate = useNavigate();

  // 탭 & 페이지네이션
  const [tab, setTab] = useState<Tab>("나의 작성내역");
  const [postPage, setPostPage] = useState(1);
  const [inqPage, setInqPage] = useState(1);
  const pageSize = 6;

  // 계정
  const { data: account } = useMyAccount();

  // 데이터
  const {
    data: postData,
    isLoading: loadingPosts,
    isError: errorPosts,
  } = useMyPosts(postPage, pageSize);

  const {
    data: inqData,
    isLoading: loadingInq,
    isError: errorInq,
  } = useMyInquiries(inqPage, pageSize);
  const posts: MyPostItem[] = Array.isArray(postData?.posts)
    ? postData!.posts
    : [];
  const inquiries: MyInquiryItem[] = Array.isArray(inqData?.inquiries)
    ? inqData!.inquiries
    : [];

  // 삭제
  const deletePostMut = useDeleteMyPost(postPage, pageSize);
  const deleteInqMut = useDeleteMyInquiry(inqPage, pageSize);

  // 모달
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const isDeleteOpen = deleteTarget !== null;

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.kind === "post") {
        await deletePostMut.mutateAsync(deleteTarget.id);
        // 현재 페이지가 비면 한 페이지 앞으로
        if (postData && postData.posts.length === 1 && postPage > 1) {
          setPostPage((p) => p - 1);
        }
      } else {
        await deleteInqMut.mutateAsync(deleteTarget.id);
        if (inqData && inqData.inquiries.length === 1 && inqPage > 1) {
          setInqPage((p) => p - 1);
        }
      }
    } catch (e) {
      console.error(e);
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleteTarget(null);
    }
  };

  // 프로필(현재 탭 기준 우선)
  const profile = useMemo(() => {
    if (tab === "나의 작성내역" && postData) {
      return {
        nickname: postData.nickname,
        email: postData.email,
        profileImageUrl: postData.profileImageUrl,
      };
    }
    if (tab === "나의 문의내역" && inqData) {
      return {
        nickname: inqData.nickname,
        email: inqData.email,
        profileImageUrl: inqData.profileImageUrl,
      };
    }
    return { nickname: "", email: "", profileImageUrl: null as string | null };
  }, [tab, postData, inqData]);

  // 다음 페이지 존재 여부(총 개수 없음 → size 기준)
  const hasNextPosts = !!postData && postData.posts.length === pageSize;
  const hasNextInq = !!inqData && inqData.inquiries.length === pageSize;

  // 총 페이지(임시)
  const postTotalPages = Math.max(1, postPage + (hasNextPosts ? 1 : 0));
  const inqTotalPages = Math.max(1, inqPage + (hasNextInq ? 1 : 0));

  useEffect(() => {
    if (tab === "나의 작성내역") setPostPage(1);
    else setInqPage(1);
  }, [tab]);

  // 문의 아코디언
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const toggleInq = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isLoading = tab === "나의 작성내역" ? loadingPosts : loadingInq;
  const isError = tab === "나의 작성내역" ? errorPosts : errorInq;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-8 font-[Pretendard]">
      {/* 상단 제목 */}
      <h1 className="text-[24px] md:text-[32px] font-bold text-[#333] mb-10">
        마이페이지
      </h1>

      {/* 프로필 */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-[80px] h-[80px] rounded-full bg-[#D9D9D9] overflow-hidden">
          {profile.profileImageUrl && (
            <img
              src={profile.profileImageUrl}
              alt="profile"
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 w-full justify-between">
          <div>
            <p className="text-[18px] sm:text-[20px] font-bold">
              {profile.nickname || "닉네임"}
            </p>
            <p className="text-[14px] text-[#999]">
              {profile.email || "이메일"}
            </p>
          </div>
          <button
            onClick={() => navigate("/myinfo")}
            className="bg-[#0080FF] text-white text-[14px] px-6 py-2 rounded-full font-medium
                       sm:text-[16px] sm:px-[16px] sm:py-[12px] sm:w-[180px] sm:h-[54px] sm:rounded-[32px]"
          >
            계정 관리
          </button>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-3 mb-8">
        {(["나의 작성내역", "나의 문의내역"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setTab(type)}
            className={`text-[14px] sm:text-[16px] font-medium rounded-full px-6 py-3 w-[140px] sm:w-[155px] h-[48px] sm:h-[54px] ${
              tab === type
                ? "bg-[#333333] text-white"
                : "bg-[#F5F5F5] text-[#999]"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* 컨텐츠 */}
      {isLoading ? (
        <div className="py-20 text-center text-[#999]">로딩 중…</div>
      ) : isError ? (
        <div className="py-20 text-center text-[#f00]">
          데이터를 불러오지 못했습니다.
        </div>
      ) : tab === "나의 작성내역" ? (
        // ===== 작성내역 =====

        <div className="flex flex-col gap-6">
          {postData && postData.posts.length === 0 ? (
            <div className="text-center text-[#999] text-[14px] mt-10">
              작성한 게시글이 없습니다.
            </div>
          ) : (
            postData?.posts.map((item: MyPostItem) => (
              <div
                key={item.postId}
                className="relative border border-[#CCCCCC] rounded-[32px] p-6 pr-8 hover:shadow-md transition-all duration-150 cursor-pointer"
                onClick={() => navigate(`/post/${item.postId}`)}
              >
                {/* 수정/삭제 */}
                <div className="absolute top-4 right-4 flex gap-2 text-[14px] text-[#999] z-10">
                  <button
                    className="hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/post/${item.postId}/edit`);
                    }}
                  >
                    수정
                  </button>
                  <span>|</span>
                  <button
                    className="hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget({ kind: "post", id: item.postId });
                    }}
                  >
                    삭제
                  </button>
                </div>

            posts.map((item) => {
              const preview = tidyPreview(item.content);
              const hashtags = extractHashtags(item);
              const badges = badgesFor(item);
              const isBest = Boolean((item as any)?.isBest); // 서버가 주면 표시

              return (
                <div
                  key={item.postId}
                  className={`relative rounded-[32px] p-6 pr-8 hover:shadow-md transition-all duration-150 cursor-pointer ${
                    isBest
                      ? "bg-[#CCE5FF] border-none"
                      : "bg-white border border-[#CCCCCC]"
                  }`}
                  onClick={() => navigate(`/post/${item.postId}`)}
                >
                  {/* 수정/삭제 */}
                  <div className="absolute top-4 right-4 flex gap-2 text-[14px] text-[#999] z-10">
                    <button
                      className="hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/post/${item.postId}/edit`);
                      }}
                    >
                      수정
                    </button>
                    <span>|</span>
                    <button
                      className="hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({ kind: "post", id: item.postId });
                      }}
                    >
                      삭제
                    </button>
                  </div>

                  {/* 카테고리/Best/해시태그 뱃지 */}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {badges.map((label) => (
                      <div
                        key={`cat-${label}`}
                        className="flex items-center px-3 py-1 border rounded-[32px] text-[12px] border-[#999999] text-[#333333]"
                      >
                        {label}
                      </div>
                    ))}
                    {isBest && (
                      <div className="flex items-center px-3 py-1 rounded-[32px] text-[12px] bg-[#66B2FF] text-white">
                        Best
                      </div>
                    )}
                    {hashtags.map((tag, idx) => (
                      <div
                        key={`${tag}-${idx}`}
                        className="flex items-center px-3 py-1 rounded-[32px] text-[12px] bg-[#CCE5FF] text-[#666666]"
                      >
                        #{tag}
                      </div>
                    ))}
                  </div>

                  {/* 제목/본문 */}
                  <div className="mt-1">
                    <div className="text-[18px] sm:text-[20px] font-bold truncate w-full">
                      {item.title}
                    </div>
                    <div className="text-[14px] sm:text-[16px] text-[#666] line-clamp-2 whitespace-pre-wrap">
                      {preview}
                    </div>
                  </div>

                  {/* 메타 */}
                  <div className="flex gap-4 mt-3 text-[#999] text-[14px] flex-wrap">
                    <span className="flex items-center gap-1 text-[#333]">
                      {isBest && (
                        <img
                          src={bestBadge}
                          alt="best"
                          className="w-[16px] h-[16px]"
                        />
                      )}
                      {item.nickname} · {formatKST(item.createdAt)}
                    </span>
                    <div className="flex items-center gap-1">
                      <img src={eye} alt="views" className="w-4 h-4" />
                      {item.viewCount}
                    </div>
                    <div className="flex items-center gap-1">
                      <img src={like} alt="likes" className="w-4 h-4" />
                      {item.likeCount}
                    </div>
                    <div className="flex items-center gap-1">
                      <img
                        src={commentIcon}
                        alt="comments"
                        className="w-4 h-4"
                      />
                      {item.commentCount}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <Pagination
            currentPage={postPage}
            totalPages={Math.max(1, postTotalPages)}
            onPageChange={(p) => setPostPage(p)}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {inqData && inqData.inquiries.length === 0 ? (
            <div className="text-center text-[#999] text-[14px] mt-10">
              문의내역이 없습니다.
            </div>
          ) : (
            inqData?.inquiries.map((q: MyInquiryItem) => {
              const open = expanded.has(q.inquiryId);
              return (
                <div key={q.inquiryId} className="flex flex-col gap-3">
                  {/* 상단 카드 (클릭 토글) */}
                  <div
                    className={`relative border border-[#CCCCCC] rounded-[32px] px-6 py-5 cursor-pointer transition-colors ${
                      open ? "bg-[#E6E6E6]" : "bg-white"
                    }`}
                    onClick={() => toggleInq(q.inquiryId)}
                  >
                    <div className="absolute top-4 right-4 flex gap-2 text-[14px] text-[#999] z-10">
                      <button
                        className="hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/inquiry/${q.inquiryId}/edit`);
                        }}
                      >
                        수정
                      </button>
                      <span>|</span>
                      <button
                        className="hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget({ kind: "inquiry", id: q.inquiryId });
                        }}
                      >
                        삭제
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[12px] border border-[#CCCCCC] text-[#666] rounded-full px-3 py-[4px]">
                        {statusLabel(q.status)}
                      </span>
                    </div>

                    <div className="text-[16px] sm:text-[18px] font-medium">
                      {q.title}
                    </div>
                    <div className="text-[#999] text-[13px] mt-2">
                      {formatKST(q.createdAt)}
                    </div>
                  </div>

                  {/* 펼침 영역: Q/A 블록 */}
                  {open && (
                    <div className="flex flex-col gap-3">
                      <div className="rounded-[24px] border border-[#E6E6E6] bg-white px-5 py-4">
                        <div className="inline-block text-[12px] px-2 py-[2px] rounded-[999px] bg-[#E6E6E6] text-[#444] mb-2">
                          질문
                        </div>
                        <div className="text-[15px] text-[#333] whitespace-pre-wrap">
                          {q.title}
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-[#E6E6E6] bg-white px-5 py-4">
                        <div className="inline-block text-[12px] px-2 py-[2px] rounded-[999px] bg-[#E6E6E6] text-[#444] mb-2">
                          답변
                        </div>
                        <div className="text-[15px] text-[#333] whitespace-pre-wrap">
                          {statusLabel(q.status) === "답변완료"
                            ? "답변이 등록되었습니다. (필요 시 상세 API로 실제 답변 본문을 붙여주세요)"
                            : "아직 답변이 등록되지 않았습니다."}
                        </div>
                        <div className="text-[12px] text-[#999] mt-3">
                          {formatKST(q.createdAt)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          <Pagination
            currentPage={inqPage}
            totalPages={Math.max(1, inqTotalPages)}
            onPageChange={(p) => setInqPage(p)}
          />
        </div>
      )}
      <ConfirmDeleteModal
        open={isDeleteOpen}
        targetType={
          deleteTarget?.kind === "post"
            ? "게시글"
            : deleteTarget?.kind === "inquiry"
              ? "문의"
              : "게시글"
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default MyPage;
