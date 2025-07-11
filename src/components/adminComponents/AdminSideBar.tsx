import { useNavigate, useLocation } from 'react-router-dom';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: '신고내역', path: '/admin/reports' },
    { label: '문의내역', path: '/admin/inquiries' },
    { label: '게시글 관리', path: '/admin/posts' },
    { label: '공지사항 관리', path: '/admin/notice' },
    { label: 'Q&A 관리', path: '/admin/qna' },
  ];

  return (
    <div className="w-[200px] px-6 pt-8 pb-4 bg-white flex flex-col gap-4">
      {/* 관리자 모드 pill */}
      <div className="border border-gray-400 rounded-full text-sm px-3 py-1 w-fit mx-auto">
        관리자 모드
      </div>

      {/* 메뉴 리스트 */}
      <div className="flex flex-col gap-4 mt-4 text-[18px] font-medium">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`transition-all duration-200 px-4 py-2 ${
                isActive
                  ? 'bg-zinc-800 text-white rounded-full mx-auto'
                  : 'text-black text-left'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
