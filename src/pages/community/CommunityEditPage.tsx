import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import usePatchCommunity from "../../hooks/mutations/usePatchCommunity";
import {
  getCommunityDetail,
  type UpdateCommunityRequest,
  type UpdateCategory,
} from "../../api/community";
import { addPhotoIcon, cancelIcon, bArrowDown } from "../../assets";

/* ===== 카테고리 옵션 (UI) ===== */
const categoryOptions = [
  "생활꿀팁",
  "꿀템 추천",
  "살까말까?",
  "궁금해요!",
] as const;
type KorCategory = (typeof categoryOptions)[number];

/* ===== API 카테고리 타입 별칭(가독성용) ===== */
type CommunityCategoryUpdate = UpdateCategory;

/* ===== 카테고리 매핑 (서버 ENUM 준수) ===== */
// LIFE_TIP / LIFE_ITEM / BUY_OR_NOT / CURIOUS
const mapToCategoryEnumForUpdate = (kor: string): CommunityCategoryUpdate => {
  switch (kor) {
    case "생활꿀팁":
      return "TIP";
    case "꿀템 추천":
      return "ITEM";
    case "살까말까?":
      return "SHOULD_I_BUY";
    case "궁금해요!":
      return "CURIOUS";
    default:
      return "TIP";
  }
};

// 서버 → UI
const normalize = (s?: string) =>
  String(s ?? "")
    .replace(/[\s_]/g, "")
    .toUpperCase();
const apiToKorCategory = (raw?: string): KorCategory => {
  const k = normalize(raw);
  if (k.includes("LIFETIP") || k.includes("TIP")) return "생활꿀팁";
  if (k.includes("LIFEITEM") || k.includes("ITEM") || k.includes("RECOMMEND"))
    return "꿀템 추천";
  if (k.includes("BUYORNOT") || k.includes("SHOULDIBUY")) return "살까말까?";
  if (k.includes("CURIOUS") || k.includes("QNA") || k.includes("QUESTION"))
    return "궁금해요!";
  return "생활꿀팁";
};

/* ===== content 안에 EXTRA 보존용 ===== */
type ExtraPayload = { features: string[]; source: string };
const EXTRA_RE = /<!--EXTRA:\{[\s\S]*?\}-->/;

function packExtraToContent(
  content: string,
  features: string[],
  source: string
) {
  const trimmed = features.map((f) => f.trim()).filter(Boolean);
  const extra: ExtraPayload = {
    features: trimmed,
    source: (source || "").trim(),
  };
  const marker = `<!--EXTRA:${JSON.stringify(extra)}-->`;
  return EXTRA_RE.test(content)
    ? content.replace(EXTRA_RE, marker)
    : `${content}\n\n${marker}`;
}

function unpackExtraFromContent(content: string): {
  content: string;
  features: string[];
  source: string;
} {
  const m = content.match(EXTRA_RE);
  if (!m) return { content, features: [], source: "" };
  const json = m[0].replace("<!--EXTRA:", "").replace("-->", "");
  try {
    const payload = JSON.parse(json) as ExtraPayload;
    const pure = content.replace(EXTRA_RE, "").trim();
    return {
      content: pure,
      features: payload.features ?? [],
      source: payload.source ?? "",
    };
  } catch {
    return { content, features: [], source: "" };
  }
}

/* ===== 해시태그 추출(상세 응답에서) ===== */
type CommunityDetailLike = {
  title?: string;
  content?: string;
  category?: string;
  postImageUrls?: string[];
  hashtags?: string[];
  hashtagList?: string[];
  hashtagListDto?: { hashtagList: Array<{ content: string }> };
};
const extractHashtags = (d?: CommunityDetailLike) => {
  const a = Array.isArray(d?.hashtags) ? d!.hashtags : [];
  const b = Array.isArray(d?.hashtagList) ? d!.hashtagList : [];
  const c = d?.hashtagListDto?.hashtagList?.map((h) => h.content) ?? [];
  return Array.from(new Set<string>([...a, ...b, ...c].filter(Boolean)));
};

