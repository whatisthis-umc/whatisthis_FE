import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import bestBadge from "../assets/best.png";
import heartIcon from "../assets/heart.png";
import reportIcon from "../assets/report.png";
import commentsIcon from "../assets/comments.png";
import commentsIconB from "../assets/comment_black.png";
import likesIcon from "../assets/likes.png";
import reportGrayIcon from "../assets/report_gray.png";
import arrowLeft from "../assets/chevron_backward.svg";
import arrowRight from "../assets/chevron_forward.svg";
import { darkHeart } from "../assets";

import ReportModal from "../components/modals/ReportModal";
import SortDropdown from "../components/common/SortDropdown";

import useGetCommunityDetail from "../hooks/queries/useGetCommunityDetail";
import useCreateComment from "../hooks/queries/useCreateComment";
import { useLikePost, useUnlikePost } from "../hooks/mutations/usePostLike";
import useReportPost from "../hooks/mutations/useReportPost";
import useReportComment from "../hooks/mutations/useReportComment";
import type { CommunitySortType } from "../types/community";

/* ================= 이미지 URL 유틸 (상대경로 → 절대경로) ================= */
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const toAbs = (u?: string) => {
  if (!u) return "";
  if (/^(https?:)?\/\//i.test(u) || u.startsWith("data:")) return u; // 절대/데이터 URL 그대로
  return `${API_BASE}${u.startsWith("/") ? "" : "/"}${u}`; // 상대경로는 API_BASE 붙이기
};

/* ===== 유틸: UI ⇄ API 변환 ===== */
type UISort = "인기순" | "최신순";
const uiToApi = (ui: UISort): CommunitySortType => (ui === "인기순" ? "BEST" : "LATEST");
const apiToUi = (api: CommunitySortType): UISort => (api === "BEST" ? "인기순" : "최신순");

/* ===== 타입 ===== */
type RawComment = {
  id: number;
  content: string;
  nickname: string;
  profileImageUrl?: string;
  createdAt: string;
  likeCount: number;
  commentCount?: number;
  isAuthor?: boolean;
  /** 서버에서 내려주는 부모 id (최상위= null) */
  parentId: number | null;
};

type CommentTree = RawComment & { replies: RawComment[] };

const PostDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const queryClient = useQueryClient();

  // ----- 로컬 UI 상태 -----
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<"댓글" | "게시물">("게시물");
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);

  // 같은 세션에서 재신고 방지(로컬)
  const [reportedPost, setReportedPost] = useState(false);
  const [reportedComments, setReportedComments] = useState<Set<number>>(new Set());

<<<<<<< Updated upstream
  // 댓글 정렬/페이지
  const [sortType, setSortType] = useState<"인기순" | "최신순">("인기순");
=======
  // 댓글 정렬/페이지 (UI 타입)
  const [sortType, setSortType] = useState<UISort>("인기순");
>>>>>>> Stashed changes
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 입력 상태
  const [newComment, setNewComment] = useState(""); // 최상위
  const [isSubmittingTop, setIsSubmittingTop] = useState(false);
  const [openReplyBoxes, setOpenReplyBoxes] = useState<Set<number>>(new Set()); // 열려있는 대댓글 입력창
  const [replyInputs, setReplyInputs] = useState<Record<number, string>>({}); // 각 댓글별 대댓글 입력값

<<<<<<< Updated upstream
  // ----- 서버 데이터 -----
  const apiSort = sortType === "인기순" ? "BEST" : "LATEST";
=======
  // ----- 서버 데이터: 커뮤니티 상세는 /posts/communities/{postId} -----
  const apiSort: CommunitySortType = uiToApi(sortType);
