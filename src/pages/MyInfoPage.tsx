import { useState } from "react";
import addPhotoIcon from "../assets/add_photo.png";
import cancelIcon from "../assets/cancel.png";

const MyInfoEditPage = () => {
  const [image, setImage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = () => {
    setImage(null);
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-white font-[Pretendard] overflow-x-hidden">
      <div
        className="flex gap-[80px] rounded-[32px] bg-white"
        style={{
          width: "772.8px",
          height: "550px",
          padding: "24px",
          border: "1px solid #E6E6E6",
        }}
      >
        {/* 이미지 영역 */}
        <div className="flex flex-col mt-2 items-center relative">
          <div
            className="bg-[#E6E6E6] rounded-[32px] relative"
            style={{ width: "290px", height: "291px" }}
          >
            {image && (
              <img
                src={image}
                alt="uploaded"
                className="w-full h-full object-cover rounded-[32px]"
              />
            )}
            <img
              src={cancelIcon}
              alt="cancel"
              onClick={handleDelete}
              className="absolute top-2 right-2 w-6 h-6 opacity-80 cursor-pointer"
            />
          </div>

          <label
            htmlFor="fileInput"
            className="flex items-center justify-center bg-[#0080FF] text-white text-[20px] mt-4 rounded-[32px] cursor-pointer"
            style={{ width: "290px", height: "54px", fontWeight: 500 }}
          >
            <img src={addPhotoIcon} alt="add" className="w-5 h-5 mr-2" />
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

        {/* 입력폼 영역 */}
        <div
          className="flex flex-col mt-2 justify-between"
          style={{ width: "300px" }}
        >
          <div>
            {/* 이름 */}
            <div className="text-[16px] mb-4">이름</div>
            <div className="flex items-center gap-2 mb-10">
              <input
                type="text"
                placeholder="입력"
                style={{
                  width: "328px",
                  borderBottom: "1px solid #999999",
                  outline: "none",
                  fontSize: "16px",
                }}
              />
              <button
                className="text-[12px] rounded-[32px] bg-[#E6E6E6] px-3 py-1"
                style={{ width: "90px", height: "29px", fontWeight: 400 }}
              >
                중복확인
              </button>
            </div>

            {/* 이메일 */}
            <div className="text-[16px] mb-4">이메일</div>
            <div className="flex items-center gap-2 mb-10">
              <input
                type="text"
                placeholder="이메일 주소"
                style={{
                  width: "150px",
                  borderBottom: "1px solid #999999",
                  outline: "none",
                  fontSize: "16px",
                }}
              />
              <span className="text-[16px]">@</span>
              <input
                type="text"
                placeholder="선택"
                style={{
                  width: "150px",
                  borderBottom: "1px solid #999999",
                  outline: "none",
                  fontSize: "16px",
                }}
              />
            </div>

            {/* 전화번호 */}
            <div className="text-[16px] mb-4">전화번호</div>
            <div className="flex items-center gap-2 mb-10">
              <input
                type="text"
                placeholder="입력"
                style={{
                  width: "328px",
                  borderBottom: "1px solid #999999",
                  outline: "none",
                  fontSize: "16px",
                }}
              />
            </div>

            {/* 주소(선택) */}
            <div className="text-[16px] mb-4">주소(선택)</div>
            <div className="flex items-center gap-2 mb-10">
              <input
                type="text"
                placeholder="입력"
                style={{
                  width: "328px",
                  borderBottom: "1px solid #999999",
                  outline: "none",
                  fontSize: "16px",
                }}
              />
            </div>
          </div>

          {/* 저장버튼 */}
          <div className="flex justify-end mt-4">
            <button
              className="bg-[#0080FF] text-white text-[20px] rounded-[32px]"
              style={{ width: "160px", height: "54px", fontWeight: 500 }}
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyInfoEditPage;
