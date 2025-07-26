import { useNavigate, useLocation } from "react-router-dom";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: "신고내역", path: "/admin/reports" },
    { label: "문의내역", path: "/admin/inquiries" },
    { label: "게시글 관리", path: "/admin/post" },
    { label: "공지사항 관리", path: "/admin/notice" },
    { label: "Q&A 관리", path: "/admin/qna" },
  ];

  return (
    <div className="w-[200px] px-6 pt-8 pb-4 bg-white flex flex-col items-start gap-4 font-[Pretendard]">
      {/* 관리자 모드 pill */}
      <div
        className="rounded-[19px] border border-[#8E9BAA] w-[134px] h-[38px]
                   flex justify-center items-center text-[#333333]"
        style={{
          fontSize: "20px",
          fontWeight: 500,
          lineHeight: "150%",
          letterSpacing: "-0.02em",
          
        }}
      >
        관리자 모드
      </div>

      {/* 메뉴 리스트 */}
      <div className="flex flex-col gap-2 mt-4">
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`rounded-[32px] transition-all duration-200 text-[20px] font-medium leading-[150%]
                          px-6 py-3 text-[#333333] tracking-[-0.02em] text-left
                          ${
                            isActive
                              ? "bg-[#333333] text-white"
                              : "bg-white hover:bg-[#F5F5F5]"
                          }`}
              style={{
                
                fontFamily: "Pretendard",
                fontSize: "20px",
                fontWeight: 500,
                lineHeight: "150%",
                letterSpacing: "-0.02em",
                whiteSpace: "nowrap",
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
