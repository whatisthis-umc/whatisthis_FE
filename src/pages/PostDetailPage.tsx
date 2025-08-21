import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import bestBadge from "../assets/best.png";
import { likes, whiteHeart } from "../assets"; // 흰 하트, 하얀 하트
import heartIcon from "../assets/emptyHeart.png"; // 빈 하트
import reportIcon from "../assets/report.png";
import commentsIcon from "../assets/comments.png";
import commentsIconB from "../assets/comment_black.png";
import reportGrayIcon from "../assets/report_gray.png";
import arrowLeft from "../assets/chevron_backward.svg";
import arrowRight from "../assets/chevron_forward.svg";
import { darkHeart } from "../assets"; // 채워진 하트

import ReportModal from "../components/modals/ReportModal";
import SortDropdown from "../components/common/SortDropdown";
import InformationModal from "../components/modals/InformationModal";

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
  useDeletePost,
} from "../hooks/mutations/usePostEditDelete";

import type { CommunitySortType } from "../types/community";
import { formatTimeAgo } from "../utils/timeFormatter";

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

const formatKST = (isoLike?: string) => {
  if (!isoLike) return "";
  return formatTimeAgo(isoLike);
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
const pickFirstArray = (...xs: unknown[]) =>
  xs.find((v) => Array.isArray(v) && v.length > 0) ?? [];

const extractImages = (detail: unknown): string[] => {
  const detailObj = detail as Record<string, unknown>;
  const rawList = pickFirstArray(
    detailObj?.imageUrls,
    detailObj?.imageUrl,
    detailObj?.images,
    detailObj?.imageList,
    (detailObj?.imageListDto as Record<string, unknown>)?.imageList,
    (detailObj?.result as Record<string, unknown>)?.imageUrls,
    (detailObj?.result as Record<string, unknown>)?.imageUrl,
    (detailObj?.result as Record<string, unknown>)?.images,
    (detailObj?.result as Record<string, unknown>)?.imageList,
    ((detailObj?.result as Record<string, unknown>)?.imageListDto as Record<string, unknown>)?.imageList
  );
  const urls = (Array.isArray(rawList) ? rawList : [rawList])
    .map((it: unknown) => {
      if (typeof it === "string") return it;
      const item = it as Record<string, unknown>;
      return (item?.url ?? item?.path ?? item?.src) as string;
    })
    .filter(Boolean)
    .map(toAbs);
  return Array.from(new Set(urls));
};

const extractHashtags = (detail: unknown): string[] => {
  const detailObj = detail as Record<string, unknown>;
  const fromTop = Array.isArray(detailObj?.hashtags) ? detailObj.hashtags as string[] : [];
  const fromResult = Array.isArray((detailObj?.result as Record<string, unknown>)?.hashtags)
    ? (detailObj.result as Record<string, unknown>).hashtags as string[]
    : [];
  const fromDto =
    (((detailObj?.result as Record<string, unknown>)?.hashtagListDto as Record<string, unknown>)?.hashtagList as unknown[])
      ?.map((h: unknown) => (h as Record<string, unknown>)?.content as string)
      .filter(Boolean) ?? [];
  const fromDto2 =
    ((detailObj?.hashtagListDto as Record<string, unknown>)?.hashtagList as unknown[])
      ?.map((h: unknown) => (h as Record<string, unknown>)?.content as string)
      .filter(Boolean) ?? [];
  const fromList = Array.isArray(detailObj?.hashtagList)
    ? (detailObj.hashtagList as unknown[]).map((h: unknown) => (h as Record<string, unknown>)?.content ?? h as string).filter(Boolean)
    : [];
  return Array.from(
    new Set<string>([
      ...fromTop,
      ...fromResult,
      ...fromDto,
      ...fromDto2,
      ...fromList,
    ].filter((item): item is string => typeof item === 'string'))
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
  detail: unknown,
  postNickname: string,
  myNickname: string
): RawComment[] => {
  const detailObj = detail as Record<string, unknown>;
  const vNew =
    (detailObj?.commentListDto as Record<string, unknown>)?.commentList ??
    ((detailObj?.result as Record<string, unknown>)?.commentListDto as Record<string, unknown>)?.commentList;
  const vOld = (detailObj?.commentPage as Record<string, unknown>)?.list;
  const base: unknown[] = Array.isArray(vNew)
    ? vNew
    : Array.isArray(vOld)
      ? vOld
      : [];
  return base.map((c) => {
    const commentObj = c as Record<string, unknown>;
    const parentRaw =
      commentObj?.parentId ??
      commentObj?.parentCommentId ??
      (commentObj?.parent as Record<string, unknown>)?.id ??
      commentObj?.parent_id ??
      commentObj?.parent_comment_id ??
      null;
    const parentId =
      parentRaw == null || Number(parentRaw) <= 0 ? null : Number(parentRaw);
    const nickname = (commentObj?.nickname as string) ?? "";
    const isAuthor = (commentObj?.isAuthor as boolean) ?? nickname === postNickname;
    const isMine = (commentObj?.isMine as boolean) ?? (myNickname && nickname === myNickname);
    return {
      id: Number(commentObj?.id),
      content: (commentObj?.content as string) ?? "",
      nickname,
      profileImageUrl:
        (commentObj?.profileImageUrl ?? commentObj?.profileimageUrl ?? commentObj?.profileimageurl) as string,
      createdAt: (commentObj?.createdAt as string) ?? "",
      likeCount: Number(commentObj?.likeCount ?? 0),
      commentCount: Number(commentObj?.commentCount ?? 0),
      isAuthor,
      isMine,
      parentId,
      liked: Boolean(commentObj?.liked ?? false),
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
  // ✅ 훅을 조건부로 못 쓰므로 안전 ID로 호출하고, UI는 별도 가드
  const safePostId = Number.isFinite(postIdNum) && postIdNum > 0 ? postIdNum : -1;

  const queryClient = useQueryClient();

  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<"댓글" | "게시물">(
    "게시물"
  );
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(
    null
  );
  const [reportedPost, setReportedPost] = useState(false);
  const [reportedComments, setReportedComments] = useState<Set<number>>(
    new Set()
  );

  // 자신의 게시글/댓글 좋아요 모달
  const [showLikeErrorModal, setShowLikeErrorModal] = useState(false);
  const [likeErrorMessage, setLikeErrorMessage] = useState("");

  const [sortType, setSortType] = useState<UISort>("인기순");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [newComment, setNewComment] = useState("");
  const [isSubmittingTop, setIsSubmittingTop] = useState(false);
  const [openReplyBoxes, setOpenReplyBoxes] = useState<Set<number>>(new Set());
  const [replyInputs, setReplyInputs] = useState<Record<number, string>>({});

  const apiSort = uiToApi(sortType);
  const { data, isLoading, isError } = useGetCommunityDetail({
    postId: safePostId, // ✅ 잘못된 ID면 API 유틸에서 즉시 에러를 던져 네트워크 호출 방지
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
  const deletePostM = useDeletePost(safePostId);

  // 서버는 liked 상태를 제공하지 않음 (스웨거 문서 확인)
  // 따라서 localStorage 기반으로 상태 관리
  const likeCountFromServer = Number(
    (data as Record<string, unknown>)?.likeCount ?? 
    ((data as Record<string, unknown>)?.result as Record<string, unknown>)?.likeCount ?? 
    0
  );
  
  // 게시글 좋아요 상태 관리 - localStorage 기반 (서버는 liked 상태 제공 안함)
  const [liked, setLiked] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`postLiked_${safePostId}`);
      if (saved !== null) {
        const parsedLiked = JSON.parse(saved);
        console.log(`localStorage에서 게시글 ${safePostId} 좋아요 상태 복원:`, parsedLiked);
        return parsedLiked;
      }
    } catch (e) {
      console.warn("localStorage 좋아요 상태 파싱 실패:", e);
    }
    // localStorage에 없으면 기본값은 false (좋아요 안한 상태)
    return false;
  });

  // 무한 루프 방지를 위해 서버 상태 확인 로직 제거
  // localStorage 기반으로만 상태 관리
  const [likeCount, setLikeCount] = useState<number>(likeCountFromServer);

  useEffect(() => {
    // 좋아요 개수만 서버 상태로 업데이트 (liked 상태는 localStorage로 관리)
    setLikeCount(likeCountFromServer);
  }, [likeCountFromServer]);

  const likeOpRef = useRef(0);

  const detail: Record<string, unknown> = (data as Record<string, unknown>) ?? {};
  const postNickname = (detail.nickname as string) ?? ((detail.result as Record<string, unknown>)?.nickname as string) ?? "";
  const myNickname = (() => {
    // 기본 키들 확인
    const basic = localStorage.getItem("nickname") ||
                 localStorage.getItem("userNickname") ||
                 localStorage.getItem("memberNickname") ||
                 localStorage.getItem("name");
    if (basic) return basic;
    
    // USER_INFO에서 추출 (이중 JSON 인코딩된 문자열)
    try {
      const userInfoStr = localStorage.getItem("USER_INFO");
      if (userInfoStr) {
        // 첫 번째 JSON.parse로 문자열 추출
        const innerJsonStr = JSON.parse(userInfoStr);
        // 두 번째 JSON.parse로 객체 추출
        const userInfo = JSON.parse(innerJsonStr);
        if (userInfo.name) return userInfo.name;
        if (userInfo.nickname) return userInfo.nickname;
        if (userInfo.userName) return userInfo.userName;
      }
    } catch (e) {
      console.warn("USER_INFO 파싱 실패:", e);
    }
    
    // 추가: 다른 가능한 키들 확인
    const allKeys = Object.keys(localStorage);
    console.log("🔍 localStorage 모든 키:", allKeys);
    
    // 닉네임 관련 키 찾기
    const nicknameKeys = allKeys.filter(key => 
      key.toLowerCase().includes('nickname') || 
      key.toLowerCase().includes('name') ||
      key.toLowerCase().includes('user')
    );
    
    console.log("🔍 닉네임 관련 키들:", nicknameKeys);
    
    for (const key of nicknameKeys) {
      const value = localStorage.getItem(key);
      if (value && value.trim()) {
        console.log(`🔍 ${key}: ${value}`);
        return value;
      }
    }
    
    return "";
  })();
  
  // 디버깅: 현재 사용자 정보 출력
  console.log("현재 사용자 정보:", {
    myNickname,
    localStorage: {
      nickname: localStorage.getItem("nickname"),
      userNickname: localStorage.getItem("userNickname"),
      memberNickname: localStorage.getItem("memberNickname"),
      accessToken: localStorage.getItem("accessToken")?.substring(0, 20) + "...",
    }
  });
  
  // localStorage의 모든 키 확인
  console.log("localStorage 모든 키:", Object.keys(localStorage));
  console.log("localStorage 모든 값:", Object.fromEntries(
    Object.keys(localStorage).map(key => [key, localStorage.getItem(key)])
  ));

  console.log("🔍 좋아요 상태 최종 확인:", {
    postId: safePostId,
    localStorage값: localStorage.getItem(`postLiked_${safePostId}`),
    localStorage파싱값: (() => {
      try {
        const saved = localStorage.getItem(`postLiked_${safePostId}`);
        return saved !== null ? JSON.parse(saved) : "null";
      } catch (e) {
        return "파싱에러";
      }
    })(),
    컴포넌트liked상태: liked,
    현재표시할아이콘: liked ? "whiteHeart.png" : "likes.png",
    예상하트아이콘: localStorage.getItem(`postLiked_${safePostId}`) === "true" ? "whiteHeart.png" : "likes.png"
  });
  const isMyPost = !!myNickname && myNickname === postNickname;

  // 본문/EXTRA
  const rawContent = (detail.content as string) ?? ((detail.result as Record<string, unknown>)?.content as string) ?? "";
  const {
    content: displayContent,
    features,
    source: srcFromExtra,
  } = useMemo(() => parseExtraFromContent(rawContent), [rawContent]);

  // 출처 필드도 탐색
  const source =
    srcFromExtra ||
    (detail?.source as string) ||
    ((detail?.result as Record<string, unknown>)?.source as string) ||
    (detail?.reference as string) ||
    ((detail?.result as Record<string, unknown>)?.reference as string) ||
    (detail?.origin as string) ||
    ((detail?.result as Record<string, unknown>)?.origin as string) ||
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
    const r = (detail?.result as Record<string, unknown>) ?? detail;
    const total =
      (r?.commentListDto as Record<string, unknown>)?.totalPage ?? (r?.commentPage as Record<string, unknown>)?.totalPage ?? 1;
    return Math.max(1, Number(total) || 1);
  }, [detail]);

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({
      predicate: (q) =>
        Array.isArray(q.queryKey) && q.queryKey[0] === "communityDetail",
      refetchType: "active",
    });
  };

  /* 게시물 좋아요 */
  const handleToggleLike = () => {
    console.log("🔥 하트 버튼 클릭됨!");
    if (safePostId <= 0) return;
    
    // 자신의 게시글인지 확인
    if (isMyPost) {
      setLikeErrorMessage("자신의 게시글은 좋아요할 수 없습니다.");
      setShowLikeErrorModal(true);
      return;
    }
    
    // 현재 상태를 다시 확인 (localStorage에서 최신값 가져오기)
    const currentLikedFromStorage = (() => {
      try {
        const saved = localStorage.getItem(`postLiked_${safePostId}`);
        return saved !== null ? JSON.parse(saved) : false;
      } catch (e) {
        console.warn("localStorage 파싱 실패:", e);
        return false;
      }
    })();
    
    console.log("좋아요 토글 시작 - 상세 디버깅:", {
      컴포넌트상태_liked: liked,
      localStorage_최신값: currentLikedFromStorage,
      localStorage_원시값: localStorage.getItem(`postLiked_${safePostId}`),
      다음상태: !currentLikedFromStorage,
      액션: !currentLikedFromStorage ? "좋아요 등록" : "좋아요 해제",
      API호출: !currentLikedFromStorage ? "POST /posts/likes" : "DELETE /posts/likes"
    });
    
    // localStorage의 최신값을 기준으로 상태 업데이트
    const nextLiked = !currentLikedFromStorage;
    setLiked(nextLiked);
    setLikeCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)));
    
    const opId = ++likeOpRef.current;

    (nextLiked ? likePostM : unlikePostM).mutate(undefined, {
      onSuccess: (res: Record<string, unknown>) => {
        if (likeOpRef.current !== opId) return;
        console.log("좋아요 API 성공 응답:", res);
        
        // 서버는 liked 상태를 주지 않으므로 클라이언트에서 관리
        setLiked(nextLiked);
        localStorage.setItem(`postLiked_${safePostId}`, JSON.stringify(nextLiked));
        
        // 서버 응답은 참고용으로만 로깅하고, 클라이언트 로직으로 업데이트
        const serverCount = typeof res?.likeCount === "number" ? res.likeCount : undefined;
        console.log("서버 likeCount 정보 (참고용):", {
          serverCount,
          currentLikeCount: likeCount,
          nextLiked,
          action: nextLiked ? "좋아요 등록" : "좋아요 해제",
          note: "서버 값 대신 클라이언트 로직 사용"
        });
        // 서버 응답 대신 클라이언트 로직만 사용 (이미 optimistic update 완료)
      },
      onError: (error: unknown) => {
        if (likeOpRef.current !== opId) return;
        
        const errorObj = error as Record<string, unknown>;
        const status = (errorObj?.response as Record<string, unknown>)?.status;
        
        if (status === 403) {
          // 403 Forbidden 오류 처리 (자신의 게시글 좋아요 시도)
        setLiked(!nextLiked);
        setLikeCount((c) => Math.max(0, c + (nextLiked ? -1 : 1)));
          setLikeErrorMessage("자신의 게시글은 좋아요할 수 없습니다.");
          setShowLikeErrorModal(true);
        } else if (status === 409) {
                    // 409 Conflict 오류 처리 - 상태 동기화
                    const errorMessage = (errorObj as Record<string, unknown>)?.message as string;
                    const responseData = (errorObj?.response as Record<string, unknown>)?.data as Record<string, unknown>;
                    const responseMessage = responseData?.message as string;
                    
                    console.log("게시글 좋아요 상태 충돌:", {
                      errorMessage,
                      responseMessage,
                      nextLiked,
                      currentLikedFromStorage: !nextLiked,
                      fullError: errorObj
                    });
                    
                    // 실제 오류 메시지는 response.data.message에 있음
                    const actualMessage = responseMessage || errorMessage || "";
                    
                    if (actualMessage.includes("이미 좋아요")) {
                      // POST 요청인데 이미 좋아요된 상태 - 좋아요된 상태로 고정
                      console.log("서버: 이미 좋아요됨 - localStorage를 true로 동기화");
                      setLiked(true);
                      localStorage.setItem(`postLiked_${safePostId}`, JSON.stringify(true));
                    } else if (actualMessage.includes("좋아요하지 않은")) {
                      // DELETE 요청인데 좋아요하지 않은 상태 - 좋아요 안된 상태로 고정
                      console.log("서버: 좋아요하지 않음 - localStorage를 false로 동기화");
                      setLiked(false);
                      localStorage.setItem(`postLiked_${safePostId}`, JSON.stringify(false));
                    } else {
                      // 메시지를 찾지 못한 경우, POST 요청이면 이미 좋아요된 것으로 간주
                      console.log("메시지를 찾지 못함 - POST 요청이므로 이미 좋아요된 것으로 간주");
                      if (nextLiked) {
                        setLiked(true);
                        localStorage.setItem(`postLiked_${safePostId}`, JSON.stringify(true));
                      }
                    }
                    // 데이터 새로고침하지 않음 (무한 루프 방지)
        } else {
          // 일반 오류의 경우 상태 되돌리기
          setLiked(!nextLiked);
          setLikeCount((c) => Math.max(0, c + (nextLiked ? -1 : 1)));
          console.error("게시글 좋아요 오류:", error);
        }
      },
    });
  };

  /* 댓글 작성/대댓글 */
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

  /* 댓글 좋아요/수정/삭제 */
  const [commentLikeLoading, setCommentLikeLoading] = useState<Record<number, boolean>>(
    {}
  );
  const [commentDeleteLoading, setCommentDeleteLoading] = useState<Record<number, boolean>>({});
  // 댓글 좋아요 상태를 로컬에서 관리 (localStorage에서 복원)
  const [commentLikedStates, setCommentLikedStates] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`commentLikedStates_${safePostId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  // 삭제된 댓글 ID들을 추적 (localStorage에서 복원)
  const [deletedCommentIds, setDeletedCommentIds] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem(`deletedComments_${safePostId}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const toggleCommentLike = (c: RawComment) => {
    if (safePostId <= 0) return;
    
    // 디버깅: 댓글 상태 로그
    console.log(`댓글 ${c.id} 상태:`, {
      nickname: c.nickname,
      myNickname,
      isMine: c.isMine,
      liked: c.liked,
      likeCount: c.likeCount,
      localLiked: commentLikedStates[c.id]
    });
    
    // 이미 처리 중인 댓글은 중복 클릭 방지
    if (commentLikeLoading[c.id]) return;
    
    // 자신의 댓글인지 확인 (닉네임 비교로 재확인)
    const isMyComment = myNickname && c.nickname === myNickname;
    if (isMyComment) {
      setLikeErrorMessage("자신의 댓글은 좋아요할 수 없습니다.");
      setShowLikeErrorModal(true);
      return;
    }
    
    setCommentLikeLoading((m) => ({ ...m, [c.id]: true }));
    
    // 현재 로컬 좋아요 상태 확인
    const currentLiked = commentLikedStates[c.id] ?? c.liked ?? false;
    
    if (currentLiked) {
      // 현재 좋아요 상태이므로 좋아요 취소
      console.log(`댓글 ${c.id} 좋아요 취소 시도`);
      unlikeCommentM.mutate(c.id, {
                 onSuccess: () => {
           setCommentLikeLoading((m) => ({ ...m, [c.id]: false }));
           setCommentLikedStates((prev) => {
             const newState = { ...prev, [c.id]: false };
             localStorage.setItem(`commentLikedStates_${safePostId}`, JSON.stringify(newState));
             return newState;
           });
           invalidateAll();
         },
        onError: (error: any) => {
          setCommentLikeLoading((m) => ({ ...m, [c.id]: false }));
          
          if (error?.response?.status === 409) {
            console.log("댓글 좋아요 취소 상태 충돌 - 서버 상태로 동기화");
            invalidateAll();
          } else if (error?.response?.status === 403) {
            setLikeErrorMessage("자신의 댓글은 좋아요할 수 없습니다.");
            setShowLikeErrorModal(true);
          } else {
            console.error("댓글 좋아요 취소 오류:", error);
          }
        },
      });
    } else {
      // 현재 좋아요하지 않은 상태이므로 좋아요 추가
      console.log(`댓글 ${c.id} 좋아요 추가 시도`);
      likeCommentM.mutate(c.id, {
                 onSuccess: () => {
           setCommentLikeLoading((m) => ({ ...m, [c.id]: false }));
           setCommentLikedStates((prev) => {
             const newState = { ...prev, [c.id]: true };
             localStorage.setItem(`commentLikedStates_${safePostId}`, JSON.stringify(newState));
             return newState;
           });
           invalidateAll();
         },
        onError: (error: any) => {
          setCommentLikeLoading((m) => ({ ...m, [c.id]: false }));
          
                     if (error?.response?.status === 409) {
             // 이미 좋아요를 누른 상태이므로 로컬 상태를 true로 설정
             console.log(`댓글 ${c.id} 이미 좋아요 상태 - 로컬 상태 업데이트`);
             setCommentLikedStates((prev) => {
               const newState = { ...prev, [c.id]: true };
               localStorage.setItem(`commentLikedStates_${safePostId}`, JSON.stringify(newState));
               return newState;
             });
             invalidateAll();
           } else if (error?.response?.status === 403) {
            setLikeErrorMessage("자신의 댓글은 좋아요할 수 없습니다.");
            setShowLikeErrorModal(true);
          } else if (error?.response?.status === 400) {
            console.error("댓글 좋아요 오류 (400):", error);
            // 400 오류는 삭제된 댓글이거나 다른 문제이므로 서버 상태 동기화
            invalidateAll();
          } else {
            console.error("댓글 좋아요 오류:", error);
          }
        },
      });
    }
  };

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
    
    const accessToken = localStorage.getItem("accessToken");
    
    // 토큰 만료 시간 확인
    let tokenExp = null;
    let tokenExpDate = null;
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        tokenExp = payload.exp;
        tokenExpDate = new Date(tokenExp * 1000);
      } catch (e) {
        console.warn("토큰 파싱 실패:", e);
      }
    }
    
    console.log("댓글 수정 시도:", {
      postId: safePostId,
      commentId,
      content,
      myNickname,
      accessToken: accessToken?.substring(0, 20) + "...",
      tokenExists: !!accessToken,
      tokenLength: accessToken?.length,
      refreshToken: !!localStorage.getItem("refreshToken"),
      tokenExp,
      tokenExpDate,
      now: new Date(),
      isExpired: tokenExp ? Date.now() > tokenExp * 1000 : null
    });
    
    try {
    await updateCommentM.mutateAsync({ commentId, content });
    cancelEdit(commentId);
    await invalidateAll();
    } catch (error) {
      console.error("댓글 수정 오류:", error);
      console.error("오류 상세:", {
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data,
        message: (error as any)?.message
      });
      
      // "이미 삭제된 댓글" 오류인 경우 UI에서도 제거
      const errorMessage = (error as any)?.response?.data?.message || "";
      if (errorMessage.includes("이미 삭제된 댓글") || (error as any)?.response?.status === 400) {
        console.log("수정 시도 중 삭제된 댓글 발견 - UI에서 제거:", commentId);
        
        // UI에서 제거 및 localStorage 저장
        const newDeletedIds = new Set([...deletedCommentIds, commentId]);
        setDeletedCommentIds(newDeletedIds);
        localStorage.setItem(`deletedComments_${safePostId}`, JSON.stringify([...newDeletedIds]));
        
        // 편집 모드 종료
        cancelEdit(commentId);
        
        alert("이미 삭제된 댓글입니다.");
      } else {
        alert("댓글 수정에 실패했습니다.");
      }
    }
  };
  const handleDeleteComment = async (commentId: number) => {
    if (safePostId <= 0) return;
    
    // 이미 삭제 처리 중인 댓글은 중복 클릭 방지
    if (commentDeleteLoading[commentId]) {
      console.log("이미 삭제 처리 중:", commentId);
      return;
    }
    
    if (!confirm("이 댓글을 삭제하시겠습니까?")) return;
    
    const accessToken = localStorage.getItem("accessToken");
    
    // 토큰 만료 시간 확인
    let tokenExp = null;
    let tokenExpDate = null;
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        tokenExp = payload.exp;
        tokenExpDate = new Date(tokenExp * 1000);
      } catch (e) {
        console.warn("토큰 파싱 실패:", e);
      }
    }
    
    console.log("댓글 삭제 시도:", {
      postId: safePostId,
      commentId,
      myNickname,
      accessToken: accessToken?.substring(0, 20) + "...",
      tokenExists: !!accessToken,
      tokenLength: accessToken?.length,
      refreshToken: !!localStorage.getItem("refreshToken"),
      tokenExp,
      tokenExpDate,
      now: new Date(),
      isExpired: tokenExp ? Date.now() > tokenExp * 1000 : null
    });
    
    // 삭제 로딩 상태 시작
    setCommentDeleteLoading((prev) => ({ ...prev, [commentId]: true }));
    
    try {
    await deleteCommentM.mutateAsync(commentId);
      
      // 성공 시 즉시 UI에서 댓글 제거 (낙관적 업데이트)
      console.log("댓글 삭제 성공:", commentId);
      
      // 삭제된 댓글 ID에 추가 및 localStorage 저장
      const newDeletedIds = new Set([...deletedCommentIds, commentId]);
      setDeletedCommentIds(newDeletedIds);
      localStorage.setItem(`deletedComments_${safePostId}`, JSON.stringify([...newDeletedIds]));
      
      // 로딩 상태 해제
      setCommentDeleteLoading((prev) => ({ ...prev, [commentId]: false }));
      
      // 서버 상태 동기화
    await invalidateAll();
      
    } catch (error) {
      // 실패 시에도 로딩 상태 해제
      setCommentDeleteLoading((prev) => ({ ...prev, [commentId]: false }));
      
      console.error("댓글 삭제 오류:", error);
      console.error("오류 상세:", {
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data,
        message: (error as any)?.message
      });
      
      // "이미 삭제된 댓글" 오류인 경우 UI에서도 제거
      const errorMessage = (error as any)?.response?.data?.message || "";
      if (errorMessage.includes("이미 삭제된 댓글") || (error as any)?.response?.status === 400) {
        console.log("이미 삭제된 댓글 - UI에서 제거:", commentId);
        
        // UI에서 제거 및 localStorage 저장
        const newDeletedIds = new Set([...deletedCommentIds, commentId]);
        setDeletedCommentIds(newDeletedIds);
        localStorage.setItem(`deletedComments_${safePostId}`, JSON.stringify([...newDeletedIds]));
        
        alert("이미 삭제된 댓글입니다.");
      } else {
        alert(errorMessage || "댓글 삭제에 실패했습니다.");
      }
      
      // 실패 시에도 서버 상태 동기화 (댓글이 실제로 삭제되었을 수 있음)
      await invalidateAll();
    }
  };

  /* 게시물 수정/삭제 */
  const handleEditPost = () => {
    if (safePostId <= 0) return;
    // ✅ 수정 페이지로 이동
    navigate(`/post/${safePostId}/edit`);
  };
  const handleDeletePost = async () => {
    if (safePostId <= 0) return;
    if (!confirm("게시글을 삭제할까요?")) return;
    await deletePostM.mutateAsync();
    alert("삭제되었습니다.");
    navigate("/community");
  };

  // 디버깅: API 응답에서 프로필 사진 필드 확인
  console.log("게시글 상세 API 응답:", data);
  console.log("detail 객체:", detail);
  console.log("프로필 사진 관련 필드들:", {
    profileImageUrl: detail.profileImageUrl,
    profileImage: detail.profileImage,
    authorProfileImage: (detail as any)?.authorProfileImage,
    memberProfileImage: (detail as any)?.memberProfileImage,
    author: (detail as any)?.author,
    member: (detail as any)?.member,
    // 추가 필드들 확인
    memberProfileImageUrl: (detail as any)?.memberProfileImageUrl,
    authorProfileImageUrl: (detail as any)?.authorProfileImageUrl,
    userProfileImage: (detail as any)?.userProfileImage,
    userProfileImageUrl: (detail as any)?.userProfileImageUrl,
    // result 내부 필드들도 확인
    resultProfileImageUrl: (detail.result as any)?.profileImageUrl,
    resultProfileImage: (detail.result as any)?.profileImage,
    resultAuthorProfileImage: (detail.result as any)?.authorProfileImage,
    resultMemberProfileImage: (detail.result as any)?.memberProfileImage,
  });

  // ===== 가드 =====
  if (safePostId <= 0)
    return <div className="p-8">잘못된 게시글 ID입니다.</div>;
  if (isLoading) return <div className="p-8">로딩 중…</div>;
  if (isError || !data)
    return <div className="p-8">게시글을 불러오지 못했습니다.</div>;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8 font-[Pretendard]">
      {/* 작성자/메타 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
        <div className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] rounded-full bg-[#D9D9D9] opacity-80 flex items-center justify-center overflow-hidden">
          {/* 게시글 작성자의 프로필 사진 표시 */}
          {(() => {
            // 댓글과 동일한 방식으로 프로필 사진 URL 찾기
            const detailObj = detail as Record<string, unknown>;
            const profileImageUrl = 
              (detailObj.profileImageUrl ?? detailObj.profileimageUrl ?? detailObj.profileimageurl) as string;
            
            return profileImageUrl ? (
              <img
                src={toAbs(profileImageUrl)}
                alt="profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-pink-300 to-gray-400 flex items-center justify-center text-white font-bold text-lg">
                {(detail.nickname as string)?.charAt(0) || "U"}
              </div>
            );
          })()}
        </div>
        <div className="flex items-center gap-1">
          {(detail.isBestUser as boolean) && (
            <img
              src={bestBadge}
              alt="best badge"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
          )}
          <span className="text-gray-800 font-medium text-sm sm:text-base">
            {(detail.nickname as string) ?? ((detail.result as Record<string, unknown>)?.nickname as string)}
          </span>
        </div>
        <span className="text-gray-500 text-sm">
          {formatKST((detail.createdAt as string) ?? ((detail.result as Record<string, unknown>)?.createdAt as string))}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-[60px]">
        {/* 이미지 */}
        <div className="bg-[#D9D9D9] rounded-[20px] sm:rounded-[24px] lg:rounded-[32px] w-full lg:w-1/2 h-[250px] sm:h-[400px] lg:h-[680px] overflow-hidden flex items-center justify-center">
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
        <div className="flex flex-col gap-4 sm:gap-6 flex-1">
          <h1 className="text-[18px] sm:text-[20px] lg:text-[24px] font-bold leading-tight">
            {(detail.title as string) ?? ((detail.result as Record<string, unknown>)?.title as string)}
          </h1>

          <p className="text-gray-700 text-[14px] sm:text-[15px] lg:text-[16px] font-medium leading-relaxed whitespace-pre-wrap">
            {displayContent as string}
          </p>

          {/* 주요 특징 */}
          {(features as string[]).length > 0 && (
            <div className="border border-[#E6E6E6] rounded-[20px] sm:rounded-[24px] lg:rounded-[32px] px-[20px] sm:px-[24px] py-[20px] sm:py-[24px] text-[#333] text-[14px] sm:text-[15px] lg:text-[16px] leading-[2] whitespace-pre-wrap">
              <div className="font-bold mb-2">주요 특징</div>
              {(features as string[]).map((f, i) => (
                <div key={i}>
                  특징 {i + 1}. {f}
                </div>
              ))}
            </div>
          )}

          {/* 출처 */}
          {source && (
            <div className="border border-[#E6E6E6] rounded-[20px] sm:rounded-[24px] lg:rounded-[32px] px-[20px] sm:px-[24px] py-[20px] sm:py-[24px] h-[60px] sm:h-[72px] flex items-center">
              <label className="text-[#333] font-medium mr-3 sm:mr-4 min-w-[35px] sm:min-w-[40px] text-[14px] sm:text-[15px] lg:text-[16px]">
                출처
              </label>
              <div className="w-full text-[14px] sm:text-[15px] lg:text-[16px] break-all">{source}</div>
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
                className="flex items-center gap-2 bg-[#0080FF] text-white font-normal text-sm sm:text-base lg:text-lg px-4 py-2 rounded-full"
                onClick={handleToggleLike}
              >
                 <img src={liked ? whiteHeart : likes} alt="like" className="w-4 h-4" />
                좋아요 {likeCount}
              </button>
            </div>

            <div className="flex items-center gap-3">
              {isMyPost && (
                <>
                  <button
                    onClick={handleEditPost}
                    className="flex items-center gap-2 bg-[#0080FF] text-white font-normal text-sm sm:text-base lg:text-lg px-4 py-2 rounded-full"
                    title="게시글 수정"
                  >
                    수정
                  </button>
                  <button
                    onClick={handleDeletePost}
                    className="flex items-center gap-2 bg-[#0080FF] text-white font-normal text-sm sm:text-base lg:text-lg px-4 py-2 rounded-full"
                    title="게시글 삭제"
                  >
                    삭제
                  </button>
                </>
              )}

            <button
              onClick={() => {
                setSelectedTarget("게시물");
                setShowReportModal(true);
              }}
              className="flex items-center gap-2 bg-[#0080FF] text-white font-normal text-sm sm:text-base lg:text-lg px-4 py-2 rounded-full"
            >
              <img src={reportIcon} alt="report" className="w-4 h-4" />
              신고하기
            </button>
            </div>
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
            {(() => {
              // 현재 화면에 표시되는 실제 댓글 개수 계산
              let visibleCommentCount = 0;
              
              // 필터링된 댓글 트리를 기반으로 실제 개수 계산
              tree.filter((c) => !deletedCommentIds.has(c.id)).forEach((c) => {
                // 최상위 댓글 1개 추가
                visibleCommentCount += 1;
                // 삭제되지 않은 대댓글 개수 추가
                visibleCommentCount += c.replies.filter((r) => !deletedCommentIds.has(r.id)).length;
              });
              
              return visibleCommentCount;
            })()}
          </div>
          <div className="justify-self-end">
            <SortDropdown
              defaultValue={uiToApi(sortType)} // ✅ 드롭다운은 API 타입
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
              className="w/full bg-transparent outline-none text-[16px] sm:text-[20px] leading-[150%] tracking-[-0.02em] placeholder:text-[#6B7280]"
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
                       bg-[#0080FF] text-white font-normal leading-[150%] tracking-[-0.02em]
                       whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmittingTop || createCommentM.isPending ? "등록중…" : "입력"}
          </button>
        </form>

        {/* 댓글 트리 */}
        <div className="w-full flex flex-col gap-10">
            {tree
              .filter((c) => !deletedCommentIds.has(c.id)) // 삭제된 댓글 필터링
              .map((c) => {
              // 로컬 상태를 우선하고, 없으면 서버 상태 사용
              const isLiked = commentLikedStates[c.id] ?? c.liked ?? false;
              const displayLikeCount = c.likeCount;

            return (
              <div key={c.id} className="flex flex-col gap-2">
                {/* 최상위 댓글 */}
                <div className="flex justify-between">
                  <div className="flex gap-4 items-start">
                    <div className="w-[40px] h-[40px] rounded-full bg-[#D9D9D9] flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {/* 댓글 작성자 프로필 사진 */}
                      {c.profileImageUrl ? (
                        <img
                          src={toAbs(c.profileImageUrl)}
                          alt="profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-300 to-gray-400 flex items-center justify-center text-white font-bold text-sm">
                          {c.nickname?.charAt(0) || "U"}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[16px] font-bold">
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
                             className="w-full min-h-[80px] bg-white outline-none text-[14px] border border-[#E6E6E6] rounded-[16px] p-3 focus:border-[#0080FF]"
                             placeholder="댓글을 수정해주세요."
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => saveEdit(c.id)}
                               disabled={!editInputs[c.id]?.trim()}
                               className="px-4 py-2 rounded-full bg-[#0080FF] text-white text-sm font-normal disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0066CC]"
                            >
                              저장
                            </button>
                            <button
                              type="button"
                              onClick={() => cancelEdit(c.id)}
                               className="px-4 py-2 rounded-full border border-[#E6E6E6] text-[#666] text-sm font-normal hover:bg-[#F5F5F5]"
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
                           onClick={() => toggleCommentLike(c)}
                           disabled={commentLikeLoading[c.id]}
                           className="flex text-[14px] items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={isLiked ? "좋아요 취소" : "좋아요"}
                        >
                          <img
                            src={isLiked ? darkHeart : heartIcon}
                            alt="comment-like"
                            className={`w-4 h-4 ${commentLikeLoading[c.id] ? 'animate-pulse' : ''}`}
                          />
                          {displayLikeCount}
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
                          {c.replies.filter((r) => !deletedCommentIds.has(r.id)).length}
                        </button>

                                                                                                                                                                                                       {/* 자신의 댓글에만 수정/삭제 버튼 표시 + 디버깅 */}
                                                                                                    {(() => {
                                                                                                      const isMyComment = c.isMine || (myNickname && c.nickname === myNickname);
                                                                                                      console.log(`댓글 ${c.id} 버튼 표시 조건:`, {
                                                                                                        nickname: c.nickname,
                                                                                                        myNickname,
                                                                                                        isMine: c.isMine,
                                                                                                        isMyComment,
                                                                                                        editing: editing[c.id],
                                                                                                        showButtons: isMyComment && !editing[c.id]
                                                                                                      });
                                                                                                      return isMyComment && !editing[c.id];
                                                                                                    })() && (
                                                         <div className="flex gap-2">
                               <button
                                 type="button"
                                 onClick={() => beginEdit(c)}
                                 className="text-[#999] hover:text-[#666] text-xs px-1 py-1 rounded"
                                 title="댓글 수정"
                               >
                                 수정
                               </button>
                               <button
                                 type="button"
                                 onClick={() => handleDeleteComment(c.id)}
                                 disabled={commentDeleteLoading[c.id]}
                                 className="text-[#999] hover:text-[#666] text-xs px-1 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                 title="댓글 삭제"
                               >
                                 {commentDeleteLoading[c.id] ? "삭제 중..." : "삭제"}
                        </button>
                             </div>
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
                                       bg-[#0080FF] text-white font-normal leading-[150%] tracking-[-0.02em]
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
                      {c.replies
                        .filter((r) => !deletedCommentIds.has(r.id)) // 삭제된 대댓글 필터링
                        .map((r) => {
                          // 로컬 상태를 우선하고, 없으면 서버 상태 사용
                          const rIsLiked = commentLikedStates[r.id] ?? r.liked ?? false;
                          const rDisplayLikeCount = r.likeCount;

                      return (
                        <div key={r.id} className="flex justify-between">
                          <div className="flex gap-4 items-start">
                            <div className="w-[32px] h-[32px] rounded-full bg-[#D9D9D9] flex-shrink-0 flex items-center justify-center overflow-hidden">
                              {/* 대댓글 작성자 프로필 사진 */}
                              {r.profileImageUrl ? (
                                <img
                                  src={toAbs(r.profileImageUrl)}
                                  alt="profile"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-pink-300 to-gray-400 flex items-center justify-center text-white font-bold text-xs">
                                  {r.nickname?.charAt(0) || "U"}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[15px] font-bold">
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
                                     className="w-full min-h-[80px] bg-white outline-none text-[14px] border border-[#E6E6E6] rounded-[16px] p-3 focus:border-[#0080FF]"
                                     placeholder="댓글을 수정해주세요."
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      type="button"
                                      onClick={() => saveEdit(r.id)}
                                       disabled={!editInputs[r.id]?.trim()}
                                       className="px-4 py-2 rounded-full bg-[#0080FF] text-white text-sm font-normal disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0066CC]"
                                    >
                                      저장
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => cancelEdit(r.id)}
                                       className="px-4 py-2 rounded-full border border-[#E6E6E6] text-[#666] text-sm font-normal hover:bg-[#F5F5F5]"
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
                                    onClick={() => toggleCommentLike(r)}
                                    disabled={commentLikeLoading[r.id]}
                                    className="flex text-[14px] items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title={rIsLiked ? "좋아요 취소" : "좋아요"}
                                >
                                   <img
                                     src={rIsLiked ? darkHeart : heartIcon}
                                     alt="comment-like"
                                     className={`w-4 h-4 ${commentLikeLoading[r.id] ? 'animate-pulse' : ''}`}
                                   />
                                  {rDisplayLikeCount}
                                </button>

                                                                                                                                                                                                                                                                       {/* 자신의 대댓글에만 수정/삭제 버튼 표시 + 디버깅 */}
                                                                                                                                    {(() => {
                                                                                                                                      const isMyReply = r.isMine || (myNickname && r.nickname === myNickname);
                                                                                                                                      console.log(`대댓글 ${r.id} 버튼 표시 조건:`, {
                                                                                                                                        nickname: r.nickname,
                                                                                                                                        myNickname,
                                                                                                                                        isMine: r.isMine,
                                                                                                                                        isMyReply,
                                                                                                                                        editing: editing[r.id],
                                                                                                                                        showButtons: isMyReply && !editing[r.id]
                                                                                                                                      });
                                                                                                                                      return isMyReply && !editing[r.id];
                                                                                                                                    })() && (
                                                                         <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => beginEdit(r)}
                                         className="text-[#999] hover:text-[#666] text-xs px-1 py-1 rounded"
                                  title="댓글 수정"
                                >
                                  수정
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(r.id)}
                                         disabled={commentDeleteLoading[r.id]}
                                         className="text-[#999] hover:text-[#666] text-xs px-1 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="댓글 삭제"
                                >
                                         {commentDeleteLoading[r.id] ? "삭제 중..." : "삭제"}
                                </button>
                              </div>
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

      {/* 자신의 게시글/댓글 좋아요 오류 모달 */}
      <InformationModal
        isOpen={showLikeErrorModal}
        message={likeErrorMessage}
        onClose={() => setShowLikeErrorModal(false)}
      />
    </div>
  );
};

export default PostDetailPage;