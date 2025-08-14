import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import bestBadge from "../assets/best.png";
import { likes } from "../assets"; // 흰 하트 (게시물 좋아요 버튼 아이콘)
import heartIcon from "../assets/emptyHeart.png"; // 빈 하트 (댓글)
import reportIcon from "../assets/report.png";
import commentsIcon from "../assets/comments.png";
import commentsIconB from "../assets/comment_black.png";
import reportGrayIcon from "../assets/report_gray.png";
import arrowLeft from "../assets/chevron_backward.svg";
import arrowRight from "../assets/chevron_forward.svg";
import { darkHeart } from "../assets"; // 채워진 하트 (댓글)

import ReportModal from "../components/modals/ReportModal";
import SortDropdown from "../components/common/SortDropdown";

import useGetCommunityDetail from "../hooks/queries/useGetCommunityDetail";
import useCreateComment from "../hooks/queries/useCreateComment";
import { useLikePost, useUnlikePost } from "../hooks/mutations/usePostLike";
import useReportPost from "../hooks/mutations/useReportPost";
import useReportComment from "../hooks/mutations/useReportComment";
import {
  useLikeComment,
  useUnlikeComment,
} from "../hooks/mutations/useCommentLike";
import {
  useUpdateComment,
  useDeleteComment,
} from "../hooks/mutations/useCommentEditDelete";
import {
  useEditPost,
  useDeletePost,
} from "../hooks/mutations/usePostEditDelete";

import type { CommunitySortType } from "../types/community";

/* ============ 공용 유틸 ============ */
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

