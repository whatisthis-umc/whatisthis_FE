import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const handleLogout = () => {
    // 필요하다면 localStorage.clear() 등 로그아웃 처리 추가
    navigate('/'); // 로그인 페이지로 이동
  };
  return (
    <AdminLayout>
    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold">관리자 페이지</h1>
        <button className="text-sm" onClick={handleLogout}>
            로그아웃
          </button>
      </div>
      <div className="flex gap-4">
        <div className="w-40 flex flex-col gap-2">
          <button className="text-left">신고내역</button>
          <button className="text-left">문의내역</button>
          <button className="text-left" onClick={() => navigate('/admin/posts')}>게시글 관리</button>
          <button className="text-left">공지사항 관리</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-xl">
            <p>신고</p>
            <p>미처리 2</p>
          </div>
          <div className="p-4 border rounded-xl">
            <p>문의</p>
            <p>미답변 2</p>
          </div>
          <div className="p-4 border rounded-xl">
            <p>사용자 현황</p>
            <p>총 사용자 수 23</p>
            <p>오늘 가입 4</p>
          </div>
          <div className="p-4 border rounded-xl">
            <p>콘텐츠 통계</p>
            <p>게시글 243</p>
            <p>댓글 190</p>
          </div>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
}