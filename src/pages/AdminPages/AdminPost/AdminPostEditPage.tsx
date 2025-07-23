import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../../layouts/AdminLayout/AdminLayout";
import { dummyPosts3 } from "../../../data/dummyPosts3";
import { addPhotoIcon, cancelIcon } from "../../../assets";
import add from "/src/assets/add.png";

const AdminPostEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = dummyPosts3.find((p) => p.id === Number(id));

  const [image, setImage] = useState<File | null>(null);
  const [title, setTitle] = useState(post?.title || "");
  const [content1, setContent1] = useState(post?.content || "");
  const [content2, setContent2] = useState(post?.content2 || "");
  const [tagInputs, setTagInputs] = useState<string[]>(post?.tags || [""]);
  const [mainCategory, setMainCategory] = useState("생활꿀팁");
  const [subCategory, setSubCategory] = useState(post?.category || "");

  const subCategoryMap: { [key: string]: string[] } = {
    생활꿀팁: ["조리/주방", "청소/분리수거", "욕실/청결", "세탁/의류관리", "보관/유통기한"],
    생활꿀템: ["자취 필수템", "주방템", "청소템", "살림도구템", "브랜드 꿀템"],
  };

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImage(file);
  };

  const handleMainCategoryChange = (value: string) => {
    setMainCategory(value);
    setSubCategory("");
  };

  const handleSubmit = () => {
    const updatedPost = {
      id: post?.id,
      title,
      content: [content1, content2].filter(Boolean).join("\n\n"),
      tags: tagInputs,
      imageUrl: image ? URL.createObjectURL(image) : post?.imageUrl || "",
      category: subCategory,
    };

    console.log("수정된 데이터:", updatedPost);
    alert("수정이 완료되었습니다. (콘솔 확인)");
    navigate("/admin/post");
  };

  if (!post) return <div className="p-10 text-xl">존재하지 않는 게시글입니다.</div>;

  return (
    <AdminLayout>
      <div className="w-[1040px] flex px-10 py-2">
        <div className="w-full flex px-10">
          <div className="flex flex-col items-center">
            <div className="w-full mb-6 ml-4">
              <p className="font-[700] text-[32px]">게시글 내용</p>
            </div>
            <div className="w-[500px] h-[500px] bg-gray-100 rounded-4xl flex justify-center items-center overflow-hidden">
              {(image || post.imageUrl) && (
                <img
                  src={image ? URL.createObjectURL(image) : post.imageUrl}
                  alt="미리보기"
                  className="w-full h-full object-cover rounded-xl"
                />
              )}
            </div>
            <label
              htmlFor="imageUpload"
              className="mt-4 gap-3 w-[500px] h-[54px] rounded-4xl flex justify-center items-center bg-[#0080FF] text-white text-[20px] cursor-pointer "
            >
              <img src={addPhotoIcon} />
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

export default AdminPostEditPage;
