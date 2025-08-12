import React from "react";

type TargetType = "게시글" | "댓글" | "문의";

interface ConfirmDeleteModalProps {
  open: boolean;
  targetType?: TargetType;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  open,
  targetType = "게시글",
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  const title = `${targetType}을 삭제하시겠습니까?`;
  const desc = `삭제하신 ${targetType}은 복구할 수 없습니다.`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] font-[Pretendard]">
      <div className="bg-white rounded-2xl p-12 w-full max-w-[640px]">
        <h2 className="text-[24px] font-bold mb-4 text-left text-[#333333] leading-[32px]">
          {title}
        </h2>

        <p className="text-[16px] text-[#333333] mb-10 text-left leading-[24px]">
          {desc}
        </p>

        <div className="flex justify-end gap-6">
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
            onClick={onConfirm}
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
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
