import React from "react";
import type { ItemCardProps } from "../types/post";
import eye from "/src/assets/eye.png";
import scrap from "/src/assets/scrap.png";

const ItemCard = ({
  id,
  category,
  hashtag,
  imageUrl,
  title,
  description,
  views,
  scraps,
  date,
  type,
}: ItemCardProps) => {
  const firstImage =
    typeof imageUrl === "string" ? imageUrl : imageUrl[0] || "";
  return (
    <div className="flex flex-col justify-center w-57 h-96 bg-transparent gap-2 ml-2 mr-2 mt-7">
      {/* 해시태그 */}
      <div className="flex flex-row gap-2 ml-2 mt-1">
        {Array.isArray(hashtag) ? (
          hashtag.slice(0, 2).map((tag, idx) => (
            <div
              key={idx}
              className="w-fit px-3 h-[29px] items-start rounded-4xl mt-1 bg-[#CCE5FF] text-[#666666]"
            >
              #{tag}
            </div>
          ))
        ) : (
          <div className=" w-fit px-3  h-[29px] items-start rounded-4xl mt-1 ml-2 bg-[#CCE5FF] text-[#666666]">
            #{hashtag}
          </div>
        )}
      </div>

      {/*썸네일*/}
      <div className="w-57 h-57 bg-black rounded-4xl mt-2 mb-1 ml-2">
        <img
          src={firstImage}
          alt={title}
          className="w-full h-full object-cover rounded-4xl"
        />
      </div>
      {/*제목*/}
      <div className="w-56 h-7.5 font-[500] text-[20px] truncate ml-2">
        {title}
      </div>
      {/*설명*/}
      <div className="w-56 h-6 font-[500] text-[16px] truncate ml-2 ">
        {description}
      </div>
      {/*조회수, 스크랩수*/}
      <div className="flex items-start gap-2 ml-2 mt-1">
        <span className="flex gap-2">
          <img src={eye} className="w-6 h-6"></img>
          {views}
        </span>
        <span className="flex gap-2">
          <img src={scrap} className="w-6 h-6"></img>
          {scraps}
        </span>
      </div>
    </div>
  );
};

export default ItemCard;
