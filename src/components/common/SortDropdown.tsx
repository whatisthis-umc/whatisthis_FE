import { useState, useEffect } from "react";
import arrowDownIcon from "../../assets/arrow_down.png";

// ✅ UI에서 사용하는 값
export type SortUIType = "인기순" | "최신순";
// ✅ API에서 사용하는 값
export type SortAPIType = "BEST" | "LATEST";

// ✅ 프론트 -> 백엔드 enum 변환 함수
const convertToAPIType = (uiType: SortUIType): SortAPIType =>
  uiType === "인기순" ? "BEST" : "LATEST";

// ✅ 백엔드 -> 프론트 표시값 변환 함수
const convertToUIType = (apiType: SortAPIType): SortUIType =>
  apiType === "BEST" ? "인기순" : "최신순";

export interface SortDropdownProps {
  defaultValue?: SortAPIType; // "BEST" | "LATEST"
  onChange: (value: SortAPIType) => void;
}

const SortDropdown = ({
  defaultValue = "BEST",
  onChange,
}: SortDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SortAPIType>(defaultValue);

  const handleSelect = (type: SortAPIType) => {
    setSelected(type);
    onChange(type);
    setOpen(false);
  };

  useEffect(() => {
    setSelected(defaultValue); // props 바뀌면 selected 동기화
  }, [defaultValue]);

  return (
    <div className="relative inline-block text-left">
      <div
        className="flex items-center border border-[#999999] rounded-[32px] px-2 md:px-3 py-1 md:py-2 gap-1 text-[12px] md:text-sm text-[#333] cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        {convertToUIType(selected)}
        <img
          src={arrowDownIcon}
          alt="arrow"
          className={`w-4 h-4 transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <div className="absolute right-0 mt-2 w-full md:w-[80px] bg-white border border-[#E6E6E6] rounded-[8px] shadow-md z-10">
          <div
            onClick={() => handleSelect("BEST")}
            className={`px-3 py-2 md:text-sm cursor-pointer hover:bg-[#F5F5F5] text-[12px] ${
              selected === "BEST" ? "text-[#0080FF]" : "text-[#333]"
            }`}
          >
            인기순
          </div>
          <div
            onClick={() => handleSelect("LATEST")}
            className={`px-3 py-2 md:text-sm cursor-pointer hover:bg-[#F5F5F5] text-[12px] ${
              selected === "LATEST" ? "text-[#0080FF]" : "text-[#333]"
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
