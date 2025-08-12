// src/pages/MyInfoEditPage.tsx
import { useEffect, useMemo, useState } from "react";
import { addPhotoIcon, cancelIcon } from "../../assets";
import useMyAccount from "../../hooks/queries/useMyAccount";
import usePatchMyAccount from "../../hooks/queries/usePatchMyAccount";

const MyInfoEditPage = () => {
  const { data, isLoading, isError } = useMyAccount();
  const patchMutation = usePatchMyAccount();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [nickname, setNickname] = useState("");
  const [emailLocal, setEmailLocal] = useState("");
  const [emailDomain, setEmailDomain] = useState("");

  const composedEmail = useMemo(
    () => (emailLocal && emailDomain ? `${emailLocal}@${emailDomain}` : null),
    [emailLocal, emailDomain]
  );

  useEffect(() => {
    if (!data) return;
    setNickname(data.nickname ?? "");

    if (data.email?.includes("@")) {
      const [local, domain] = data.email.split("@");
      setEmailLocal(local ?? "");
      setEmailDomain(domain ?? "");
    } else {
      setEmailLocal(data.email ?? "");
      setEmailDomain("");
    }

    setImagePreview(data.profileImage || null);
    setImageFile(null);
  }, [data]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDelete = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  const handleSave = () => {
    if (!data) return;

    const nicknameToSend =
      nickname.trim() && nickname.trim() !== data.nickname
        ? nickname.trim()
        : null;

    const emailToSend =
      composedEmail && composedEmail !== data.email ? composedEmail : null;

    if (!nicknameToSend && !emailToSend && !imageFile) {
      alert("변경된 내용이 없습니다.");
      return;
    }

    patchMutation.mutate(
      {
        id: data.id,
        nickname: nicknameToSend,
        email: emailToSend,
        image: imageFile ?? undefined,
      },
      {
        onSuccess: () => {
          alert("저장했습니다.");
        },
        onError: (err: any) => {
          const server = err?.response?.data;
          console.error("PATCH /my-page/account error:", server ?? err);
          const msg = server?.message ?? err?.message ?? "오류가 발생했습니다.";
          alert(`저장 실패: ${msg}`);
        },
      }
    );
  };

  if (isLoading)
    return (
      <div className="min-h-screen w-full flex justify-center items-center">
        로딩 중…
      </div>
    );
  if (isError || !data)
    return (
      <div className="min-h-screen w-full flex justify-center items-center">
        계정 정보를 불러오지 못했습니다.
      </div>
    );

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-white font-[Pretendard] overflow-x-hidden px-4">
      <div
        className="flex flex-col lg:flex-row gap-10 lg:gap-[80px] rounded-[32px] bg-white"
        style={{
          width: "100%",
          maxWidth: "772.8px",
          minHeight: "550px",
          padding: "24px",
          border: "1px solid #E6E6E6",
        }}
      >
        {/* 이미지 */}
        <div className="flex flex-col mt-2 items-center relative w-full lg:w-[290px]">
          <div
            className="bg-[#E6E6E6] rounded-[32px] relative w-full lg:w-[290px]"
            style={{ height: "291px" }}
          >
            {imagePreview && (
              <img
                src={imagePreview}
                alt="uploaded"
                className="w-full h-full object-cover rounded-[32px]"
              />
            )}
            {imagePreview && (
              <img
                src={cancelIcon}
                alt="cancel"
                onClick={handleDelete}
                className="absolute top-2 right-2 w-6 h-6 opacity-80 cursor-pointer"
              />
            )}
          </div>

          <label
            htmlFor="fileInput"
            className="flex items-center justify-center bg-[#0080FF] text-white text-[20px] mt-4 rounded-[32px] cursor-pointer w/full lg:w-[290px]"
            style={{ height: "54px", fontWeight: 500 }}
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

        {/* 입력폼 */}
        <div className="flex flex-col mt-6 justify-between w-full lg:w-[300px]">
          <div>
            <div className="text-[16px] mb-4">이름</div>
            <div className="flex items-center gap-2 mb-10">
              <input
                type="text"
                placeholder="입력"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                style={{
                  width: "100%",
                  maxWidth: "328px",
                  borderBottom: "1px solid #999999",
                  outline: "none",
                  fontSize: "16px",
                }}
              />
              <button
                type="button"
                className="text-[12px] rounded-[32px] bg-[#E6E6E6] px-3 py-1"
                style={{ width: "90px", height: "29px", fontWeight: 400 }}
                onClick={() => alert("중복확인 API 연동 예정")}
              >
                중복확인
              </button>
            </div>

            <div className="text-[16px] mb-4">이메일</div>
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <input
                type="text"
                placeholder="이메일 주소"
                value={emailLocal}
                onChange={(e) => setEmailLocal(e.target.value)}
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
                placeholder="도메인"
                value={emailDomain}
                onChange={(e) => setEmailDomain(e.target.value)}
                style={{
                  width: "110px",
                  borderBottom: "1px solid #999999",
                  outline: "none",
                  fontSize: "16px",
                }}
              />
            </div>

            {/* ✨ 프로모션 배너 (노란 영역) */}
            <div className="mt-16 mb-8 rounded-[24px] px-10 py-4 bg-gradient-to-r from-[#EAF3FF] to-[#F7FAFF] border border-[#E6E6E6]">
              <p className="text-[12px] sm:text-[14px] leading-[1.5] text-[#1F2937]">
                <span className="mr-1">✨</span>
                <b>
                  오늘도 당신의 생활이 조금 더 편해지길.
                  이곳에서 매일 새로운 꿀템과 꿀팁을 만나보세요.
                </b>
              </p>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleSave}
              disabled={patchMutation.isPending}
              className="bg-[#0080FF] text-white text-[16px] lg:text-[20px] rounded-[32px] w-[120px] lg:w-[160px] disabled:opacity-50"
              style={{ height: "54px", fontWeight: 500 }}
              type="button"
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
