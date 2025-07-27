import { useNavigate } from "react-router-dom";
import { logo } from "../assets";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleClick = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-5- flex">
      <div className="fixed inset-0 bg-black opacity-30" onClick={onClose} />
      <div className="relative z-50 w-[260px] bg-white shadow-xl p-4">
        <img src={logo} alt="로고" className="w-[50px] h-[27px]" />
        {/*버튼*/}
        <div className="mt-5">
          <button className="border-2 rounded-xl px-2 py-1 cursor-pointer ml-6">
            로그인
          </button>
          <button className="border-2 rounded-xl px-2 py-1 cursor-pointer ml-6">
            회원가입
          </button>
        </div>
        <ul className="space-y-2">
          <li
            className="p-2 rounded hover:bg-gray-100 cursor-pointer"
            onClick={() => handleClick("/my")}
          >
            마이페이지
          </li>
          <li
            className="p-2 rounded hover:bg-gray-100 cursor-pointer"
            onClick={() => handleClick("/likes")}
          >
            나의 좋아요
          </li>
          <li
            className="p-2 rounded hover:bg-gray-100 cursor-pointer"
            onClick={() => handleClick("/scrap")}
          >
            나의 스크랩
          </li>
          <li
            className="p-2 rounded hover:bg-gray-100 cursor-pointer"
            onClick={() => handleClick("/customer/notice")}
          >
            고객센터
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
