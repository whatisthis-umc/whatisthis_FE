import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../../layouts/AdminLayout/AdminLayout";
import { addPhotoIcon, cancelIcon } from "../../../assets";
import add from "/src/assets/add.png";
import { adminPostDetail, type AdminPostDetailResponse } from "../../../api/adminPostDetail";
import { adminPostEdit } from "../../../api/adminPostEdit";
import { uploadService } from "../../../api/uploadApi";
import { subCategoryEnumMap } from "../../../constants/subCategoryEnumMap";
import type { AdminPostEditRequest } from "../../../types/request/adminPost";

const AdminPostEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 상태 관리
  const [post, setPost] = useState<AdminPostDetailResponse["result"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // 폼 상태
  const [imageUrls, setImageUrls] = useState<string[]>([]); // 기존 이미지 URL들
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]); // 새로 업로드할 이미지 파일들
  const [title, setTitle] = useState("");
  const [content1, setContent1] = useState("");
  const [content2, setContent2] = useState("");
  const [tagInputs, setTagInputs] = useState<string[]>([""]);
  const [mainCategory, setMainCategory] = useState("생활꿀팁");
  const [subCategory, setSubCategory] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [uploadingImages, setUploadingImages] = useState(false);

  const subCategoryMap: { [key: string]: string[] } = {
    생활꿀팁: ["조리/주방", "청소/분리수거", "욕실/청결", "세탁/의류관리", "보관/유통기한"],
    생활꿀템: ["자취 필수템", "주방템", "청소템", "살림도구템", "브랜드 꿀템"],
  };

  // 서브카테고리 enum 매핑 (역방향)
  const reverseSubCategoryMap: { [key: string]: string } = {
    'COOK_TIP': '조리/주방',
    'CLEAN_TIP': '청소/분리수거',
    'BATHROOM_TIP': '욕실/청결',
    'CLOTH_TIP': '세탁/의류관리',
    'STORAGE_TIP': '보관/유통기한',
    'SELF_LIFE_ITEM': '자취 필수템',
    'KITCHEN_ITEM': '주방템',
    'CLEAN_ITEM': '청소템',
    'HOUSEHOLD_ITEM': '살림도구템',
    'BRAND_ITEM': '브랜드 꿀템',
  };

  // 게시물 데이터 로드
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
        const postData = response.result;
        setPost(postData);
        
        console.log("받은 게시물 데이터:", postData);
        console.log("hashtags:", postData.hashtags);
        console.log("imageUrls:", postData.imageUrls);
        
        // 폼 데이터 초기화
        setTitle(postData.title);
        
        // 내용을 두 부분으로 분리 (첫 번째 줄바꿈 기준)
        const contentParts = postData.content.split('\n\n');
        setContent1(contentParts[0] || "");
        setContent2(contentParts.slice(1).join('\n\n') || "");
        
        // 해시태그 설정 (안전하게 처리)
        setTagInputs(postData.hashtags && postData.hashtags.length > 0 ? postData.hashtags : [""]);
        
        // 카테고리 설정
        if (postData.category === 'LIFE_TIP') {
          setMainCategory("생활꿀팁");
        } else if (postData.category === 'LIFE_ITEM') {
          setMainCategory("생활꿀템");
        }
        
        // 서브카테고리 설정
        const subCategoryDisplay = reverseSubCategoryMap[postData.subCategory];
        setSubCategory(subCategoryDisplay || "");
        
        // 기존 이미지 URL 설정 (안전하게 처리)
        const validImageUrls = postData.imageUrls?.filter(url => 
          url && url !== 'string' && url.startsWith('http')
        ) || [];
        setImageUrls(validImageUrls);
        
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

  const handleTagChange = (value: string, index: number) => {
    const newTags = [...tagInputs];
    newTags[index] = value;
    setTagInputs(newTags);
  };

  const handleAddTagInput = () => setTagInputs([...tagInputs, ""]);
  
  const handleRemoveTagInput = (index: number) => {
    const newTags = [...tagInputs];
    newTags.splice(index, 1);
    setTagInputs(newTags);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploadingImages(true);
      
      // 이미지 업로드
      const uploadedUrls = await uploadService.uploadImages(files);
      
      // 새 이미지 URL들을 기존 URL에 추가 (클로저 문제 해결)
      setImageUrls(prev => {
        const newUrls = [...prev, ...uploadedUrls];
        // 새 이미지로 포커스
        setCurrentImageIndex(prev.length);
        return newUrls;
      });
      
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setUploadingImages(false);
      // 파일 입력 초기화
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      if (currentImageIndex >= newUrls.length) {
        setCurrentImageIndex(Math.max(0, newUrls.length - 1));
      }
      return newUrls;
    });
  };

  const handleMainCategoryChange = (value: string) => {
    setMainCategory(value);
    setSubCategory("");
  };

  const handleSubmit = async () => {
    if (!post) return;

    try {
      setSubmitting(true);
      
      const content = [content1, content2].filter(Boolean).join("\n\n");
      
      // 이미지 URL 필터링 - 'string' 값과 유효하지 않은 URL 제거
      const validImageUrls = imageUrls.filter(url => 
        url && url !== 'string' && url.startsWith('http')
      );
      
      const payload: AdminPostEditRequest = {
        title,
        content,
        category: mainCategory === "생활꿀팁" ? "LIFE_TIP" : "LIFE_ITEM",
        subCategory: subCategoryEnumMap[subCategory as keyof typeof subCategoryEnumMap],
        imageUrls: validImageUrls, // 필터링된 이미지 URL 배열
        hashtags: tagInputs.filter(tag => tag && tag.trim()),
      };

      console.log("수정할 데이터:", payload);
      console.log("필터링된 이미지 URL들:", validImageUrls);
      
      await adminPostEdit(post.postId, payload);
      alert("게시물이 성공적으로 수정되었습니다.");
      navigate(`/admin/post/${post.postId}`);
      
    } catch (err: any) {
      console.error("게시물 수정 실패:", err);
      alert("게시물 수정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

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
          <div className="text-xl text-red-500">{error || "게시물을 찾을 수 없습니다."}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="w-[1040px] flex px-10 py-2">
        <div className="w-full flex px-10">
          <div className="flex flex-col items-center">
            <div className="w-full mb-6 ml-4">
              <p className="font-[700] text-[32px]">게시글 내용</p>
            </div>
            <div className="w-[500px] h-[500px] bg-gray-100 rounded-4xl flex justify-center items-center overflow-hidden relative">
              {imageUrls.length > 0 ? (
                <>
                  <img
                    src={imageUrls[currentImageIndex]}
                    alt="이미지 미리보기"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <img
                    src={cancelIcon}
                    alt="cancel"
                    onClick={() => handleRemoveImage(currentImageIndex)}
                    className="absolute top-2 right-2 w-6 h-6 cursor-pointer opacity-80 hover:opacity-100"
                  />
                  {currentImageIndex === 0 && (
                    <div className="absolute top-2 left-2 bg-[#0080FF] text-white text-xs px-3 py-2 rounded-4xl !rounded-4xl">
                      대표
                    </div>
                  )}
                  {imageUrls.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 md:gap-3 bg-[#FFFFFF80] bg-opacity-50 px-3 py-1 rounded-4xl">
                      {imageUrls.map((_, idx) => (
                        <div
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-3 h-3 md:w-4 md:h-4 rounded-4xl cursor-pointer ${
                            currentImageIndex === idx
                              ? "bg-[#0080FF]"
                              : "bg-gray-400"
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
            <label
              htmlFor="imageUpload"
              className="mt-4 gap-3 w-[500px] h-[54px] rounded-4xl flex justify-center items-center bg-[#0080FF] text-white text-[20px] cursor-pointer"
            >
              <img src={addPhotoIcon} />
              {uploadingImages ? "업로드 중..." : "파일에서 업로드"}
            </label>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
              disabled={uploadingImages}
            />
          </div>
        </div>

        {/* 입력 폼 */}
        <div className="flex flex-col gap-4 font-[Pretendard] mt-18">
          <div className="flex w-[515px] h-[60px] bg-[#E6E6E6] rounded-4xl p-3">
            <span className="flex w-20 font-semibold justify-center items-center">유형</span>
            <select
              className="w-full"
              value={mainCategory}
              onChange={(e) => handleMainCategoryChange(e.target.value)}
            >
              {Object.keys(subCategoryMap).map((main) => (
                <option key={main} value={main}>{main}</option>
              ))}
            </select>
          </div>

          {mainCategory && (
            <select
              className="w-[515px] h-[60px] bg-[#f0f0f0] rounded-4xl p-3 mt-2"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
            >
              <option value="">서브 카테고리를 선택하세요</option>
              {subCategoryMap[mainCategory].map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          )}

          <input
            type="text"
            placeholder="제목을 입력해주세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-[80px] rounded-4xl border border-[#E6E6E6] p-3"
          />

          <textarea
            placeholder="본문 내용을 입력해주세요. (예: 제품 설명)"
            value={content1}
            onChange={(e) => setContent1(e.target.value)}
            className="border border-[#E6E6E6] p-3 rounded-4xl h-[120px]"
          />

          <textarea
            placeholder="본문 내용을 입력해주세요. (예: 특징, 후기 등)"
            value={content2}
            onChange={(e) => setContent2(e.target.value)}
            className="border border-[#E6E6E6] p-3 rounded-4xl h-[150px]"
          />

          <div className="w-full bg-[#F5FFCC] rounded-4xl px-6 py-4 flex items-center gap-4 flex-wrap">
            <span className="font-semibold">해시태그</span>
            {tagInputs.map((tag, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-3 py-1"
              >
                <span className="text-sm text-[#666666]">#</span>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => handleTagChange(e.target.value, idx)}
                  className="bg-transparent outline-none w-[85px] h-[29px] text-sm text-[#666666]"
                  placeholder="해시태그"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveTagInput(idx)}
                  className="text-gray-600 hover:text-black"
                >
                  <img src={cancelIcon} className="w-[16px] h-[16px]" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddTagInput}
              className="text-2xl font-bold text-gray-600 hover:text-black"
            >
              <img src={add} className="w-[16px] h-[16px]" />
            </button>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-300 text-black px-6 py-2 rounded-4xl"
              disabled={submitting}
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-6 py-2 rounded-4xl"
              disabled={submitting}
            >
              {submitting ? "수정 중..." : "저장"}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPostEditPage;
