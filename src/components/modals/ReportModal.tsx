import React from "react";
import { useState } from "react";
import { reportIcon } from "../../assets";
import { checkCircle } from "../../assets";
import { checkedCircle } from "../../assets";

interface ReportModalProps {
  onClose: () => void;
  targetType?: "댓글" | "게시물";
  /** 부모에서 실제 신고 API 호출 */
  onSubmit?: (data: { content: string; description: string }) => void;
}

const reasonsList = [
  "욕설 및 비하 표현",
  "음란성/선정적 내용",
  "광고/홍보성",
  "도배 또는 중복",
  "잘못된 정보/허위 사실",
  "기타(직접입력)",
] as const;

// 서버 enum 매핑(필요시 값 조정)
const reasonCodeMap: Record<(typeof reasonsList)[number], string> = {
  "욕설 및 비하 표현": "ABUSIVE_LANGUAGE",
  "음란성/선정적 내용": "OBSCENE",
  "광고/홍보성": "SPAM",
  "도배 또는 중복": "DUPLICATE",
  "잘못된 정보/허위 사실": "MISINFORMATION",
  "기타(직접입력)": "OTHER",
};

const ReportModal = ({ onClose, targetType = "댓글", onSubmit }: ReportModalProps) => {
  const [selected, setSelected] = useState<(typeof reasonsList)[number] | "">("");
  const [customText, setCustomText] = useState("");

  const handleSubmit = () => {
    if (!onSubmit) {
      onClose(); // 기능 미연결 시 기존 동작 유지
      return;
    }
    if (!selected) {
      alert("신고 사유를 선택해 주세요.");
      return;
    }
    const content = reasonCodeMap[selected] ?? "OTHER";
    const description = selected === "기타(직접입력)" ? customText.trim() : "";
    onSubmit({ content, description });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-[Pretendard]">
      <div className="bg-white rounded-2xl p-12 w-full max-w-[640px]">
        <h2 className="text-[24px] font-bold mb-6 text-left text-[#333333] leading-[32px]">
          이 {targetType}을 신고하시겠습니까?
        </h2>

        <p className="text-[16px] text-[#333333] mb-10 text-left leading-[24px]">
          신고는 운영팀에 전달되며, 허위 신고 시 이용에 제재가 있을 수 있습니다.
          <br />
          신고 사유를 선택해주세요.
        </p>

        <div className="flex flex-col gap-6 mb-12">
          {reasonsList.map((reason, idx) => {
            const isSelected = selected === reason;
            return (
              <label
                key={idx}
                onClick={() => setSelected(reason)}
                className="flex items-center gap-3 cursor-pointer text-[16px] text-[#333333] leading-[24px]"
              >
                <img
                  src={isSelected ? checkedCircle : checkCircle}
                  alt="check"
                  className="w-6 h-6"
                />
                {reason === "기타(직접입력)" ? (
                  <div className="flex items-center gap-2 flex-1">
                    <span>{reason}</span>
                    <input
                      type="text"
                      placeholder="입력"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      onFocus={() => setSelected("기타(직접입력)")}
                      className="w-[70%] border-b text-[16px] leading-[24px] py-1 pl-1 outline-none"
                      style={{ borderColor: "#999999" }}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#999999")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSubmit();
                        }
                      }}
                    />
                  </div>
                ) : (
                  <span>{reason}</span>
                )}
              </label>
            );
          })}
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="text-white flex items-center justify-center text-[18px] font-normal"
            style={{
              backgroundColor: "#0080FF",
              width: "160px",
              height: "54px",
              borderRadius: "32px",
              padding: "12px 32px",
              fontFamily: "Pretendard",
            }}
          >
            취소
          </button>

          <button
            onClick={handleSubmit}
            className="text-white flex items-center justify-center text-[18px] font-normal gap-2"
            style={{
              backgroundColor: "#0080FF",
              width: "160px",
              height: "54px",
              borderRadius: "32px",
              padding: "12px 32px",
              fontFamily: "Pretendard",
            }}
          >
            <img src={reportIcon} alt="report" className="w-5 h-5" />
            신고하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;