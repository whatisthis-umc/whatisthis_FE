import search from "/src/assets/search.png";
import arrow_down from "/src/assets/arrow_down.png";

const Searchbar = () => {
  return (
    <div className="flex w-[240px] h-[40px] border-b border-[#333333] ml-auto">
      <div className="w-[152px] text-start ">1. 인기검색어</div>
      <img
        src={arrow_down}
        alt="보기"
        className="w-[24px] h-[24px] cursor-pointer ml-auto"
      />
      <img src={search} alt="검색" className="w-[24px] h-[24px] ml-auto" />
    </div>
  );
};

export default Searchbar;