>>>>>>> Stashed changes
  const { data, isLoading, isError } = useGetCommunityDetail({
    postId,
    page: currentPage,
    size: pageSize,
    sort: apiSort,
  });

  // 좋아요/신고 훅
  const createCommentM = useCreateComment(postId);
  const likeM = useLikePost(postId);
  const unlikeM = useUnlikePost(postId);
  const reportPostM = useReportPost(postId);
  const reportCommentM = useReportComment(postId);

  // 좋아요 상태(서버 -> 로컬)
  const likedFromServer = Boolean((data as any)?.liked);
  const likeCountFromServer = Number((data as any)?.likes ?? (data as any)?.likeCount ?? 0);
  const [liked, setLiked] = useState<boolean>(likedFromServer);
  const [likeCount, setLikeCount] = useState<number>(likeCountFromServer);

  useEffect(() => {
    setLiked(likedFromServer);
    setLikeCount(likeCountFromServer);
  }, [likedFromServer, likeCountFromServer]);

  // ✅ 최신 토글만 반영하기 위한 연산 id
  const likeOpRef = useRef(0);

  // detail 안전 기본값
  const detail = data ?? ({} as any);

  /* ================= 이미지/해시태그 추출 ================= */
  const imageUrls: string[] = useMemo(() => {
    const pickFirstArray = (...xs: any[]) =>
      xs.find((v) => Array.isArray(v) && v.length > 0) ?? [];

    // 다양한 응답 포맷 커버
    const rawList = pickFirstArray(
      detail?.imageUrls,
      detail?.imageUrl, // 단수/복수 혼용 대응
      detail?.images,
      detail?.imageList,
      detail?.imageListDto?.imageList,
      detail?.result?.imageUrls,
      detail?.result?.imageUrl,
      detail?.result?.images,
      detail?.result?.imageList,
      detail?.result?.imageListDto?.imageList
    );

    const urls = (Array.isArray(rawList) ? rawList : [rawList])
      .map((it: any) => (typeof it === "string" ? it : it?.url ?? it?.path ?? it?.src))
      .filter(Boolean)
      .map(toAbs);

    return Array.from(new Set(urls));
  }, [detail]);

  const hashtags: string[] =
    detail.hashtags ??
    detail.result?.hashtagListDto?.hashtagList?.map((h: any) => h?.content).filter(Boolean) ??
    [];

  /* ================= 댓글 리스트(부모 키 흡수) ================= */
  const rawList: RawComment[] = useMemo(() => {
    const vNew = detail?.commentListDto?.commentList ?? detail?.result?.commentListDto?.commentList;
    const vOld = detail?.commentPage?.list; // 구버전 호환
    const base = Array.isArray(vNew) ? vNew : Array.isArray(vOld) ? vOld : [];

    return base.map((c: any) => {
      const parentRaw =
        c?.parentId ??
        c?.parentCommentId ??
        c?.parent?.id ??
        c?.parent_id ??
        c?.parent_comment_id ??
        null;

      const parentFixed =
        parentRaw === null || parentRaw === undefined || Number(parentRaw) <= 0
          ? null
          : Number(parentRaw);

      return {
        id: Number(c?.id),
        content: c?.content ?? "",
        nickname: c?.nickname ?? "",
        profileImageUrl: c?.profileImageUrl ?? c?.profileimageUrl ?? c?.profileimageurl,
        createdAt: c?.createdAt ?? "",
        likeCount: Number(c?.likeCount ?? 0),
        commentCount: Number(c?.commentCount ?? 0),
        isAuthor: Boolean(c?.isAuthor),
        parentId: parentFixed,
      } as RawComment;
    });
  }, [detail]);

  /* ================= 1-레벨 트리 구성 ================= */
  const tree: CommentTree[] = useMemo(() => {
    const byParent: Record<string, RawComment[]> = {};
    for (const c of rawList) {
      const key = c.parentId == null ? "root" : String(c.parentId);
      (byParent[key] ??= []).push(c);
    }
    const top = (byParent["root"] ?? []).sort((a, b) => a.id - b.id);
    return top.map((t) => ({
      ...t,
      replies: (byParent[String(t.id)] ?? []).sort((a, b) => a.id - b.id),
    }));
  }, [rawList]);

  const totalPages = useMemo(() => {
    const r = detail?.result ?? detail;
    const total =
      r?.commentListDto?.totalPage ??
      r?.commentPage?.totalPage ??
      1;
    return Math.max(1, Number(total) || 1);
  }, [detail]);

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({
      predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "communityDetail",
      refetchType: "active",
    });
  };

  /* ================= 좋아요 토글 ================= */
  const handleToggleLike = () => {
    const opId = ++likeOpRef.current;
    const nextLiked = !liked;

    setLiked(nextLiked);
    setLikeCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)));

    const action = nextLiked ? likeM : unlikeM;
    action.mutate(undefined, {
      onSuccess: (res: any) => {
        if (likeOpRef.current !== opId) return;
        const serverLiked = typeof res?.liked === "boolean" ? res.liked : nextLiked;
        const serverCount = typeof res?.likeCount === "number" ? res.likeCount : undefined;
        setLiked(serverLiked);
        if (typeof serverCount === "number") setLikeCount(Math.max(0, serverCount));
      },
      onError: () => {
        if (likeOpRef.current !== opId) return;
        setLiked(!nextLiked);
        setLikeCount((c) => Math.max(0, c + (nextLiked ? -1 : 1)));
      },
    });
  };

  /* ================= 댓글 작성 ================= */
  // 최상위 댓글 등록 — 반드시 parentCommentId: null 로!
  const handleSubmitTopComment = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const content = newComment.trim();
    if (!content || isSubmittingTop) return;

