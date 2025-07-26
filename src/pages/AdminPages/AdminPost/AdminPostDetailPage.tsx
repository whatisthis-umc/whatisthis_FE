import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import { dummyPosts3 } from '../../../data/dummyPosts3';

export default function AdminPostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = dummyPosts3.find((p) => p.id === Number(id));

  if (!post) {
    return <div className="p-10 text-xl">존재하지 않는 게시글입니다.</div>;
  }

  return (
    <AdminLayout>
      <div className="w-[1040px] px-10 py-8 flex font-[Pretendard]">
        {/* 왼쪽: 이미지 영역 */}
        <div className="w-[500px] h-[500px] bg-[#E6E6E6] rounded-[32px] flex justify-center items-center">
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt="게시글 이미지"
              className="w-full h-full object-cover rounded-[32px]"
            />
          ) : (
            <span className="text-[#999999]">이미지 미리보기</span>
          )}
        </div>

        {/* indicator (하단 점) */}
        <div className="absolute ml-[120px] mt-[520px] flex gap-2 bg-[#D9D9D9] px-4 py-1 rounded-full">
          <div className="w-3 h-3 rounded-full bg-[#0080FF]" />
          <div className="w-3 h-3 rounded-full bg-[#888888]" />
          <div className="w-3 h-3 rounded-full bg-[#888888]" />
        </div>

        {/* 오른쪽: 게시글 정보 */}
        <div className="ml-12 flex flex-col justify-between w-full">
          {/* 상단 정보 */}
          <div>
            {/* 제목 */}
            <div className="flex items-center gap-2 mb-2">
              <p className="text-[24px] font-bold text-[#333333]">{post.realtitle}</p>
              <div className="bg-[#E6F0FF] text-[#0080FF] px-2 py-1 rounded-full text-sm font-semibold">
                #{post.category === "tip1" ? "생활꿀템" : post.category === "tip2" ? "생활꿀팁" : post.category}
              </div>
            </div>

            {/* 본문 내용 */}
            <p className="text-[#333333] text-base leading-relaxed whitespace-pre-line mb-4">
              {post.content}
            </p>

            {/* 방법 (더미로 고정 예시 제공) */}
            <div className="relative w-fit">
            <div className="bg-white border border-[#E6E6E6] rounded-3xl px-4 py-3 text-[#333333] leading-[180%] text-[15px] flex gap-6">
              <strong className="min-w-[40px] font-bold mb-1">방법</strong>
              <ul className="list-decimal pl-5 space-y-[4px]">
                <li>내열 용기에 물 1컵과 식초 1~2스푼(또는 레몬즙)을 넣는다.</li>
                <li>전자레인지에서 약 5분간 돌린다.</li>
                <li>문을 닫은 채로 2~3분간 증기로 불린 후, 마른 천으로 닦아낸다.</li>
              </ul>
            </div>
            <p className="text-[#999999] text-[16px] font-medium absolute right-4 -bottom-6">
    출처: 한국소비자원 생활정보 제공 자료
  </p>
  </div>
          </div>
          

          {/*수정 버튼 */}
          <div className="w-full flex justify-end mt-2">
  <button
    className="bg-[#0080FF] text-white text-[18px] rounded-3xl px-8 py-2"
    onClick={() => navigate(`/admin/post/edit/${post.id}`)}
  >
    수정
  </button>
</div>
        </div>
      </div>
    </AdminLayout>
  );
}
