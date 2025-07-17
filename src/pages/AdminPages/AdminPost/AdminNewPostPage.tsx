import React, { useState } from "react";
import AdminLayout from "../../../layouts/AdminLayout/AdminLayout";
import photo from "/src/assets/add_photo.png";
import cancel from "/src/assets/cancel.png";
import add from "/src/assets/add.png";

const AdminNewPostPage = () => {
  const [image, setImage] = useState<File | null>(null);
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content1, setContent1] = useState("");
  const [content2, setContent2] = useState("");
  const [tagInputs, setTagInputs] = useState([""]);
  const [tags, setTags] = useState<string[]>([]);
  const subCategoryMap: { [key: string]: string[] } = {
    생활꿀팁: [
      "조리/주방",
      "청소/분리수거",
      "욕실/청결",
      "세탁/의류관리",
      "보관/유통기한",
    ],
    생활꿀템: ["자취 필수템", "주방템", "청소템", "살림도구템", "브랜드 꿀템"],
  };
  const handleMainCategoryChange = (value: string) => {
    setMainCategory(value);
    setSubCategory("");
    setCategory("");
  };

  const handleSubCategoryChange = (value: string) => {
    setSubCategory(value);
    setCategory(value);
  };

  const handleTagChange = (value: string, index: number) => {
    const newTags = [...tagInputs];
    newTags[index] = value;
    setTagInputs(newTags);
  };

  const handleAddTagInput = () => {
    setTagInputs([...tagInputs, ""]);
  };

  const handleRemoveTagInput = (index: number) => {
    const newTags = [...tagInputs];
    newTags.splice(index, 1);
    setTagInputs(newTags);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = () => {
    const description = [content1, content2].filter(Boolean).join("\n\n");

    const newPost = {
      id: Date.now(),
      category,
      hashtag: tagInputs,
      imageUrl: image ? URL.createObjectURL(image) : "",
      title,
      description,
      views: 0,
      scraps: 0,
      date: new Date(),
      type: "items" as const,
    };

    console.log("제출할 데이터:", newPost);
    alert("게시물이 등록되었습니다. (콘솔 확인)");

    // 여기에 실제 API 연결
  };

  return (
    <AdminLayout>
      <div className=" w-[1040px] flex px-10 py-2">
        <div className="w-full flex px-10">
          <div className="flex flex-col items-center">
            <div className="w-full mb-6 ml-4">
              <p className="font-[700] text-[32px]">게시글 내용</p>
            </div>
            <div className="w-[500px] h-[500px] bg-gray-100 rounded-4xl flex justify-center items-center overflow-hidden">
              {image && (
                <img
                  src={URL.createObjectURL(image)}
                  alt="미리보기"
                  className="w-full h-full object-cover rounded-xl"
                />
              )}
            </div>
            <label
              htmlFor="imageUpload"
              className="mt-4 gap-3 w-[500px] h-[54px] rounded-4xl flex justify-center items-center bg-[#0080FF] text-white text-[20px] cursor-pointer "
            >
              <img src={photo}></img>
              파일에서 업로드
            </label>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        {/* 입력 폼 */}
        <div className="flex flex-col gap-4 font-[Pretendard] mt-18 ">
          <div className="flex w-[515px] h-[60px] bg-[#E6E6E6] rounded-4xl p-3">
            <span className="flex w-20 font-semibold justify-center items-center">
              유형
            </span>
            <select
              className="w-full"
              value={mainCategory}
              onChange={(e) => handleMainCategoryChange(e.target.value)}
            >
              <option value="">메인 카테고리를 선택하세요</option>
              {Object.keys(subCategoryMap).map((main) => (
                <option key={main} value={main}>
                  {main}
                </option>
              ))}
            </select>
          </div>
          {mainCategory && (
            <select
              className="w-[515px] h-[60px] bg-[#f0f0f0] rounded-4xl p-3 mt-2"
              value={subCategory}
              onChange={(e) => handleSubCategoryChange(e.target.value)}
            >
              <option value="">서브 카테고리를 선택하세요</option>
              {subCategoryMap[mainCategory].map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
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
            className="border  border-[#E6E6E6] p-3 rounded-4xl h-[120px]"
          />
          <textarea
            placeholder="본문 내용을 입력해주세요. (예: 특징, 후기 등)"
            value={content2}
            onChange={(e) => setContent2(e.target.value)}
            className="border  border-[#E6E6E6] p-3 rounded-4xl h-[150px]"
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
                  <img src={cancel} className="w-[16px] h-[16px]"></img>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddTagInput}
              className="text-2xl font-bold text-gray-600 hover:text-black"
            >
              <img src={add} className="w-[16px] h-[16px]"></img>
            </button>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => {
                setCategory("");
                setTitle("");
                setContent1("");
                setContent2("");

                setTags([]);
                setImage(null);
              }}
              className="bg-blue-500 text-white px-6 py-2 rounded-4xl"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-6 py-2 rounded-4xl"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminNewPostPage;
