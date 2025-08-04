interface InformationModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

const InformationModal = ({ isOpen, message, onClose }: InformationModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: "var(--WIT-opacity, rgba(102, 102, 102, 0.50))",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "686px",
          padding: "40px",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "flex-end",
          gap: "40px",
          borderRadius: "32px",
          background: "var(--White, #FFF)",
        }}
      >
        <p
          style={{
            alignSelf: "stretch",
            color: "var(--WIT-Gray600, #333)",
            fontFamily: "Pretendard",
            fontSize: "24px",
            fontStyle: "normal",
            fontWeight: 700,
            lineHeight: "150%",
            letterSpacing: "-0.48px",
          }}
        >
          {message}
        </p>
        <button
          onClick={onClose}
          className="text-white font-medium transition-colors"
          style={{
            display: "flex",
            width: "160px",
            padding: "12px 16px",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "32px",
            background: "var(--WIT-Blue, #0080FF)",
            border: "none",
            cursor: "pointer",
          }}
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default InformationModal; 