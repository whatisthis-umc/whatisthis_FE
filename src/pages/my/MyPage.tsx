import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { eye, like, commentIcon } from "../../assets";
import useMyPosts from "../../hooks/queries/useMyPosts";
import useMyInquiries from "../../hooks/queries/useMyInquiries";
import useDeleteMyPost from "../../hooks/mutations/useDeleteMyPost";
import useDeleteMyInquiry from "../../hooks/mutations/useDeleteMyInquiry";
import useMyAccount from "../../hooks/queries/useMyAccount";
import Pagination from "../../components/customer/Pagination";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";
import type {
  InquiryStatus,
  MyPostItem,
  MyInquiryItem,
} from "../../api/mypage";

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

  // ✅ 계정(프로필) — 목록과 독립
  const { data: account } = useMyAccount();

  // 데이터
  const { data: postData } = useMyPosts(postPage, pageSize);
  const { data: inqData } = useMyInquiries(inqPage, pageSize);

  // 항상 배열로 안전화 (빈 데이터/로딩/에러 모두 대비)
  const posts: MyPostItem[] = Array.isArray(postData?.posts) ? postData!.posts : [];
  const inquiries: MyInquiryItem[] = Array.isArray(inqData?.inquiries) ? inqData!.inquiries : [];

  // 삭제 뮤테이션
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
        if ((postData?.posts?.length ?? 0) === 1 && postPage > 1) {
          setPostPage((p) => p - 1);
        }
      } else {
        await deleteInqMut.mutateAsync(deleteTarget.id);
        if ((inqData?.inquiries?.length ?? 0) === 1 && inqPage > 1) {
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

  // 다음 페이지 존재 여부(총 개수 없음 → size 기준)
  const hasNextPosts = posts.length === pageSize;
  const hasNextInq = inquiries.length === pageSize;

  // 숫자 페이징용 임시 totalPages (총 개수 API 나오면 교체)
  const postTotalPages = Math.max(1, postPage + (hasNextPosts ? 1 : 0));
  const inqTotalPages = Math.max(1, inqPage + (hasNextInq ? 1 : 0));

  // 탭 전환 시 페이지 초기화
  useEffect(() => {
    if (tab === "나의 작성내역") setPostPage(1);
    else setInqPage(1);
  }, [tab]);

  // 문의 아코디언: 펼친 항목 id들
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const toggleInq = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-8 font-[Pretendard]">
      {/* 상단 제목 */}
      <h1 className="text-[24px] md:text-[32px] font-bold text-[#333] mb-10">
        마이페이지
      </h1>

      {/* ✅ 프로필 — 글/문의 유무와 무관하게 항상 표시 */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-[80px] h-[80px] rounded-full bg-[#D9D9D9] overflow-hidden">
          {account?.profileImage && (
            <img
              src={account.profileImage}
              alt="profile"
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 w-full justify-between">
          <div>
            <p className="text-[18px] sm:text-[20px] font-bold">
              {account?.nickname || "닉네임"}
            </p>
            <p className="text-[14px] text-[#999]">
              {account?.email || "이메일"}
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
              tab === type ? "bg-[#333333] text-white" : "bg-[#F5F5F5] text-[#999]"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* 컨텐츠 */}
      {tab === "나의 작성내역" ? (
        // ===== 작성내역 =====
        <div className="flex flex-col gap-6">
          {posts.length === 0 ? (
            <div className="text-center text-[#999] text-[14px] mt-10">
              게시물이 없습니다.
            </div>
          ) : (
            posts.map((item) => (
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

                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[12px] border border-[#CCCCCC] rounded-full px-3 py-1">
                      {item.category}
                    </span>
                  </div>
                  <div className="mt-1">
                    <div className="text-[18px] sm:text-[20px] font-bold truncate w-full">
                      {item.title}
                    </div>
                    <div className="text-[14px] sm:text-[16px] text-[#666] line-clamp-2">
                      {item.content}
                    </div>
                  </div>
                  <div className="flex gap-4 mt-3 text-[#999] text-[14px] flex-wrap">
                    <span>{item.nickname}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1">
                      <img src={eye} alt="views" className="w-4 h-4" />
                      {item.viewCount}
                    </div>
                    <div className="flex items-center gap-1">
                      <img src={like} alt="likes" className="w-4 h-4" />
                      {item.likeCount}
                    </div>
                    <div className="flex items-center gap-1">
                      <img src={commentIcon} alt="comments" className="w-4 h-4" />
                      {item.commentCount}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* 숫자형 페이지네이션 (작성내역) */}
          <Pagination
            currentPage={postPage}
            totalPages={postTotalPages}
            onPageChange={(p) => setPostPage(p)}
          />
        </div>
      ) : (
        // ===== 나의 문의내역 (아코디언) =====
        <div className="flex flex-col gap-6">
          {inquiries.length === 0 ? (
            <div className="text-center text-[#999] text-[14px] mt-10">
              게시물이 없습니다.
            </div>
          ) : (
            inquiries.map((q) => {
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
                    {/* 우측 편집 액션 */}
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
                      {new Date(q.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* 펼침 영역: Q/A 블록 */}
                  {open && (
                    <div className="flex flex-col gap-3">
                      {/* Q 블록 */}
                      <div className="rounded-[24px] border border-[#E6E6E6] bg-white px-5 py-4">
                        <div className="inline-block text-[12px] px-2 py-[2px] rounded-[999px] bg-[#E6E6E6] text-[#444] mb-2">
                          질문
                        </div>
                        <div className="text-[15px] text-[#333] whitespace-pre-wrap">
                          {q.title}
                        </div>
                      </div>

                      {/* A 블록 (샘플) */}
                      <div className="rounded-[24px] border border-[#E6E6E6] bg-white px-5 py-4">
                        <div className="inline-block text-[12px] px-2 py-[2px] rounded-[999px] bg-[#E6E6E6] text-[#444] mb-2">
                          답변
                        </div>
                        <div className="text-[15px] text-[#333] whitespace-pre-wrap">
                          {statusLabel(q.status) === "답변완료"
                            ? "답변이 등록되었습니다. (상세 API에서 본문 붙이기)"
                            : "아직 답변이 등록되지 않았습니다."}
                        </div>
                        <div className="text-[12px] text-[#999] mt-3">
                          {new Date(q.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* 숫자형 페이지네이션 (문의내역) */}
          <Pagination
            currentPage={inqPage}
            totalPages={inqTotalPages}
            onPageChange={(p) => setInqPage(p)}
          />
        </div>
      )}

      {/* 삭제 확인 모달 (게시글/문의 공용) */}
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