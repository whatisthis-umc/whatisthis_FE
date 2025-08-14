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
import SortDropdown, { type SortAPIType } from "../components/common/SortDropdown";

import useGetCommunityDetail from "../hooks/queries/useGetCommunityDetail";
import useCreateComment from "../hooks/queries/useCreateComment";
import { useLikePost, useUnlikePost } from "../hooks/mutations/usePostLike";
import useReportPost from "../hooks/mutations/useReportPost";
import useReportComment from "../hooks/mutations/useReportComment";

import { createComment as createCommentApi } from "../api/comments";

// ===== 타입 =====
type RawComment = {
  id: number;
  content: string;
  nickname: string;
  profileimageUrl?: string;
  createdAt: string;
  likeCount: number;
  commentCount?: number;
  isAuthor?: boolean;
  parentCommentId?: number | null;
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

  // 신고한 게시물/댓글 ID를 localStorage에 저장하여 재방문 시에도 방지
  // localStorage에서 신고한 게시물 목록 가져오기
  const getReportedPosts = () => {
    try {
      const reportedPostsStr = localStorage.getItem("reportedPosts");
      return reportedPostsStr ? JSON.parse(reportedPostsStr) : [];
    } catch {
      return [];
    }
  };

  // localStorage에서 신고한 댓글 목록 가져오기
  const getReportedComments = () => {
    try {
      const reportedCommentsStr = localStorage.getItem("reportedComments");
      return reportedCommentsStr ? JSON.parse(reportedCommentsStr) : [];
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

  // localStorage에 신고한 댓글 추가
  const addReportedComment = (commentId: number) => {
    try {
      const reportedComments = getReportedComments();
      if (!reportedComments.includes(commentId)) {
        reportedComments.push(commentId);
        localStorage.setItem("reportedComments", JSON.stringify(reportedComments));
      }
    } catch (error) {
      console.error("localStorage 저장 실패:", error);
    }
  };

  // 같은 세션에서 재신고 방지(로컬)
  const [reportedPost, setReportedPost] = useState(() => {
    return getReportedPosts().includes(postId);
  });
  const [reportedComments, setReportedComments] = useState<Set<number>>(() => {
    const reportedCommentIds = getReportedComments();
    return new Set(reportedCommentIds);
  });

  // postId가 변경될 때마다 신고 상태 업데이트
  useEffect(() => {
    setReportedPost(getReportedPosts().includes(postId));
  }, [postId]);

  // 댓글 정렬/페이지
  const [sortType, setSortType] = useState<SortAPIType>("BEST");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 입력 상태
  const [newComment, setNewComment] = useState(""); // 최상위
  const [openReplyBoxes, setOpenReplyBoxes] = useState<Set<number>>(new Set()); // 열려있는 대댓글 입력창
  const [replyInputs, setReplyInputs] = useState<Record<number, string>>({}); // 각 댓글별 대댓글 입력값

  // ----- 서버 데이터 -----
  const { data, isLoading, isError } = useGetCommunityDetail({
    postId,
    page: currentPage,
    size: pageSize,
    sort: sortType,
  });

  // 모든 훅은 가드 리턴보다 위에서 한 번만 호출
  const createTopCommentM = useCreateComment(postId);
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

  // 이미지/해시태그 맵핑(두 응답 포맷 모두 대응)
  const imageUrls: string[] =
    detail.imageUrls ??
    detail.result?.imageListDto?.imageList?.map((i: any) => i.url) ??
    [];
  const hashtags: string[] =
    detail.hashtags ??
    detail.result?.hashtagListDto?.hashtagList?.map((h: any) => h.content) ??
    [];

  // 댓글 리스트 원본(두 포맷 대응)
  const rawList: RawComment[] = useMemo(() => {
    const v1 = detail.commentPage?.list;
    const v2 = detail.result?.commentListDto?.commentList;
    const base = Array.isArray(v1) ? v1 : Array.isArray(v2) ? v2 : [];
    return base.map((c: any) => ({
      id: c.id,
      content: c.content,
      nickname: c.nickname,
      profileimageUrl: c.profileimageUrl,
      createdAt: c.createdAt,
      likeCount: c.likeCount ?? 0,
      commentCount: c.commentCount ?? 0,
      isAuthor: c.isAuthor ?? false,
      parentCommentId: c.parentCommentId ?? null,
    }));
  }, [detail]);

  // 1-레벨 트리(최상위 + 그 자식들)
  const tree: CommentTree[] = useMemo(() => {
    const byParent: Record<string, RawComment[]> = {};
    for (const c of rawList) {
      const key = String(c.parentCommentId ?? 0);
      if (!byParent[key]) byParent[key] = [];
      byParent[key].push(c);
    }
    const top = byParent["0"] || byParent["null"] || [];
    return top.map((t) => ({
      ...t,
      replies: byParent[String(t.id)] ?? [],
    }));
  }, [rawList]);

  const totalPages = useMemo(
    () => Math.max(1, detail?.commentPage?.totalPage ?? detail?.result?.commentListDto?.totalPage ?? 1),
    [detail]
  );

  // ----- 핸들러 -----
  // ✅ 두 번 눌러도 바로 취소되는 토글 핸들러 (낙관적 토글 + 최신 응답만 반영)
  const handleToggleLike = () => {
    const opId = ++likeOpRef.current; // 이번 토글의 고유 id
    const nextLiked = !liked;

    // 1) 낙관적 업데이트
    setLiked(nextLiked);
    setLikeCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)));

    // 2) 서버 호출 (최신 op만 결과 반영)
    const action = nextLiked ? likeM : unlikeM;
    action.mutate(undefined, {
      onSuccess: (res: any) => {
        if (likeOpRef.current !== opId) return; // 최신 토글이 아니면 무시
        const serverLiked =
          typeof res?.liked === "boolean" ? res.liked : nextLiked;
        const serverCount =
          typeof res?.likeCount === "number" ? res.likeCount : undefined;

        setLiked(serverLiked);
        if (typeof serverCount === "number") setLikeCount(Math.max(0, serverCount));
      },
      onError: (e: any) => {
        if (likeOpRef.current !== opId) return; // 최신 토글이 아니면 무시
        // 실패 시 낙관적 업데이트 롤백
        setLiked(!nextLiked);
        setLikeCount((c) => Math.max(0, c + (nextLiked ? -1 : 1)));
        alert(e?.message ?? (nextLiked ? "좋아요 실패" : "좋아요 해제 실패"));
      },
    });
  };

  // 최상위 댓글 등록
  const handleSubmitTopComment = (e?: React.FormEvent) => {
    e?.preventDefault();
    const content = newComment.trim();
    if (!content) return;

    createTopCommentM.mutate(
      { content },
      {
        onSuccess: async () => {
          setNewComment("");
          await queryClient.invalidateQueries({
            queryKey: ["communityDetail", postId, currentPage, sortType],
          });
        },
        onError: (err) => {
          console.error("댓글 작성 실패:", err);
          alert("댓글 작성에 실패했습니다.");
        },
      }
    );
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

  // 대댓글 등록
  const submitReply = async (parentId: number) => {
    const content = (replyInputs[parentId] ?? "").trim();
    if (!content) return;

    try {
      await createCommentApi(postId, { content, parentCommentId: parentId });
      setReplyInputs((m) => ({ ...m, [parentId]: "" }));
      await queryClient.invalidateQueries({
        queryKey: ["communityDetail", postId, currentPage, sortType],
      });
    } catch (e: any) {
      console.error("대댓글 작성 실패:", e);
      alert(e?.message ?? "대댓글 작성에 실패했습니다.");
    }
  };

  // 신고 모달 제출
  const handleReportSubmit = (form: { content: string; description: string | null }) => {
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
            addReportedComment(selectedCommentId); // localStorage에 저장
            setShowReportModal(false);
          },
          onError: (e: any) => {
            console.error("댓글 신고 실패:", e);
            if (e?.status === 409 || e?.code === "ALREADY_REPORTED") {
              alert("이미 신고된 댓글입니다.");
              setReportedComments((prev) => new Set(prev).add(selectedCommentId));
              addReportedComment(selectedCommentId); // localStorage에 저장
            } else if (e?.status === 500) {
              alert("이미 신고한 댓글이거나 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
            } else {
              alert(e?.message ?? "신고 처리에 실패했습니다.");
            }
          },
        }
      );
    }
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
        <span className="text-gray-500 text-sm">{detail.createdAt ?? detail.result?.createdAt}</span>
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
            <SortDropdown defaultValue={sortType} onChange={(v: SortAPIType) => setSortType(v)} />
          </div>
        </div>

        {/* 입력줄 (최상위 댓글) */}
        <form onSubmit={handleSubmitTopComment} className="w-full grid grid-cols-[1fr_auto] items-center gap-3 mb-8">
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
            disabled={!newComment.trim() || createTopCommentM.isPending}
            className="justify-self-end
                       w-[84px] h-[44px] rounded-[28px] px-3 py-2 text-[16px]
                       sm:w-[98px] sm:h-[54px] sm:rounded-[32px] sm:px-4 sm:py-3 sm:text-[20px]
                       bg-[#0080FF] text-white font-medium leading-[150%] tracking-[-0.02em]
                       whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createTopCommentM.isPending ? "등록중…" : "입력"}
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
                        {/* 대댓글 수(없으면 0) */}
                        {c.replies?.length ?? 0}
                      </button>
                    </div>

                    {/* 대댓글 입력칸 (요청 레이아웃 적용) */}
                    {openReplyBoxes.has(c.id) && (
                      <div
                        className="
                          mt-3
                          grid grid-cols-[1fr_auto]
                          items-center
                          gap-5               /* gap: 20px */
                          w-full sm:w-[1240px] /* width: 1240 */
                          opacity-100         /* opacity: 1 */
                        "
                      >
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

                        {/* 최상위 '입력' 버튼과 동일 사이즈 */}
                        <button
                          type="button"
                          onClick={() => submitReply(c.id)}
                          disabled={!(replyInputs[c.id] ?? "").trim()}
                          className="
                            justify-self-end
                            w-[84px] h-[44px] rounded-[28px] px-3 py-2 text-[16px]
                            sm:w-[98px] sm:h-[54px] sm:rounded-[32px] sm:px-4 sm:py-3 sm:text-[20px]
                            bg-[#0080FF] text-white font-medium leading-[150%] tracking-[-0.02em]
                            whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed
                          "
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
          <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>
            <img src={arrowLeft} alt="prev" className="w-6 h-6" />
          </button>
          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`text-sm ${currentPage === page ? "text-[#333] font-bold" : "text-[#999]"}`}
              >
                {page}
              </button>
            );
          })}
          <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}>
            <img src={arrowRight} alt="next" className="w-6 h-6" />
          </button>
        </div>
      </div>

      {showReportModal && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          targetType={selectedTarget}
          onSubmit={handleReportSubmit}
        />
      )}
    </div>
  );
};

export default PostDetailPage;