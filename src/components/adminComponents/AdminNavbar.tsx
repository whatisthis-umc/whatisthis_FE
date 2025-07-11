import { useNavigate } from 'react-router-dom';

export default function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <header className="w-full bg-gray-100 shadow-sm h-12 flex items-center justify-between px-4">
      <div className="flex items-center space-x-2">
        <button className="text-xl font-bold">☰</button>
        <div className="w-20 h-6 bg-gray-300 rounded-full"></div>
      </div>
      <button
        className="text-sm text-gray-600 hover:text-black"
        onClick={handleLogout}
      > 로그아웃
      </button>
    </header>
  );
}
