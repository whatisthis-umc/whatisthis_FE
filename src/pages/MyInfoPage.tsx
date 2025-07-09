import { useState, ChangeEvent } from "react";

const MyInfoPage = () => {
  const [email, setEmail] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [inputs, setInputs] = useState({
    username: "",
    input1: "",
    input2: "",
  });
  const [preview, setPreview] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-semibold mb-8">마이페이지</h1>
      <div className="bg-white p-8 rounded-xl shadow-md flex flex-col lg:flex-row gap-6">
        {/* 📸 프로필 사진 */}
        <div className="flex flex-col items-center w-full lg:w-[60%]">
          <div className="w-56 h-56 rounded-xl bg-gray-200 overflow-hidden relative">
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                이미지
              </div>
            )}
          </div>
          <label className="mt-6 bg-blue-500 text-white text-base px-6 py-2 rounded-full cursor-pointer">
            📂 파일에서 업로드
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>

        {/* 📝 입력 폼 */}
        <div className="w-full lg:w-[40%] space-y-4">
          {/* 이름 */}
          <label className="text-sm text-gray-500 block">이름</label>
          <div className="relative">
            <input
              type="text"
              name="username"
              placeholder="입력"
              className="border-b w-full py-1 px-2 pr-24 text-sm focus:outline-none"
              value={inputs.username}
              onChange={handleInputChange}
            />
            <button
              className="absolute right-1 top-1/2 -translate-y-1/2 text-sm bg-gray-200 px-3 py-1 rounded-full text-gray-700"
              type="button"
            >
              중복확인
            </button>
          </div>

          {/* 이메일 */}
          <label className="text-sm text-gray-500 block">이메일</label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="입력"
              className="border-b flex-1 py-1 px-2 text-sm focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <span className="text-gray-500 text-sm">@</span>
            <input
              type="text"
              placeholder="선택"
              className="border-b flex-1 py-1 px-2 text-sm focus:outline-none"
              value={emailDomain}
              onChange={(e) => setEmailDomain(e.target.value)}
            />
          </div>

          {/* 전화번호 */}
          <label className="text-sm text-gray-500 block">휴대폰 번호</label>
          <input
            type="text"
            name="input1"
            placeholder="입력"
            className="border-b w-full py-1 px-2 text-sm focus:outline-none"
            value={inputs.input1}
            onChange={handleInputChange}
          />

          {/* 주소 */}
          <label className="text-sm text-gray-500 block">주소 (선택)</label>
          <input
            type="text"
            name="input2"
            placeholder="입력"
            className="border-b w-full py-1 px-2 text-sm focus:outline-none"
            value={inputs.input2}
            onChange={handleInputChange}
          />

          {/* 저장 버튼 */}
          <button className="bg-blue-500 text-white w-full py-2 rounded-full mt-4 text-sm">
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyInfoPage;
