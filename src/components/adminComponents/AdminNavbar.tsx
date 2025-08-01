import { useNavigate } from "react-router-dom";

export default function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      localStorage.removeItem("adminAccessToken");
      navigate("/admin/login");
    } catch (err) {
      console.error("로그인 실패:", err);
    }
  };

  return (
    <div className="w-full bg-[#E6E6E6] rounded-full h-12 flex items-center justify-between px-6">
      {/* 왼쪽: 햄버거 + 라벨 */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
          <span className="text-white text-base font-bold">≡</span>
        </div>
        <div className="w-[72px] h-[32px] bg-[#D9D9D9] rounded-full" />
      </div>

      {/* 오른쪽: 로그아웃 */}
      <button
        onClick={handleLogout}
        className="text-sm text-[#4B4B4B] hover:text-black"
      >
        로그아웃
      </button>
    </div>
  );
}