const toAbs = (u?: string) => {
  if (!u) return "";
  if (/^(https?:)?\/\//i.test(u) || u.startsWith("data:")) return u;
  return `${API_BASE}${u.startsWith("/") ? "" : "/"}${u}`;
};

type UISort = "인기순" | "최신순";
const uiToApi = (ui: UISort): CommunitySortType =>
  ui === "인기순" ? "BEST" : "LATEST";
const apiToUi = (api: CommunitySortType): UISort =>
  api === "BEST" ? "인기순" : "최신순";

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

/* content 내 <!--EXTRA:{...}--> 및 우회 파서(출처 라인) */
function parseExtraFromContent(raw?: string): {
  content: string;
  features: string[];
  source: string;
} {
  const text = String(raw ?? "");
  const m = text.match(/<!--EXTRA:(\{[\s\S]*?\})-->/);
  if (m) {
    try {
      const extra = JSON.parse(m[1]);
      const cleaned = text.replace(m[0], "").trim();
      const features: string[] = Array.isArray(extra?.features)
        ? extra.features.filter(Boolean)
        : [];
      const source: string =
        typeof extra?.source === "string" ? extra.source : "";
      return { content: cleaned, features, source };
    } catch {
      /* fallthrough */
    }
  }
  // 후방: 본문 내 '출처:' 라인 파싱
  const srcLine = text
    .split(/\n+/)
    .map((s) => s.trim())
    .reverse()
    .find((s) => /^출처\s*[:：]/.test(s));
  const src = srcLine ? srcLine.replace(/^출처\s*[:：]\s*/, "").trim() : "";
  return {
    content: text.replace(srcLine ?? "", "").trim(),
    features: [],
    source: src,
  };
}

/* 이미지/해시태그/댓글 안전 추출 */
const pickFirstArray = (...xs: any[]) =>
  xs.find((v) => Array.isArray(v) && v.length > 0) ?? [];

const extractImages = (detail: any): string[] => {
  const rawList = pickFirstArray(
    detail?.imageUrls,
    detail?.imageUrl,
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
    .map((it: any) =>
      typeof it === "string" ? it : (it?.url ?? it?.path ?? it?.src)
    )
    .filter(Boolean)
    .map(toAbs);
  return Array.from(new Set(urls));
};

const extractHashtags = (detail: any): string[] => {
  const fromTop = Array.isArray(detail?.hashtags) ? detail.hashtags : [];
  const fromResult = Array.isArray(detail?.result?.hashtags)
    ? detail.result.hashtags
    : [];
  const fromDto =
    detail?.result?.hashtagListDto?.hashtagList
      ?.map((h: any) => h?.content)
      .filter(Boolean) ?? [];
  const fromDto2 =
    detail?.hashtagListDto?.hashtagList
      ?.map((h: any) => h?.content)
      .filter(Boolean) ?? [];
  const fromList = Array.isArray(detail?.hashtagList)
    ? detail.hashtagList.map((h: any) => h?.content ?? h).filter(Boolean)
    : [];
  return Array.from(
    new Set<string>([
      ...fromTop,
      ...fromResult,
      ...fromDto,
      ...fromDto2,
      ...fromList,
    ])
  );
};

type RawComment = {
  id: number;
  content: string;
  nickname: string;
  profileImageUrl?: string;
  createdAt: string;
  likeCount: number;
  commentCount?: number;
  isAuthor?: boolean;
  isMine?: boolean;
  parentId: number | null;
  liked?: boolean;
};

const extractCommentsFlat = (
  detail: any,
  postNickname: string,
  myNickname: string
): RawComment[] => {
  const vNew =
    detail?.commentListDto?.commentList ??
    detail?.result?.commentListDto?.commentList;
  const vOld = detail?.commentPage?.list;
  const base: any[] = Array.isArray(vNew)
    ? vNew
    : Array.isArray(vOld)
    ? vOld
    : [];
  return base.map((c) => {
    const parentRaw =
      c?.parentId ??
      c?.parentCommentId ??
      c?.parent?.id ??
      c?.parent_id ??
      c?.parent_comment_id ??
      null;
    const parentId =
      parentRaw == null || Number(parentRaw) <= 0 ? null : Number(parentRaw);
    const nickname = c?.nickname ?? "";
    const isAuthor = c?.isAuthor ?? nickname === postNickname;
    const isMine = c?.isMine ?? (myNickname && nickname === myNickname);
    return {
      id: Number(c?.id),
      content: c?.content ?? "",
      nickname,
      profileImageUrl:
        c?.profileImageUrl ?? c?.profileimageUrl ?? c?.profileimageurl,
      createdAt: c?.createdAt ?? "",
      likeCount: Number(c?.likeCount ?? 0),
      commentCount: Number(c?.commentCount ?? 0),
      isAuthor,
      isMine,
      parentId,
      liked: Boolean(c?.liked ?? false),
    } as RawComment;
  });
};

type CommentTree = RawComment & { replies: RawComment[] };
const buildTree = (flat: RawComment[]): CommentTree[] => {
  const byParent: Record<string, RawComment[]> = {};
  for (const c of flat) {
    const key = c.parentId == null ? "root" : String(c.parentId);
    (byParent[key] ??= []).push(c);
  }
  const top = (byParent["root"] ?? []).sort((a, b) => a.id - b.id);
  return top.map((t) => ({
    ...t,
    replies: (byParent[String(t.id)] ?? []).sort((a, b) => a.id - b.id),
  }));
};

/* ============ 컴포넌트 ============ */
const PostDetailPage = () => {
  const navigate = useNavigate();

  // ✅ 라우트 파라미터 이름을 postId로 통일 (/post/:postId)
  const { postId: postIdParam } = useParams<{ postId: string }>();
  const postIdNum = Number(postIdParam);
  const safePostId = Number.isFinite(postIdNum) && postIdNum > 0 ? postIdNum : -1;

  const queryClient = useQueryClient();

  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<"댓글" | "게시물">("게시물");
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
  const [reportedPost, setReportedPost] = useState(false);
  const [reportedComments, setReportedComments] = useState<Set<number>>(new Set());

  const [sortType, setSortType] = useState<UISort>("인기순");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [newComment, setNewComment] = useState("");
  const [isSubmittingTop, setIsSubmittingTop] = useState(false);
  const [openReplyBoxes, setOpenReplyBoxes] = useState<Set<number>>(new Set());
  const [replyInputs, setReplyInputs] = useState<Record<number, string>>({});

  const apiSort = uiToApi(sortType);
  const { data, isLoading, isError } = useGetCommunityDetail({
    postId: safePostId,
    page: currentPage,
    size: pageSize,
    sort: apiSort,
  });

  const createCommentM = useCreateComment(safePostId);
  const likePostM = useLikePost(safePostId);
  const unlikePostM = useUnlikePost(safePostId);
  const reportPostM = useReportPost(safePostId);
  const reportCommentM = useReportComment(safePostId);
  const likeCommentM = useLikeComment(safePostId);
  const unlikeCommentM = useUnlikeComment(safePostId);
  const updateCommentM = useUpdateComment(safePostId);
  const deleteCommentM = useDeleteComment(safePostId);
  const editPostM = useEditPost(safePostId);
  const deletePostM = useDeletePost(safePostId);

  const likedFromServer = Boolean((data as any)?.liked);
  const likeCountFromServer = Number(
    (data as any)?.likes ?? (data as any)?.likeCount ?? 0
  );
  const [liked, setLiked] = useState<boolean>(likedFromServer);
  const [likeCount, setLikeCount] = useState<number>(likeCountFromServer);

  useEffect(() => {
    setLiked(likedFromServer);
    setLikeCount(likeCountFromServer);
  }, [likedFromServer, likeCountFromServer]);

  const likeOpRef = useRef(0);

  const detail: any = data ?? {};
  const postNickname = detail.nickname ?? detail.result?.nickname ?? "";
  const myNickname =
    localStorage.getItem("nickname") ||
    localStorage.getItem("userNickname") ||
    "";
  const isMyPost = !!myNickname && myNickname === postNickname;

  // 본문/EXTRA
  const rawContent = detail.content ?? detail.result?.content ?? "";
  const {
    content: displayContent,
    features,
    source: srcFromExtra,
  } = useMemo(() => parseExtraFromContent(rawContent), [rawContent]);

  // 출처 필드도 탐색
  const source =
    srcFromExtra ||
    detail?.source ||
    detail?.result?.source ||
    detail?.reference ||
    detail?.result?.reference ||
    detail?.origin ||
    detail?.result?.origin ||
    "";

  const imageUrls = useMemo(() => extractImages(detail), [detail]);
  const hashtags = useMemo(() => extractHashtags(detail), [detail]);

  // 댓글 트리
  const flatComments = useMemo(
    () => extractCommentsFlat(detail, postNickname, myNickname),
    [detail, postNickname, myNickname]
  );
  const tree = useMemo(() => buildTree(flatComments), [flatComments]);

  const totalPages = useMemo(() => {
    const r = detail?.result ?? detail;
    const total =
      r?.commentListDto?.totalPage ?? r?.commentPage?.totalPage ?? 1;
    return Math.max(1, Number(total) || 1);
  }, [detail]);

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({
      predicate: (q) =>
        Array.isArray(q.queryKey) && q.queryKey[0] === "communityDetail",
      refetchType: "active",
    });
  };

  /* ===== 게시물 좋아요 (게시물) ===== */
  const handleToggleLike = () => {
    if (safePostId <= 0) return;
    const opId = ++likeOpRef.current;
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)));

    (nextLiked ? likePostM : unlikePostM).mutate(undefined, {
      onSuccess: (res: any) => {
        if (likeOpRef.current !== opId) return;
        const serverLiked =
          typeof res?.liked === "boolean" ? res.liked : nextLiked;
        const serverCount =
          typeof res?.likeCount === "number" ? res.likeCount : undefined;
        setLiked(serverLiked);
        if (typeof serverCount === "number")
          setLikeCount(Math.max(0, serverCount));
      },
      onError: () => {
        if (likeOpRef.current !== opId) return;
        setLiked(!nextLiked);
        setLikeCount((c) => Math.max(0, c + (nextLiked ? -1 : 1)));
      },
    });
  };

  /* ===== 댓글 작성/대댓글 ===== */
  const handleSubmitTopComment = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (safePostId <= 0) return;
    const content = newComment.trim();
    if (!content || isSubmittingTop) return;
    try {
      setIsSubmittingTop(true);
      await createCommentM.mutateAsync({ content, parentCommentId: null });
      if (sortType !== "최신순") {
        setSortType("최신순");
        setCurrentPage(1);
      }
      setNewComment("");
      await invalidateAll();
    } finally {
      setIsSubmittingTop(false);
    }
  };

  const toggleReplyBox = (commentId: number) => {
    setOpenReplyBoxes((prev) => {
      const next = new Set(prev);
      next.has(commentId) ? next.delete(commentId) : next.add(commentId);
      return next;
    });
  };

  const submitReply = async (parentId: number) => {
    if (safePostId <= 0) return;
    const content = (replyInputs[parentId] ?? "").trim();
    if (!content) return;
    await createCommentM.mutateAsync({
      content,
      parentCommentId: Number(parentId),
    });
    if (sortType !== "최신순") {
      setSortType("최신순");
      setCurrentPage(1);
    }
    setReplyInputs((m) => ({ ...m, [parentId]: "" }));
    await invalidateAll();
  };

  /* ===== 댓글 좋아요: 즉시 반영(optimistic) + 실패 시 원복 ===== */
  type LikeState = { liked: boolean; likeCount: number };
  const [commentLikeState, setCommentLikeState] = useState<
    Record<number, LikeState>
  >({});
  const [commentLikePending, setCommentLikePending] = useState<
    Record<number, boolean>
  >({});

  const getEffectiveLikeState = (c: RawComment): LikeState => {
    // 로컬 상태가 있으면 우선, 없으면 서버 값 사용
    return commentLikeState[c.id] ?? { liked: !!c.liked, likeCount: c.likeCount };
  };

  const toggleCommentLike = (
    e: React.MouseEvent<HTMLButtonElement>,
    c: RawComment
  ) => {
    e.stopPropagation();
    if (safePostId <= 0) return;
    if (commentLikePending[c.id]) return; // 요청 중엔 막기

    const current = getEffectiveLikeState(c);
    const nextLiked = !current.liked;
    const nextCount = Math.max(0, current.likeCount + (nextLiked ? 1 : -1));

    // 1) UI 즉시 반영
    setCommentLikeState((m) => ({ ...m, [c.id]: { liked: nextLiked, likeCount: nextCount } }));
    setCommentLikePending((m) => ({ ...m, [c.id]: true }));

    // 2) 서버 요청
    const mutate = nextLiked ? likeCommentM : unlikeCommentM;
    mutate.mutate(c.id, {
      onSuccess: (res: any) => {
        // 서버가 카운트/상태를 내려주는 경우 동기화 (없으면 그대로 둠)
        const serverLiked = typeof res?.liked === "boolean" ? res.liked : undefined;
        const serverCount = typeof res?.likeCount === "number" ? res.likeCount : undefined;
        if (serverLiked !== undefined || serverCount !== undefined) {
          setCommentLikeState((m) => ({
            ...m,
            [c.id]: {
              liked: serverLiked ?? nextLiked,
              likeCount: serverCount ?? nextCount,
            },
          }));
        }
        // 필요 시 배경 refetch (UI는 이미 반영됨)
        queryClient.invalidateQueries({
          predicate: (q) =>
            Array.isArray(q.queryKey) && q.queryKey[0] === "communityDetail",
          refetchType: "inactive",
        });
      },
      onError: () => {
        // 실패하면 원복
        setCommentLikeState((m) => ({
          ...m,
          [c.id]: { liked: current.liked, likeCount: current.likeCount },
        }));
        alert("댓글 좋아요 처리에 실패했어요.");
      },
      onSettled: () => {
        setCommentLikePending((m) => ({ ...m, [c.id]: false }));
      },
    });
  };

  /* ===== 댓글 수정/삭제 ===== */
  const [editing, setEditing] = useState<Record<number, boolean>>({});
  const [editInputs, setEditInputs] = useState<Record<number, string>>({});
  const beginEdit = (c: RawComment) => {
    setEditing((m) => ({ ...m, [c.id]: true }));
    setEditInputs((m) => ({ ...m, [c.id]: c.content }));
  };
  const cancelEdit = (commentId: number) => {
    setEditing((m) => ({ ...m, [commentId]: false }));
    setEditInputs(({ [commentId]: _, ...rest }) => rest);
  };
  const saveEdit = async (commentId: number) => {
    if (safePostId <= 0) return;
    const content = (editInputs[commentId] ?? "").trim();
    if (!content) return;
    await updateCommentM.mutateAsync({ commentId, content });
    cancelEdit(commentId);
    await invalidateAll();
  };
  const handleDeleteComment = async (commentId: number) => {
    if (safePostId <= 0) return;
    if (!confirm("이 댓글을 삭제할까요?")) return;
    await deleteCommentM.mutateAsync(commentId);
    await invalidateAll();
  };

  /* 게시물 수정/삭제 */
  const handleEditPost = () => {
    if (safePostId <= 0) return;
    navigate(`/post/${safePostId}/edit`);
  };
  const handleDeletePost = async () => {
    if (safePostId <= 0) return;
    if (!confirm("게시글을 삭제할까요?")) return;
    await deletePostM.mutateAsync();
    alert("삭제되었습니다.");
    navigate("/community");
  };

  // ===== 가드 =====
  if (safePostId <= 0)
    return <div className="p-8">잘못된 게시글 ID입니다.</div>;
  if (isLoading) return <div className="p-8">로딩 중…</div>;
  if (isError || !data)
    return <div className="p-8">게시글을 불러오지 못했습니다.</div>;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-8 font-[Pretendard]">
      {/* 작성자/메타 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] rounded-full bg-[#D9D9D9] opacity-80" />
        <div className="flex items-center gap-1">
          {detail.isBestUser && (
            <img
              src={bestBadge}
              alt="best badge"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
          )}
          <span className="text-gray-800 font-medium text-sm sm:text-base">
            {detail.nickname ?? detail.result?.nickname}
          </span>
        </div>
        <span className="text-gray-500 text-sm">
          {formatKST(detail.createdAt ?? detail.result?.createdAt)}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-[60px]">
        {/* 이미지 */}
        <div className="bg-[#D9D9D9] rounded-[32px] w-full lg:w-1/2 h-[300px] sm:h-[500px] lg:h-[680px] overflow-hidden flex items-center justify-center">
          {imageUrls.length ? (
            <img
              src={imageUrls[0]}
              alt="post"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-[#666]">이미지 없음</div>
          )}
        </div>

        {/* 본문 */}
        <div className="flex flex-col gap-6 flex-1">
          <h1 className="text-[20px] sm:text-[24px] font-bold leading-snug">
            {detail.title ?? detail.result?.title}
          </h1>

          <p className="text-gray-700 text-[15px] sm:text-[16px] font-medium leading-relaxed whitespace-pre-wrap">
            {displayContent}
          </p>

          {/* 주요 특징 */}
          {features.length > 0 && (
            <div className="border border-[#E6E6E6] rounded-[32px] px-[24px] py-[24px] text-[#333] text-[16px] leading-[2] whitespace-pre-wrap">
              <div className="font-bold mb-2">주요 특징</div>
              {features.map((f, i) => (
                <div key={i}>
                  특징 {i + 1}. {f}
                </div>
              ))}
            </div>
          )}

          {/* 출처 */}
          {source && (
            <div className="border border-[#E6E6E6] rounded-[32px] px-[24px] py-[24px] h-[72px] flex items-center">
              <label className="text-[#333] font-medium mr-4 min-w-[40px]">
                출처
              </label>
              <div className="w-full text-[16px] break-all">{source}</div>
            </div>
          )}

          {/* 해시태그 */}
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag, i) => (
              <span
                key={`${tag}-${i}`}
                className="bg-[#CCE5FF] text-[#000] text-xs sm:text-sm rounded-full px-3 py-1"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* 좋아요/신고 (+내 글이면 수정/삭제) */}
          <div className="flex justify-between mt-4 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 bg-[#0080FF] text-white font-medium text-sm sm:text-base lg:text-lg px-4 py-2 rounded-full"
                onClick={handleToggleLike}
              >
                <img src={likes} alt="like" className="w-4 h-4" />
                좋아요 {likeCount}
              </button>

              {isMyPost && (
                <>
                  <button
                    onClick={handleEditPost}
                    className="flex items-center gap-2 border border-[#0080FF] text-[#0080FF] font-medium text-sm sm:text-base lg:text-lg px-4 py-2 rounded-full"
                    title="게시글 수정"
                  >
                    수정
                  </button>
                  <button
                    onClick={handleDeletePost}
                    className="flex items-center gap-2 border border-red-400 text-red-500 font-medium text-sm sm:text-base lg:text-lg px-4 py-2 rounded-full"
                    title="게시글 삭제"
                  >
                    삭제
                  </button>
                </>
              )}
            </div>

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
            댓글{" "}
            {detail.comments ??
              detail.commentCount ??
              detail.result?.commentCount ??
              0}
          </div>
          <div className="justify-self-end">
            <SortDropdown
              defaultValue={uiToApi(sortType)}
              onChange={(apiVal: CommunitySortType) => {
                setSortType(apiToUi(apiVal));
                setCurrentPage(1);
              }}
            />
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
            disabled={
              !newComment.trim() || isSubmittingTop || createCommentM.isPending
            }
            className="justify-self-end w-[84px] h-[44px] rounded-[28px] px-3 py-2 text-[16px]
                       sm:w-[98px] sm:h-[54px] sm:rounded-[32px] sm:px-4 sm:py-3 sm:text-[20px]
                       bg-[#0080FF] text-white font-medium leading-[150%] tracking-[-0.02em]
                       whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmittingTop || createCommentM.isPending ? "등록중…" : "입력"}
          </button>
        </form>

        {/* 댓글 트리 */}
        <div className="w-full flex flex-col gap-10">
          {tree.map((c) => {
            const eff = getEffectiveLikeState(c);
            const isLiked = eff.liked;
            const likeCountDisplay = eff.likeCount;

            return (
              <div key={c.id} className="flex flex-col gap-2">
                {/* 최상위 댓글 */}
                <div className="flex justify-between">
                  <div className="flex gap-4 items-start">
                    <div className="w-[40px] h-[40px] rounded-full bg-[#D9D9D9] flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[16px] font-medium">
                          {c.nickname}
                        </span>
                        {c.isAuthor && (
                          <span className="px-2 py-[2px] text-[12px] border border-[#ccc] rounded-full">
                            작성자
                          </span>
                        )}
                      </div>

                      {!editing[c.id] ? (
                        <div className="text-[14px] mt-1 whitespace-pre-wrap break-words">
                          {c.content}
                        </div>
                      ) : (
                        <div className="mt-2">
                          <textarea
                            value={editInputs[c.id] ?? ""}
                            onChange={(e) =>
                              setEditInputs((m) => ({
                                ...m,
                                [c.id]: e.target.value,
                              }))
                            }
                            className="w-full min-h-[80px] bg-transparent outline-none text-[14px] border border-[#E6E6E6] rounded-[16px] p-3"
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => saveEdit(c.id)}
                              className="px-3 py-1 rounded-full bg-[#0080FF] text-white text-sm"
                            >
                              저장
                            </button>
                            <button
                              type="button"
                              onClick={() => cancelEdit(c.id)}
                              className="px-3 py-1 rounded-full border text-sm"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-1 text-sm text-[#999]">
                        <span>{formatKST(c.createdAt)}</span>

                        <button
                          type="button"
                          onClick={(e) => toggleCommentLike(e, c)}
                          className="flex text-[14px] items-center gap-1"
                          title={isLiked ? "좋아요 취소" : "좋아요"}
                          disabled={!!commentLikePending[c.id]}
                        >
                          <img
                            src={isLiked ? darkHeart : heartIcon}
                            alt="comment-like"
                            className="w-4 h-4"
                          />
                          {likeCountDisplay}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleReplyBox(c.id)}
                          className="flex text-[14px] items-center gap-1"
                          aria-label="대댓글 입력창 토글"
                          title="대댓글 입력창 토글"
                        >
                          <img
                            src={commentsIcon}
                            alt="reply"
                            className="w-4 h-4"
                          />
                          {c.replies?.length ?? 0}
                        </button>

                        {c.isMine && !editing[c.id] && (
                          <>
                            <button
                              type="button"
                              onClick={() => beginEdit(c)}
                              className="text-[13px] underline"
                              title="댓글 수정"
                            >
                              수정
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(c.id)}
                              className="text-[13px] underline text-red-500"
                              title="댓글 삭제"
                            >
                              삭제
                            </button>
                          </>
                        )}
                      </div>

                      {/* 대댓글 입력칸 */}
                      {openReplyBoxes.has(c.id) && (
                        <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-5 w-full sm:w-[1240px] opacity-100">
                          <div className="bg-[#E6E6E6] rounded-[32px] h-[120px] px-6 py-4 flex items-center">
                            <textarea
                              value={replyInputs[c.id] ?? ""}
                              onChange={(e) =>
                                setReplyInputs((m) => ({
                                  ...m,
                                  [c.id]: e.target.value,
                                }))
                              }
                              placeholder="댓글을 입력해주세요."
                              className="w-full h-full bg-transparent outline-none text-[16px] leading-[150%] tracking-[-0.02em] placeholder:text-[#6B7280] resize-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => submitReply(c.id)}
                            disabled={
                              !(replyInputs[c.id] ?? "").trim() ||
                              createCommentM.isPending
                            }
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
                    {c.replies.map((r) => {
                      const rEff = getEffectiveLikeState(r);
                      const rIsLiked = rEff.liked;
                      const rLikeCountDisplay = rEff.likeCount;

                      return (
                        <div key={r.id} className="flex justify-between">
                          <div className="flex gap-4 items-start">
                            <div className="w-[32px] h-[32px] rounded-full bg-[#D9D9D9] flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[15px] font-medium">
                                  {r.nickname}
                                </span>
                                {r.isAuthor && (
                                  <span className="px-2 py-[2px] text-[11px] border border-[#ccc] rounded-full">
                                    작성자
                                  </span>
                                )}
                              </div>

                              {!editing[r.id] ? (
                                <div className="text-[14px] mt-1 whitespace-pre-wrap break-words">
                                  {r.content}
                                </div>
                              ) : (
                                <div className="mt-2">
                                  <textarea
                                    value={editInputs[r.id] ?? ""}
                                    onChange={(e) =>
                                      setEditInputs((m) => ({
                                        ...m,
                                        [r.id]: e.target.value,
                                      }))
                                    }
                                    className="w-full min-h-[80px] bg-transparent outline-none text-[14px] border border-[#E6E6E6] rounded-[16px] p-3"
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      type="button"
                                      onClick={() => saveEdit(r.id)}
                                      className="px-3 py-1 rounded-full bg-[#0080FF] text-white text-sm"
                                    >
                                      저장
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => cancelEdit(r.id)}
                                      className="px-3 py-1 rounded-full border text-sm"
                                    >
                                      취소
                                    </button>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-4 mt-1 text-sm text-[#999]">
                                <span>{formatKST(r.createdAt)}</span>

                                <button
                                  type="button"
                                  onClick={(e) => toggleCommentLike(e, r)}
                                  className="flex text-[14px] items-center gap-1"
                                  title={rIsLiked ? "좋아요 취소" : "좋아요"}
                                  disabled={!!commentLikePending[r.id]}
                                >
                                  <img
                                    src={rIsLiked ? darkHeart : heartIcon}
                                    alt="comment-like"
                                    className="w-4 h-4"
                                  />
                                  {rLikeCountDisplay}
                                </button>

                                {r.isMine && !editing[r.id] && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => beginEdit(r)}
                                      className="text-[13px] underline"
                                      title="댓글 수정"
                                    >
                                      수정
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteComment(r.id)}
                                      className="text-[13px] underline text-red-500"
                                      title="댓글 삭제"
                                    >
                                      삭제
                                    </button>
                                  </>
                                )}
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
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 페이지네이션 */}
        <div className="w-full flex justify-center mt-10 gap-4 items-center">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            aria-label="이전 페이지"
          >
            <img src={arrowLeft} alt="prev" className="w-6 h-6" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`text-sm ${
                currentPage === page ? "text-[#333] font-bold" : "text-[#999]"
              }`}
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
              if (reportedComments.has(selectedCommentId))
                return alert("이미 신고한 댓글입니다.");
              reportCommentM.mutate(
                { commentId: selectedCommentId, payload: form },
                {
                  onSuccess: () => {
                    alert("신고가 완료되었습니다.");
                    setReportedComments((s) =>
                      new Set(s).add(selectedCommentId)
                    );
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