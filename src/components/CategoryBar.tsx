import React from "react";

interface CategoryBarProps {
    categories: string[];
    selected: string;
    onSelect: (category: string) => void;
  }
  
  const CategoryBar = ({ categories, selected, onSelect }: CategoryBarProps) => {
    return (
      <div className="flex flex-row pt-2 pl-3 gap-2">
        {categories.map((category) => (
          <button
            key={category}
            className={`items-center justify-center px-3 h-8 border rounded-4xl cursor-pointer
            ${
              selected === category
                ? "border-[#0080FF] text-[#0080FF]"
                : "border-[#E6E6E6] text-[#E6E6E6] "
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