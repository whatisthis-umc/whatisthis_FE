import React from "react";

interface CategoryBarProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

const CategoryBar = ({ categories, selected, onSelect }: CategoryBarProps) => {
  return (
    <div
      className="
      flex 
      overflow-x-auto w-full
      whitespace-nowrap md:whitespace-normal 
      pt-1 md:pt-2 
      pl-0 md:pl-3 
      gap-1 md:gap-2 
      scrollbar-hide"
    >
      {categories.map((category) => (
        <button
          key={category}
          className={`inline-block px-2 md:px-3 h-7 md:h-8 border rounded-4xl cursor-pointer shrink-0 text-[13px] md:text-[16px]
           ${
             selected === category
               ? "border-[#0080FF] text-[#0080FF]"
               : "border-[#E6E6E6] text-[#E6E6E6]"
           }`}
          onClick={() => onSelect(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryBar;
