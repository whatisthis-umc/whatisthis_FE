import { useNavigate } from "react-router-dom";
import menu from "/src/assets/menu.png";
import profile from "/src/assets/profile.png";
import favorite from "/src/assets/favorite.png";
import bookmark from "/src/assets/bookmark.png";
const Navbar = () => {
  const navigate = useNavigate();
  return (
    <div className="sticky w-full">
      <div className="flex justify-end w-full gap-3">
        <button className="cursor-pointer" onClick={() => navigate("/login")}>
          로그인/회원가입
        </button>
        <button className="cursor-pointer" onClick={() => navigate("/center")}>
          고객센터
        </button>
      </div>
      <div className="flex justify-between items-center w-full py-2 mt-2">
        <img src={menu} alt="메뉴" className="w-[42px] h-[36px]"></img>
        <div className="flex gap-3 justify-center items-center">
          <button
            className="bg-black text-xl text-white w-[116px] h-[54px]  rt-[24px] bt-[12px] lt-[24px] rounded-4xl cursor-pointer"
            onClick={() => {
              navigate("/tips");
            }}
          >
            생활꿀팁
          </button>
          <button
            className="bg-black text-xl text-white w-[116px] h-[54px]  rt-[24px] bt-[12px] lt-[24px] rounded-4xl cursor-pointer"
            onClick={() => {
              navigate("/items");
            }}
          >
            생활꿀템
          </button>
          <button
            className="bg-black text-xl text-white w-[116px] h-[54px]  rt-[24px] bt-[12px] lt-[24px] rounded-4xl cursor-pointer"
            onClick={() => {
              navigate("/community");
            }}
          >
            커뮤니티
          </button>
        </div>
        <div className="flex gap-3 items-center">
          <img
            src={profile}
            alt="프로필"
            className="w-14 h-14 cursor-pointer"
            onClick={() => {
              navigate("/mypage");
            }}
          />
          <img
            src={favorite}
            alt="좋아요"
            className="w-14 h-14 cursor-pointer"
            onClick={() => {
              navigate("/likepage");
            }}
          />
          <img
            src={bookmark}
            alt="스크랩"
            className="w-14 h-14 cursor-pointer"
            onClick={() => {
              navigate("/scrappage");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
