import AdminLayout from '../layouts/AdminLayout';


export default function AdminPostPage() {
  const dummyData = Array(6).fill({
    type: '생활팁',
    content: '상품 리뷰 관련 문의 드립니다.',
    date: '2025.07.26',
  });

  return (
    <AdminLayout>
    <div className="p-10">
      <h1 className="text-xl font-bold mb-4">게시글 관리</h1>
      <div className="flex gap-4 mb-4">
        <select className="border px-2 py-1">
          <option>전체</option>
        </select>
        <input
          className="border px-2 py-1"
          placeholder="검색어를 입력하세요."
        />
        <button className="bg-blue-500 text-white px-4 rounded">검색</button>
      </div>
      <table className="w-full border text-sm">
        <thead>
          <tr className="border">
            <th className="p-2">유형</th>
            <th className="p-2">신고 내용</th>
            <th className="p-2">신고일</th>
            <th className="p-2">처리 상태</th>
          </tr>
        </thead>
        <tbody>
          {dummyData.map((item, idx) => (
            <tr className="border" key={idx}>
              <td className="p-2">{item.type}</td>
              <td className="p-2">{item.content}</td>
              <td className="p-2">{item.date}</td>
              <td className="p-2">
                <button className="bg-blue-500 text-white px-2 py-1 text-xs rounded">처리</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center mt-4">
        <button className="mx-1">1</button>
        <button className="mx-1">2</button>
        <button className="mx-1">3</button>
        <button className="mx-1">4</button>
        <button className="mx-1">5</button>
        <button className="mx-1">6</button>
      </div>
    </div>
    </AdminLayout>
  );
}