<<<<<<< Updated upstream
    createTopCommentM.mutate(
      { content },
      {
        onSuccess: async () => {
          setNewComment("");
          await queryClient.invalidateQueries({
            queryKey: ["communityDetail", postId, currentPage, apiSort],
          });
        },
        onError: (err) => {
          console.error("댓글 작성 실패:", err);
          alert("댓글 작성에 실패했습니다.");
        },
=======
    try {
      setIsSubmittingTop(true);
      await createCommentM.mutateAsync({ content, parentCommentId: null });

      if (sortType !== "최신순") {
        setSortType("최신순");
        setCurrentPage(1);
>>>>>>> Stashed changes
      }
      setNewComment("");
      await invalidateAll();
    } finally {
      setIsSubmittingTop(false);
    }
  };

  // 대댓글 입력창 토글
  const toggleReplyBox = (commentId: number) => {
    setOpenReplyBoxes((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  // 대댓글 등록 — body.parentCommentId = 부모 id
  const submitReply = async (parentId: number) => {
    const content = (replyInputs[parentId] ?? "").trim();
    if (!content) return;

<<<<<<< Updated upstream
    try {
      await createCommentApi(postId, { content, parentCommentId: parentId });
      setReplyInputs((m) => ({ ...m, [parentId]: "" }));
      await queryClient.invalidateQueries({
        queryKey: ["communityDetail", postId, currentPage, apiSort],
      });
    } catch (e: any) {
      console.error("대댓글 작성 실패:", e);
      alert(e?.message ?? "대댓글 작성에 실패했습니다.");
    }
  };

  // 신고 모달 제출
  const handleReportSubmit = (form: { content: string; description: string }) => {
    if (selectedTarget === "게시물") {
      if (reportedPost) {
        alert("이미 이 게시물을 신고하셨습니다.");
        return;
      }
      reportPostM.mutate(
        { content: form.content, description: form.description },
        {
          onSuccess: () => {
            alert("신고가 완료되었습니다.");
            setReportedPost(true);
            setShowReportModal(false);
          },
          onError: (e: any) => {
            console.error("게시물 신고 실패:", e);
            if (e?.status === 409 || e?.code === "ALREADY_REPORTED") {
              alert("이미 신고된 게시물입니다.");
            } else if (e?.status === 500) {
              alert("이미 신고한 게시물이거나 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
            } else {
              alert(e?.message ?? "신고 처리에 실패했습니다.");
            }
          },
        }
      );
    } else {
      if (!selectedCommentId) {
        alert("댓글 정보가 없습니다.");
        return;
      }
      if (reportedComments.has(selectedCommentId)) {
        alert("이미 이 댓글을 신고하셨습니다.");
        return;
      }
      reportCommentM.mutate(
        {
          commentId: selectedCommentId,
          payload: { content: form.content, description: form.description },
        },
        {
          onSuccess: () => {
            alert("신고가 완료되었습니다.");
            setReportedComments((prev) => new Set(prev).add(selectedCommentId));
            setShowReportModal(false);
          },
          onError: (e: any) => {
            console.error("댓글 신고 실패:", e);
            if (e?.status === 409 || e?.code === "ALREADY_REPORTED") {
              alert("이미 신고된 댓글입니다.");
            } else if (e?.status === 500) {
              alert("이미 신고한 댓글이거나 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
            } else {
              alert(e?.message ?? "신고 처리에 실패했습니다.");
            }
          },
        }
      );
=======
    await createCommentM.mutateAsync({ content, parentCommentId: Number(parentId) });

    if (sortType !== "최신순") {
      setSortType("최신순");
      setCurrentPage(1);
>>>>>>> Stashed changes
    }
    setReplyInputs((m) => ({ ...m, [parentId]: "" }));
    await invalidateAll();
  };

  // ----- 가드 -----
  if (!postId) return <div className="p-8">잘못된 접근입니다.</div>;
  if (isLoading) return <div className="p-8">로딩 중…</div>;
  if (isError || !data) return <div className="p-8">게시글을 불러오지 못했습니다.</div>;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-8 font-[Pretendard]">
      {/* 유저 정보 + 게시글 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] rounded-full bg-[#D9D9D9] opacity-80" />
        <div className="flex items-center gap-1">
          {detail.isBestUser && (
            <img src={bestBadge} alt="best badge" className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
          <span className="text-gray-800 font-medium text-sm sm:text-base">
            {detail.nickname ?? detail.result?.nickname}
          </span>
        </div>
        <span className="text-gray-500 text-sm">
          {detail.createdAt ?? detail.result?.createdAt}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-[60px]">
        <div className="bg-[#D9D9D9] rounded-[32px] w-full lg:w-1/2 h-[300px] sm:h-[500px] lg:h-[680px] overflow-hidden flex items-center justify-center">
          {imageUrls.length > 0 ? (
            <img src={imageUrls[0]} alt="post" className="w-full h-full object-cover" />
          ) : (
            <div className="text-[#666]">이미지 없음</div>
          )}
        </div>

        <div className="flex flex-col gap-6 flex-1">
          <h1 className="text-[20px] sm:text-[24px] font-bold leading-snug">
            {detail.title ?? detail.result?.title}
          </h1>
          <p className="text-gray-700 text-[15px] sm:text-[16px] font-medium leading-relaxed whitespace-pre-wrap">
            {detail.content ?? detail.result?.content}
          </p>

          {/* 해시태그 */}
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag: string, i: number) => (
              <span key={i} className="bg-[#CCE5FF] text-[#000] text-xs sm:text-sm rounded-full px-3 py-1">
                #{tag}
              </span>
            ))}
          </div>

          {/* 좋아요, 신고하기 버튼 */}
          <div className="flex justify-between mt-4 flex-wrap gap-4">
            <button
              className="flex items-center gap-2 bg-[#0080FF] text-white font-medium text-sm sm:text-base lg:text-lg px-4 py-2 rounded-full"
              onClick={handleToggleLike}
            >
              <img src={liked ? darkHeart : heartIcon} alt="like" className="w-4 h-4" />
              좋아요 {likeCount}
            </button>
            <button
              onClick={() => {
                setSelectedTarget("게시물");
                setShowReportModal(true);
              }}
              className="flex items-center gap-2 bg-[#0080FF] text-white font-medium text-sm sm:text-base lg:text-lg px-4 py-2 rounded-full"
            >
              <img src={reportIcon} alt="report" className="w-4 h-4" />
              신고하기
            </button>
          </div>
        </div>
      </div>

      {/* ===== 댓글 섹션 ===== */}
      <div className="w-full mt-24">
        {/* 헤더 */}
        <div className="w-full grid grid-cols-[1fr_auto] items-center mb-4 gap-3">
          <div className="flex items-center gap-2 text-[20px] font-bold">
            <img src={commentsIconB} alt="comments" className="w-5 h-5" />
            댓글 {detail.comments ?? detail.commentCount ?? detail.result?.commentCount ?? 0}
          </div>
          <div className="justify-self-end">
<<<<<<< Updated upstream
            <SortDropdown defaultValue={sortType} onChange={(v: any) => setSortType(v)} />
=======
            <SortDropdown
              defaultValue={uiToApi(sortType)}
              onChange={(apiVal: CommunitySortType) => {
                setSortType(apiToUi(apiVal));
                setCurrentPage(1);
              }}
            />
>>>>>>> Stashed changes
          </div>
        </div>

        {/* 입력줄 (최상위 댓글) */}
        <form
          onSubmit={handleSubmitTopComment}
          className="w-full grid grid-cols-[1fr_auto] items-center gap-3 mb-8"
        >
          <div className="w-full bg-[#E6E6E6] rounded-[32px] h-[60px] sm:h-[72px] px-5 sm:px-6 flex items-center">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력해주세요."
              className="w-full bg-transparent outline-none text-[16px] sm:text-[20px] leading-[150%] tracking-[-0.02em] placeholder:text-[#6B7280]"
              aria-label="댓글 입력"
            />
          </div>
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmittingTop || createCommentM.isPending}
            className="justify-self-end
                       w-[84px] h-[44px] rounded-[28px] px-3 py-2 text-[16px]
                       sm:w-[98px] sm:h-[54px] sm:rounded-[32px] sm:px-4 sm:py-3 sm:text-[20px]
                       bg-[#0080FF] text-white font-medium leading-[150%] tracking-[-0.02em]
                       whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmittingTop || createCommentM.isPending ? "등록중…" : "입력"}
          </button>
        </form>

        {/* 댓글 트리 */}
        <div className="w-full flex flex-col gap-10">
          {tree.map((c) => (
            <div key={c.id} className="flex flex-col gap-2">
              {/* 최상위 댓글 */}
              <div className="flex justify-between">
                <div className="flex gap-4 items-start">
                  <div className="w-[40px] h-[40px] rounded-full bg-[#D9D9D9] flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-[16px] font-medium">{c.nickname}</span>
                      {c.isAuthor && (
                        <span className="px-2 py-[2px] text-[12px] border border-[#ccc] rounded-full">작성자</span>
                      )}
                    </div>
                    <div className="text-[14px] mt-1 whitespace-pre-wrap">{c.content}</div>

                    {/* 메타(시간/좋아요/대댓글 수/토글) */}
                    <div className="flex items-center gap-4 mt-1 text-sm text-[#999]">
                      <span>{c.createdAt}</span>

                      <div className="flex text-[14px] items-center gap-1">
                        <img src={likesIcon} alt="likes" className="w-4 h-4" />
                        {c.likeCount}
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleReplyBox(c.id)}
                        className="flex text-[14px] items-center gap-1"
                        aria-label="대댓글 입력창 토글"
                        title="대댓글 입력창 토글"
                      >
                        <img src={commentsIcon} alt="reply" className="w-4 h-4" />
                        {c.replies?.length ?? 0}
                      </button>
                    </div>

                    {/* 대댓글 입력칸 */}
                    {openReplyBoxes.has(c.id) && (
                      <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-5 w-full sm:w-[1240px] opacity-100">
                        <div className="bg-[#E6E6E6] rounded-[32px] h-[120px] px-6 py-4 flex items-center">
                          <textarea
                            value={replyInputs[c.id] ?? ""}
                            onChange={(e) =>
                              setReplyInputs((m) => ({ ...m, [c.id]: e.target.value }))
                            }
                            placeholder="댓글을 입력해주세요."
                            className="w-full h-full bg-transparent outline-none text-[16px] leading-[150%] tracking-[-0.02em] placeholder:text-[#6B7280] resize-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => submitReply(c.id)}
                          disabled={!(replyInputs[c.id] ?? "").trim() || createCommentM.isPending}
                          className="justify-self-end w-[84px] h-[44px] rounded-[28px] px-3 py-2 text-[16px]
                                     sm:w-[98px] sm:h-[54px] sm:rounded-[32px] sm:px-4 sm:py-3 sm:text-[20px]
                                     bg-[#0080FF] text-white font-medium leading-[150%] tracking-[-0.02em]
                                     whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          입력
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <img
                  src={reportGrayIcon}
                  alt="report"
                  className="w-4 h-4 cursor-pointer"
                  onClick={() => {
                    setSelectedTarget("댓글");
                    setSelectedCommentId(c.id);
                    setShowReportModal(true);
                  }}
                />
              </div>

              {/* 대댓글 리스트 */}
              {c.replies.length > 0 && (
                <div className="mt-3 ml-12 flex flex-col gap-4">
                  {c.replies.map((r) => (
                    <div key={r.id} className="flex justify-between">
                      <div className="flex gap-4 items-start">
                        <div className="w-[32px] h-[32px] rounded-full bg-[#D9D9D9] flex-shrink-0" />
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-[15px] font-medium">{r.nickname}</span>
                            {r.isAuthor && (
                              <span className="px-2 py-[2px] text-[11px] border border-[#ccc] rounded-full">
                                작성자
                              </span>
                            )}
                          </div>
                          <div className="text-[14px] mt-1 whitespace-pre-wrap">{r.content}</div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-[#999]">
                            <span>{r.createdAt}</span>
                            <div className="flex text-[14px] items-center gap-1">
                              <img src={likesIcon} alt="likes" className="w-4 h-4" />
                              {r.likeCount}
                            </div>
                          </div>
                        </div>
                      </div>

                      <img
                        src={reportGrayIcon}
                        alt="report"
                        className="w-4 h-4 cursor-pointer"
                        onClick={() => {
                          setSelectedTarget("댓글");
                          setSelectedCommentId(r.id);
                          setShowReportModal(true);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 페이지네이션 */}
        <div className="w-full flex justify-center mt-10 gap-4 items-center">
          <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} aria-label="이전 페이지">
            <img src={arrowLeft} alt="prev" className="w-6 h-6" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`text-sm ${currentPage === page ? "text-[#333] font-bold" : "text-[#999]"}`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            aria-label="다음 페이지"
          >
            <img src={arrowRight} alt="next" className="w-6 h-6" />
          </button>
        </div>
      </div>

      {showReportModal && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          targetType={selectedTarget}
          onSubmit={(form) => {
            // 신고 로직은 기존 훅 사용
            if (selectedTarget === "게시물") {
              if (reportedPost) return alert("이미 신고하셨습니다.");
              reportPostM.mutate(
                { content: form.content, description: form.description },
                {
                  onSuccess: () => {
                    alert("신고가 완료되었습니다.");
                    setReportedPost(true);
                    setShowReportModal(false);
                  },
                }
              );
            } else if (selectedCommentId) {
              if (reportedComments.has(selectedCommentId)) return alert("이미 신고한 댓글입니다.");
              reportCommentM.mutate(
                { commentId: selectedCommentId, payload: form },
                {
                  onSuccess: () => {
                    alert("신고가 완료되었습니다.");
                    setReportedComments((s) => new Set(s).add(selectedCommentId));
                    setShowReportModal(false);
                  },
                }
              );
            }
          }}
        />
      )}
    </div>
  );
};

export default PostDetailPage;