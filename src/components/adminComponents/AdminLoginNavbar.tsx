import { useNavigate } from 'react-router-dom';

export default function AdminLoginNavbar() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/admin/login");
  };

  return (
    <div className="w-full bg-[#E6E6E6] rounded-full h-12 flex items-center justify-between px-6">
      {/* 왼쪽: 흰색 햄버거 버튼 + 라벨 */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
          <span className="text-black text-sm font-bold">≡</span>
        </div>
        <div className="w-[72px] h-[32px] bg-[#D9D9D9] rounded-full" />
      </div>

      {/* 오른쪽: 로그인 버튼 */}
      <button
        onClick={handleLoginClick}
        className="text-sm text-[#4B4B4B] hover:text-black"
      >
        로그인
      </button>
    </div>
  );
}
