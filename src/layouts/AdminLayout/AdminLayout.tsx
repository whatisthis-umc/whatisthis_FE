import AdminSidebar from "../../components/adminComponents/AdminSideBar";

type AdminLayoutProps = {
  children: React.ReactNode;
  showSidebar?: boolean; // ✅ 이게 핵심!
};

export default function AdminLayout({ children, showSidebar = true }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {showSidebar && <AdminSidebar />} {/* 👉 조건부 렌더링 */}
      <div className="flex-1 bg-[#F9F9F9] px-10 py-6 relative">
        {/* ✅ Navbar는 항상 보여줌 */}
        <div className="flex justify-between items-center mb-8">
          <button className="text-xl">&#9776;</button>
          <button className="text-sm text-gray-700">로그아웃</button>
        </div>

        {children}
      </div>
    </div>
  );
}