export default function CommunityEditPage() {
  const { postId } = useParams<{ postId: string }>();
  const pid = Number(postId);
  const isValidId = Number.isFinite(pid) && pid > 0;

  const navigate = useNavigate();

  // 상세 불러오기
  const {
    data: detail,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["communityDetail", pid],
    queryFn: () =>
      getCommunityDetail({
        postId: pid,
        page: 1,
        size: 10,
        sort: "LATEST",
      }),
    enabled: isValidId,
  });

  // 로컬 폼 상태
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [category, setCategory] = useState<KorCategory>("생활꿀팁");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [source, setSource] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const featureRef = useRef<HTMLTextAreaElement | null>(null);
  const { mutate: patchMutate, isPending } = usePatchCommunity();

  // 상세 로드 → 폼 채우기
  useEffect(() => {
    if (!detail) return;
    const detailData = detail as Record<string, unknown>;
    setTitle((detailData.title as string) ?? "");
    const {
      content: pure,
      features,
      source,
    } = unpackExtraFromContent((detailData.content as string) ?? "");
    setContent(pure);
    setFeatures(features);
    setSource(source);
    setCategory(apiToKorCategory(detailData.category as string));
    setTags(extractHashtags(detail as CommunityDetailLike));
    setExistingImages((detailData.postImageUrls as string[]) ?? []);
  }, [detail]);

  const isSaveDisabled = !title.trim() || !category || isPending;

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fs = Array.from(e.target.files ?? []);
    if (fs.length) setImages(fs);
  };

  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
  };

  const handleAddFeatureKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const v = featureRef.current?.value?.trim();
      if (v) {
        setFeatures((p) => [...p, v]);
        if (featureRef.current) featureRef.current.value = "";
      }
    }
  };

  const addTag = () => {
    const t = newTag.trim();
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags((p) => [...p, t]);
      setNewTag("");
    }
  };
  const removeTag = (i: number) =>
    setTags((p) => p.filter((_, idx) => idx !== i));

  const handleSubmit = () => {
    if (isSaveDisabled || !isValidId) return;

    // content에 EXTRA 유지
    const contentPacked = packExtraToContent(content, features, source);

    const req: UpdateCommunityRequest = {
      category: mapToCategoryEnumForUpdate(category), // ✅ Update ENUM
      title,
      content: contentPacked,
      hashtags: tags,
    };

    // 원래 방식: 새 이미지가 있으면 전송, 없으면 undefined
    const filesToSend = images.length > 0 ? images : undefined;

    // 디버깅 로그 추가
    console.log("=== 커뮤니티 게시글 수정 요청 ===");
    console.log("postId:", pid);
    console.log("req:", req);
    console.log("이미지 상태 분석:", {
      "기존 이미지 개수": existingImages.length,
      "새 이미지 개수": images.length,
      filesToSend: filesToSend ? `${filesToSend.length}개 파일` : "undefined",
    });
    console.log("req.title length:", req.title.length);
    console.log("req.content length:", req.content.length);
    console.log("req.hashtags:", req.hashtags);

    patchMutate(
      { postId: pid, req, files: filesToSend },
      {
        onSuccess: () => {
          alert("게시글이 수정되었습니다.");
          navigate(`/post/${pid}`);
        },
        onError: (e: unknown) => {
          const error = e as Record<string, unknown>;
          console.error("PATCH failed:", {
            status: error?.status,
            data: error?.data,
            msg: error?.message,
            response: error?.response,
          });
          // 더 자세한 에러 정보 로깅
          if (error?.response) {
            const response = error.response as Record<string, unknown>;
            console.error("Error response:", {
              status: response.status,
              statusText: response.statusText,
              data: response.data,
              headers: response.headers,
            });
          }
          alert((error?.message as string) ?? "수정 중 오류가 발생했습니다.");
        },
      }
    );
  };

  if (!isValidId) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 py-8">
        잘못된 게시글 ID입니다.
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 py-8">로딩 중...</div>
    );
  }
  if (isError || !detail) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 py-8">
        게시글 정보를 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-8 font-[Pretendard]">
      <h1 className="text-[24px] md:text-[32px] font-bold text-[#333] mb-8">
        게시글 수정
      </h1>

      <div className="flex flex-col lg:flex-row gap-[80px]">
                 {/* 이미지 영역 */}
         <div className="flex flex-col items-center gap-4 w-full max-w-[681.76px]">
                      {/* 기존 이미지 미리보기 */}
           {existingImages.length > 0 && (
             <>
               <div className="w-full text-center mb-2">
                 <p className="text-[14px] text-[#FF6B6B] font-medium">
                   📸 현재 게시글의 이미지 (수정 시 다시 첨부 필요)
                 </p>
               </div>
               <div className="w-full grid grid-cols-2 gap-3">
              {existingImages.map((url) => (
                <div
                  key={url}
                  className="relative h-[160px] rounded-[16px] overflow-hidden bg-[#E6E6E6]"
                >
                  <img
                    src={url}
                    alt="old"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(url)}
                    className="absolute top-2 right-2 bg-white/80 rounded-full px-2 py-1 text-[12px]"
                  >
                    숨기기
                                     </button>
                 </div>
               ))}
               </div>
             </>
          )}

          <div className="w-full h-[260px] lg:h-[400px] bg-[#E6E6E6] rounded-[32px] flex justify-center items-center relative overflow-hidden">
            {images.length > 0 ? (
              <>
                <img
                  src={URL.createObjectURL(images[0])}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                <img
                  src={cancelIcon}
                  alt="cancel"
                  onClick={() => setImages([])}
                  className="absolute top-2 right-2 w-6 h-6 cursor-pointer opacity-80 hover:opacity-100"
                />
              </>
            ) : (
              <img
                src={addPhotoIcon}
                alt="upload"
                className="w-[60px] h-[60px] opacity-50"
              />
            )}
          </div>

          <label
            htmlFor="editFileInput"
            className="w-full h-[54px] bg-[#0080FF] text-white rounded-[32px] px-[32px] flex items-center justify-center gap-2 cursor-pointer text-[16px] font-normal hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#99CCFF]"
          >
            <img src={addPhotoIcon} alt="add" className="w-5 h-5" />새 이미지
            업로드
          </label>
          <input
            id="editFileInput"
            type="file"
            accept="image/*"
            onChange={handleFilesChange}
            className="hidden"
          />
                     <p className="text-[12px] text-[#666]">
             ⚠️ 수정 시에는 이미지를 다시 첨부해야 합니다. 새 이미지를 올리지 않으면 기존 이미지가 삭제됩니다.
           </p>
        </div>

        {/* 입력 영역 */}
        <div className="flex flex-col gap-6 w-full max-w/[681.76px]">
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as KorCategory)}
              className="w-full h-[72px] rounded-[32px] border border-[#E6E6E6] px-[24px] pr-[48px] text-[#333] text-[16px] bg-[#E6E6E6] font-bold appearance-none cursor-pointer"
            >
              <option value="" className="font-bold text-[16px]">
                유형
              </option>
              {categoryOptions.map((opt) => (
                <option key={opt} value={opt} className="font-bold text-[16px]">
                  {opt}
                </option>
              ))}
            </select>
            <img
              src={bArrowDown}
              alt="arrow"
              className="pointer-events-none absolute right-[24px] top-1/2 -translate-y-1/2 w-[12px] h-[8px]"
            />
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력해주세요."
            className="text-[24px] font-bold text-[#1d1d1d] placeholder:text-[#3e3e3e] border border-[#E6E6E6] rounded-[32px] px-[24px] py-[12px]"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="본문 내용을 입력해주세요."
            className="border border-[#E6E6E6] rounded-[32px] px-[24px] py-[24px] text-[16px] font-normal text-[#333] min-h-[220px]"
          />

          <div className="border border-[#E6E6E6] rounded-[32px] px-[24px] py-[24px] text-[#333] text-[16px] leading-[2] whitespace-pre-wrap">
            <div className="font-bold mb-2">주요 특징</div>
            {features.map((f, idx) => (
              <div key={idx}>
                특징 {idx + 1}. {f}
              </div>
            ))}
            <textarea
              ref={featureRef}
              onKeyDown={handleAddFeatureKey}
              placeholder="특징 입력 후 엔터를 누르세요."
              className="w-full mt-4 border border-[#E6E6E6] rounded-[24px] px-4 py-3 outline-none"
            />
          </div>

          <div className="border border-[#E6E6E6] rounded-[32px] px-[24px] py-[24px] h-[72px] flex items-center">
            <label className="text-[#333] font-medium mr-4 min-w-[40px]">
              출처
            </label>
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="내용을 입력해주세요."
              className="w-full bg-transparent outline-none placeholder:text-[#999] text-[16px]"
            />
          </div>

          <div className="w-full bg-[#F5FFCC] rounded-[32px] px-[24px] py-[16px]">
            <label className="text-[14px] font-medium text-[#333] mb-2 block">
              해시태그
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag, idx) => (
                <div
                  key={idx}
                  className="flex items-center bg-[#CCE5FF] rounded-[32px] px-[12px] py-[4px] gap-[4px]"
                >
                  <span className="text-[14px] text-[#999]">#{tag}</span>
                  <img
                    src={cancelIcon}
                    alt="delete"
                    onClick={() => removeTag(idx)}
                    className="w-4 h-4 cursor-pointer hover:opacity-100 opacity-80"
                  />
                </div>
              ))}
              {tags.length < 5 && (
                <>
                  <input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="# 해시태그 입력 (최대 5개)"
                    className="bg-[#CCE5FF] text-[14px] text-[#666] px-[12px] py-[4px] rounded-[32px] outline-none"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="text-[#0080FF] text-sm font-normal px-3 py-1 border border-[#0080FF] rounded-full cursor-pointer hover:opacity-90"
                  >
                    +
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center w-[160px] h-[54px] rounded-[32px] px-[16px] py-[12px] text-[16px] font-normal bg-[#0080FF] text-white cursor-pointer hover:opacity-90"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaveDisabled}
              className="inline-flex items-center justify-center w-[160px] h-[54px] rounded-[32px] px-[16px] py-[12px] text-[16px] font-normal bg-[#0080FF] text-white cursor-pointer hover:opacity-90 disabled:opacity-50"
            >
              수정
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
