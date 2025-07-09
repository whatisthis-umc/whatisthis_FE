import React, { useState } from "react";

type QnaItemProps = {
  question: string;
  answer: string;
};

const QnaItem: React.FC<QnaItemProps> = ({ question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b py-3">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="font-semibold">Q. {question}</span>
        <span>{open ? "▲" : "▼"}</span>
      </div>
      {open && <div className="mt-2 text-gray-700">A. {answer}</div>}
    </div>
  );
};

export default QnaItem;
