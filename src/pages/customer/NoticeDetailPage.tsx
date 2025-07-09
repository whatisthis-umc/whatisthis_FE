import { useParams } from "react-router-dom";

const NoticeDetailPage = () => {
  const { id } = useParams();

  return (
    <div className="p-6 text-2xl text-center">
      📄 공지사항 상세 페이지 (ID: {id})
    </div>
  );
};

export default NoticeDetailPage;
