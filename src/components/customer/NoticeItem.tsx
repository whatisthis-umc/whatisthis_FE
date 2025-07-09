import React from "react";
import { useNavigate } from "react-router-dom";

type NoticeItemProps = {
  id: number;
  title: string;
  date: string;
};

const NoticeItem: React.FC<NoticeItemProps> = ({ id, title, date }) => {
  const navigate = useNavigate();

  return (
    <div
      className="flex justify-between border-b py-3 cursor-pointer"
      onClick={() => navigate(`/customer/notice/${id}`)}
    >
      <span>{title}</span>
      <span className="text-sm text-gray-500">{date}</span>
    </div>
  );
};

export default NoticeItem;
