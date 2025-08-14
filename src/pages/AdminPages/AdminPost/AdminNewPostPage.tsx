import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AdminLayout from "../../../layouts/AdminLayout/AdminLayout";
import { addPhotoIcon, cancelIcon } from "../../../assets";
import add from "/src/assets/add.png";
import { adminNewPost } from "../../../api/adminNewPost";
import { useNavigate } from "react-router-dom";
import { subCategoryEnumMap } from "../../../constants/subCategoryEnumMap";

const subCategoryMap = {
  생활꿀팁: [
    "조리/주방",
    "청소/분리수거",
    "욕실/청결",
    "세탁/의류관리",
    "보관/유통기한",
  ],
  생활꿀템: ["자취 필수템", "주방템", "청소템", "살림도구템", "브랜드 꿀템"],
};

const postSchema = z.object({
  mainCategory: z.string().min(1, "메인 카테고리를 선택해주세요"),
  subCategory: z.string().min(1, "서브 카테고리를 선택해주세요"),
  title: z.string().min(1, "제목을 입력해주세요"),
  content1: z.string().optional(),
  content2: z.string().optional(),
  tags: z.array(z.object({ value: z.string().min(1) })),
});

type PostFormData = z.infer<typeof postSchema>;

const AdminNewPostPage = () => {
  const [images, setImages] = useState<File[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      mainCategory: "",
      subCategory: "",
      title: "",
      content1: "",
      content2: "",
      tags: [{ value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tags",
  });

  const mainCategory = watch("mainCategory");

  const onSubmit = async (data: PostFormData) => {
    // 관리자 토큰 확인
    const adminToken = localStorage.getItem("adminAccessToken");
    console.log("관리자 토큰:", adminToken ? "존재함" : "없음");
    console.log("토큰 내용:", adminToken);
    
    if (!adminToken) {
      alert("관리자 로그인이 필요합니다.");
      return;
    }

    const content = [data.content1, data.content2].filter(Boolean).join("\n\n");
    const payload = {
      title: data.title,
      content,
      category: data.mainCategory === "생활꿀팁" ? "LIFE_TIP" : "LIFE_ITEM",
      subCategory:
        subCategoryEnumMap[data.subCategory as keyof typeof subCategoryEnumMap],
      images: images, // 파일 배열 직접 전송
      hashtags: data.tags.map((t) => t.value.trim()).filter(Boolean),
    };
    
    console.log("전송할 데이터:", payload);
    
    try {
      await adminNewPost(payload);
      alert("게시물이 등록되었습니다");
      navigate("/admin/post");
    } catch (err: any) {
      console.error("게시물 등록 실패:", err);
      
      // 더 자세한 에러 메시지
      let errorMessage = "게시물 등록에 실패했습니다.";
      
      if (err.response) {
        console.error("응답 상태:", err.response.status);
        console.error("응답 데이터:", err.response.data);
        
        if (err.response.status === 401) {
          errorMessage = "관리자 인증이 필요합니다. 다시 로그인해주세요.";
        } else if (err.response.status === 403) {
          errorMessage = "관리자 권한이 없습니다.";
        } else if (err.response.status === 500) {
          errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        console.error("요청 실패:", err.request);
        errorMessage = "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.";
      } else {
        console.error("기타 오류:", err.message);
        errorMessage = err.message || "알 수 없는 오류가 발생했습니다.";
      }
      
      alert(errorMessage);
    }
  };

  return (
    <AdminLayout>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full px-10 py-2 flex gap-6"
      >
        <div className="flex flex-col items-center">
          <div className="w-full mb-6 ml-4">
            <p className="font-bold text-2xl">게시글 내용</p>
          </div>
          <div className="w-[500px] h-[500px] bg-gray-100 rounded-4xl flex justify-center items-center overflow-hidden relative">
            {images.length > 0 ? (
              <>
                <img
                  src={URL.createObjectURL(images[currentImageIndex])}
                  alt="미리보기"
                  className="w-full h-full object-cover rounded-xl"
                />
                <img
                  src={cancelIcon}
                  alt="cancel"
                  onClick={() => {
                    const newImages = images.filter(
                      (_, idx) => idx !== currentImageIndex
                    );
                    setImages(newImages);
                    setCurrentImageIndex(0);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 cursor-pointer opacity-80 hover:opacity-100"
                />
                {currentImageIndex === 0 && (
                  <div className="absolute top-2 left-2 bg-[#0080FF] text-white text-xs px-3 py-2 rounded-4xl !rounded-4xl">
                    대표
                  </div>
                )}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 md:gap-3 bg-[#FFFFFF80] bg-opacity-50 px-3 py-1 rounded-4xl">
                    {images.map((_, idx) => (
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
            ) : null}
          </div>
          <label
            htmlFor="imageUpload"
            className="mt-4 w-[500px] h-[54px] bg-[#0080FF] text-white rounded-4xl flex justify-center items-center gap-3 cursor-pointer"
          >
            <img src={addPhotoIcon} />
            파일에서 업로드
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0) {
                setImages(files);
                setCurrentImageIndex(0);
              }
            }}
          />
        </div>

        <div className="flex flex-col gap-4 w-full mt-10">
          <select
            {...register("mainCategory")}
            className="w-full h-[60px] rounded-4xl  bg-[#E6E6E6] p-4"
          >
            <option value="">메인 카테고리를 선택하세요</option>
            {Object.keys(subCategoryMap).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
          {errors.mainCategory && (
            <p className="text-red-500 text-sm">
              {errors.mainCategory.message}
            </p>
          )}

          {mainCategory && (
            <select
              {...register("subCategory")}
              className="w-full h-[60px] rounded-4xl bg-[#E6E6E6] p-4"
            >
              <option value="">서브 카테고리를 선택하세요</option>
              {subCategoryMap[mainCategory as keyof typeof subCategoryMap].map(
                (sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                )
              )}
            </select>
          )}
          {errors.subCategory && (
            <p className="text-red-500 text-sm">{errors.subCategory.message}</p>
          )}

          <input
            {...register("title")}
            placeholder="제목을 입력해주세요"
            className="w-full h-[80px] text-[20px] rounded-4xl border border-[#E6E6E6] p-3"
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}

          <textarea
            {...register("content1")}
            placeholder="본문 내용을 입력해주세요. (예: 제품 설명)"
            className="border border-[#E6E6E6] p-3 rounded-4xl h-[120px]"
          />
          <textarea
            {...register("content2")}
            placeholder="본문 내용을 입력해주세요. (예: 특징, 후기 등)"
            className="border border-[#E6E6E6] p-3 rounded-4xl h-[120px]"
          />

          <div className="w-full bg-[#F5FFCC] rounded-4xl px-6 py-4 flex items-center gap-4 flex-wrap">
            <span className="font-semibold">해시태그</span>
            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-3 py-1"
              >
                <span className="text-sm text-[#666666]">#</span>
                <input
                  {...register(`tags.${idx}.value` as const)}
                  className="bg-transparent outline-none w-[85px] h-[29px] text-sm text-[#666666]"
                  placeholder="해시태그"
                />
                <button type="button" onClick={() => remove(idx)}>
                  <img src={cancelIcon} className="w-[16px] h-[16px]" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => append({ value: "" })}>
              <img src={add} className="w-[16px] h-[16px]" />
            </button>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="reset"
              className="bg-gray-300 text-black px-6 py-2 rounded-4xl"
            >
              취소
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-4xl"
            >
              저장
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminNewPostPage;
