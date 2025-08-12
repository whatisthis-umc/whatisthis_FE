import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminLayout from "../../../layouts/AdminLayout/AdminLayout";
import {
  adminPostDetail,
  type AdminPostDetailResponse,
} from "../../../api/adminPostDetail";

export default function AdminPostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<AdminPostDetailResponse["result"] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchPostDetail = async () => {
      if (!id) {
        setError("게시물 ID가 없습니다.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await adminPostDetail(Number(id));
        setPost(response.result);
      } catch (err: any) {
        console.error("게시물 상세 조회 실패:", err);
        if (err.response?.status === 404) {
          setError("존재하지 않는 게시물입니다.");
        } else if (err.response?.status === 403) {
          setError("접근 권한이 없습니다.");
        } else {
          setError("게시물을 불러오는데 실패했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetail();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="w-[1040px] px-10 py-8 flex justify-center items-center">
          <div className="text-xl">로딩 중...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !post) {
    return (
      <AdminLayout>
        <div className="w-[1040px] px-10 py-8 flex justify-center items-center">
          <div className="text-xl text-red-500">
            {error || "게시물을 찾을 수 없습니다."}
          </div>
        </div>
      </AdminLayout>
    );
  }

  // 카테고리 표시 텍스트 변환
  const getCategoryDisplayText = (category: string) => {
    switch (category) {
      case "LIFE_TIP":
        return "생활꿀팁";
      case "LIFE_ITEM":
        return "생활꿀템";
      default:
        return category;
    }
  };

  // 서브카테고리 표시 텍스트 변환
  const getSubCategoryDisplayText = (subCategory: string) => {
    const subCategoryMap: { [key: string]: string } = {
      COOK_TIP: "조리/주방",
      CLEAN_TIP: "청소/분리수거",
      BATHROOM_TIP: "욕실/청결",
      CLOTH_TIP: "세탁/의류관리",
      STORAGE_TIP: "보관/유통기한",
      SELF_LIFE_ITEM: "자취 필수템",
      KITCHEN_ITEM: "주방템",
      CLEAN_ITEM: "청소템",
      HOUSEHOLD_ITEM: "살림도구템",
      BRAND_ITEM: "브랜드 꿀템",
    };
    return subCategoryMap[subCategory] || subCategory;
  };

  return (
    <AdminLayout>
      <div className="w-[1040px] px-10 py-8 flex font-[Pretendard]">
        {/* 왼쪽: 이미지 영역 */}
        <div className="w-[1000px] h-[500px] bg-[#E6E6E6] rounded-[32px] flex justify-center items-center relative">
          {post.imageUrls && post.imageUrls.length > 0 ? (
            <>
              <img
                src={post.imageUrls[currentImageIndex]}
                alt="게시글 이미지"
                className="w-full h-full object-cover rounded-[32px]"
              />
              {/* 이미지 인디케이터 (하단 점) */}
              {post.imageUrls.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-[#FFFFFF80] bg-opacity-50 px-4 py-1 rounded-full">
                  {post.imageUrls.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-3 h-3 rounded-full cursor-pointer ${
                        currentImageIndex === idx
                          ? "bg-[#0080FF]"
                          : "bg-[#888888]"
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <span className="text-[#999999]">이미지 없음</span>
          )}
        </div>

        {/* 오른쪽: 게시글 정보 */}
        <div className="ml-12 flex flex-col justify-between w-full">
          {/* 상단 정보 */}
          <div>
            {/* 제목 */}
            <div className="flex items-center gap-2 mb-2">
              <p className="text-[24px] font-bold text-[#333333]">
                {post.title}
              </p>
              <div className="bg-[#E6F0FF] text-[#0080FF] px-2 py-1 rounded-full text-sm font-semibold">
                #{getCategoryDisplayText(post.category)}
              </div>
              <div className="bg-[#F0F0F0] text-[#666666] px-2 py-1 rounded-full text-sm">
                {getSubCategoryDisplayText(post.subCategory)}
              </div>
            </div>

            {/* 본문 내용 */}
            <p className="text-[#333333] text-base leading-relaxed whitespace-pre-line mb-4">
              {post.content}
            </p>

            {/* 해시태그 */}
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-[#F5FFCC] text-[#666666] px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 생성일 */}
            <div className="text-[#999999] text-sm mb-4">
              생성일: {new Date(post.createdAt).toLocaleDateString("ko-KR")}
            </div>
          </div>

          {/* 수정 버튼 */}
          <div className="w-full flex justify-end mt-2">
            <button
              className="bg-[#0080FF] text-white text-[18px] rounded-3xl px-8 py-2"
              onClick={() => navigate(`/admin/post/edit/${post.postId}`)}
            >
              수정
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
