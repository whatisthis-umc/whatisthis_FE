import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePostCommunity from "../../hooks/mutations/usePostCommunity";
import { addPhotoIcon, cancelIcon, bArrowDown } from "../../assets";

const categoryOptions = ["생활꿀팁", "꿀템 추천", "살까말까?", "궁금해요!"];

// 작성 API는 대문자 ENUM을 요구
const mapToCategoryEnumForCreate = (
  kor: string
): "TIP" | "ITEM" | "SHOULD_I_BUY" | "CURIOUS" => {
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

const CommunityPostPage = () => {
  const navigate = useNavigate();

  const [image, setImage] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [source, setSource] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const featureRef = useRef<HTMLTextAreaElement | null>(null);
  const { mutate, isPending } = usePostCommunity();

  const actionBtnClass =
    "inline-flex items-center justify-center w-[160px] h-[54px] " +
    "rounded-[32px] px-[16px] py-[12px] text-[16px] font-medium " +
    "bg-[#0080FF] text-white " +
    "cursor-pointer transition " +
    "hover:opacity-90 active:scale-[0.99] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#99CCFF] " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImage(file);
  };

  const handleFeatureKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = featureRef.current?.value?.trim();
      if (value) {
        setFeatures((prev) => [...prev, value]);
        if (featureRef.current) featureRef.current.value = "";
      }
    }
  };

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags((prev) => [...prev, trimmed]);
      setNewTag("");
    }
  };
  const handleDeleteTag = (index: number) => {
    const updated = [...tags];
    updated.splice(index, 1);
    setTags(updated);
  };

  const isSaveDisabled = !title.trim() || !category.trim() || isPending;

  const handleSave = () => {
    if (!title.trim() || !category.trim() || isPending) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
      navigate("/login");
      return;
    }

    const draft = {
      category: mapToCategoryEnumForCreate(category),
      title,
      content,
      hashtags: tags,
    } as const;

    mutate(
      { draft, files: image ? [image] : [] },
      {
        onSuccess: () => alert("게시글 작성 완료!"),
        onError: (e: any) => {
          console.error("작성 실패", e?.response?.data ?? e);
          alert(e?.response?.data?.message ?? e?.message ?? "오류가 발생했습니다.");
        },
      }
    );
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-8 font-[Pretendard]">
      <div className="flex flex-col lg:flex-row gap-[80px]">
        <div className="flex flex-col items-center gap-4 w-full max-w-[681.76px]">
          <div className="w-full h-[260px] lg:h-[681.76px] bg-[#E6E6E6] rounded-[32px] flex justify-center items-center relative overflow-hidden">
            {image ? (
              <>
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                <img
                  src={cancelIcon}
                  alt="cancel"
                  onClick={() => setImage(null)}
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
            htmlFor="fileInput"
            className="w-full h-[54px] bg-[#0080FF] text-white rounded-[32px] px-[32px] flex items-center justify-center gap-2 cursor-pointer text-[16px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#99CCFF] hover:opacity-90"
          >
            <img src={addPhotoIcon} alt="add" className="w-5 h-5" />
            파일에서 업로드
          </label>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="flex flex-col gap-6 w-full max-w-[681.76px]">
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
            className="border border-[#E6E6E6] rounded-[32px] px-[24px] py-[24px] text-[16px] font-normal text-[#333] min-h-[200px]"
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
              onKeyDown={handleFeatureKeyDown}
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
                    onClick={() => handleDeleteTag(idx)}
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
                        handleAddTag();
                      }
                    }}
                    placeholder="# 해시태그 입력 (최대 5개)"
                    className="bg-[#CCE5FF] text-[14px] text-[#666] px-[12px] py-[4px] rounded-[32px] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="text-[#0080FF] text-sm font-medium px-3 py-1 border border-[#0080FF] rounded-full cursor-pointer hover:opacity-90"
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
              className={actionBtnClass}
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={actionBtnClass}
              disabled={isSaveDisabled}
            >
              게시
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPostPage;