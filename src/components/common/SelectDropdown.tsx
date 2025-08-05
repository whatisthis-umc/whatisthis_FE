import { Listbox } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';

interface SelectDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export default function SelectDropdown({
  value,
  onChange,
  options,
  placeholder = '선택',
}: SelectDropdownProps) {
  return (
    <div className="relative w-[84px] md:w-[132.5px] text-[16px]">
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button className="w-full border-b border-[#999] bg-transparent text-left text-[#999] pr-[24px]">
            {value || placeholder}
            <ChevronDownIcon className="w-[16px] h-[16px] absolute right-0 top-1/2 -translate-y-1/2 text-[#666]" />
          </Listbox.Button>

          {/* ✅ 옵션박스 스타일: 완전 둥근 테두리 */}
          <Listbox.Options className="
            absolute z-10 mt-2 w-full rounded-[20px] border border-[#999] bg-white shadow-md
            text-[#999] text-center text-[14px] overflow-hidden
          ">
            {options.map((option) => (
              <Listbox.Option
                key={option}
                value={option}
                as={Fragment}
              >
                {({ active, selected }) => (
                  <li
                    className={`py-[10px] cursor-pointer ${
                      active ? 'bg-[#F2F2F2]' : ''
                    } ${selected ? 'font-bold text-[#333]' : ''}`}
                  >
                    {option}
                  </li>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}
