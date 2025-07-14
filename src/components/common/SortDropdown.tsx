import { useState } from "react";
import arrowDownIcon from "../../assets/arrow_down.png";

const SortDropdown = ({ sortType, setSortType }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (type) => {
    setSortType(type);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <div
        className="flex items-center border border-[#999999] rounded-[32px] px-3 py-2 gap-1 text-sm text-[#333] cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        {sortType}
        <img src={arrowDownIcon} alt="arrow" className={`w-4 h-4 transform ${open ? "rotate-180" : ""}`} />
      </div>

      {open && (
        <div className="absolute right-0 mt-2 w-[80px] bg-white border border-[#E6E6E6] rounded-[8px] shadow-md z-10">
          <div
            onClick={() => handleSelect("인기순")}
            className={`px-3 py-2 text-sm cursor-pointer hover:bg-[#F5F5F5] ${
              sortType === "인기순" ? "text-[#0080FF]" : "text-[#333]"
            }`}
          >
            인기순
          </div>
          <div
            onClick={() => handleSelect("최신순")}
            className={`px-3 py-2 text-sm cursor-pointer hover:bg-[#F5F5F5] ${
              sortType === "최신순" ? "text-[#0080FF]" : "text-[#333]"
            }`}
          >
            최신순
          </div>
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
