import { useEffect } from "react";
import ReactDOM from "react-dom";

type DeleteSuccessModalProps = {
  open: boolean;
  onClose: () => void;
  message?: string; 
  confirmText?: string;
  closeOnBackdrop?: boolean;
};

export default function DeleteSuccessModal({
  open,
  onClose,
  message = "삭제 처리되었습니다.",
  confirmText = "확인",
  closeOnBackdrop = true,
}: DeleteSuccessModalProps) {
 
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const modal = (
    <div
      aria-modal="true"
      role="dialog"
      aria-labelledby="delete-success-title"
      className="fixed inset-0 z-[1000] flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => closeOnBackdrop && onClose()}
      />
      {/* Card */}
      <div className="relative mx-4 w-full max-w-[520px] rounded-[24px] bg-white p-8 shadow-xl">
        <h2
          id="delete-success-title"
          className="sr-only"
        >
          삭제 처리 알림
        </h2>

        <p className="mb-8 text-[22px] font-semibold leading-[150%] text-[#333]">
          {message}
        </p>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            autoFocus
            className="h-[48px] rounded-full bg-[#1883FF] px-8 text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#1883FF]/40"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

 
  return ReactDOM.createPortal(modal, document.body);
}
