import AdminSidebar from "../../components/adminComponents/AdminSideBar";
import AdminNavbar from "../../components/adminComponents/AdminNavbar"; // ✅ 따로 분리된 네브바
import { useLocation } from "react-router-dom";
import AdminLoginNavbar from "../../components/adminComponents/AdminLoginNavbar";

type AdminLayoutProps = {
  children: React.ReactNode;
  showSidebar?: boolean;
};

export default function AdminLayout({ children, showSidebar = true }: AdminLayoutProps) {
  const location = useLocation();
  const isLoginPage = location.pathname === "/admin/login";

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-white px-6 py-4">
        <AdminLoginNavbar />
        <main className="mt-6">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-4">
      {/* ✅ 항상 상단에 네브바 */}
      <AdminNavbar />

      {/* ✅ 네브바 아래로 사이드바 + 콘텐츠 */}
      <div className="mt-6 flex">
        {showSidebar && (
          <aside className="w-[200px] mr-6">
            <AdminSidebar />
          </aside>
        )}

        {/* 콘텐츠 */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
