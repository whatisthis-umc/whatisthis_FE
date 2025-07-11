
import AdminLayout from '../../layouts/AdminLayout/AdminLayout';


export default function AdminDashboardPage() {

  return (
    <AdminLayout>
    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
      </div>
      <div className="flex gap-4">
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