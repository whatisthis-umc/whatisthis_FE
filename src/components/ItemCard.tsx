import type { ItemCardProps } from "../types/post";
import { eye } from "../assets";
import { scrap } from "../assets";

const ItemCard = ({
  hashtag,
  imageUrl,
  title,
  description,
  views,
  scraps,
}: ItemCardProps) => {
  const getImageUrl = () => {
    if (!imageUrl) {
      console.log("No imageUrl provided");
      return "";
    }
    if (typeof imageUrl === "string") {
      console.log("String imageUrl:", imageUrl);
      return imageUrl;
    }

    if (Array.isArray(imageUrl)) {
      console.log("Array imageUrl:", imageUrl);
      const validUrl = imageUrl.find((url) => url && url.trim() !== "");
      console.log("Valid URL found:", validUrl);
      return validUrl || "";
    }

    console.log("Unknown imageUrl format");
    return "";
  };

  const firstImage = getImageUrl();
  console.log("Final firstImage:", firstImage);
  return (
    <div className="flex flex-col justify-center w-[90px]  md:w-57 h-[225px] md:h-96 bg-transparent gap-2  ml-1 md:ml-2 mr-0 md:mr-2 mt-4 md:mt-7 ">
      {/* 해시태그 */}
      <div className="flex flex-row gap-1 md:gap-2 ml-1 md:ml-2 md:mt-1">
        {Array.isArray(hashtag) ? (
          hashtag.slice(0, 2).map((tag, idx) => (
            <div
              key={idx}
              className="w-fit px-1 md:px-3 h-[16px] md:h-[29px] items-start rounded-4xl mt-1 bg-[#CCE5FF] text-[8px] md:text-[16px] md:text-[#666666]"
            >
              #{tag}
            </div>
          ))
        ) : (
          <div className=" w-fit px-1.5 md:px-3 h-[16px] md:h-[29px] items-start rounded-4xl mt-1 ml-2 bg-[#CCE5FF] text-[10px] md:text-[16px] md: text-[#666666]">
            #{hashtag}
          </div>
        )}
      </div>

      {/*썸네일*/}
      <div className="w-[90px] h-[90px] md:w-57 md:h-57 rounded-2xl md:rounded-4xl mt-2 mb-1 ml-2 overflow-hidden">
        <img
          src={
            firstImage ||
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="
          }
          alt={title}
          className="w-full h-full object-cover rounded-2xl md:rounded-4xl"
          onError={(e) => {
            // 이미지 로드 실패 시 기본 이미지
            e.currentTarget.src =
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=";
          }}
        />
      </div>
      {/*제목*/}
      <div className="w-[95px] h-[18px] text-[14px] md:w-56 md:h-7.5 font-[500] md:text-[20px] truncate ml-2">
        {title}
      </div>
      {/*설명*/}
      <div className="w-[95px] h-[18px] md:w-56 md:h-6 font-[500] text-[12px] md:text-[16px] truncate ml-2 ">
        {description}
      </div>
      {/*조회수, 스크랩수*/}
      <div className="flex items-start gap-2 ml-2 mt-1">
        <span className="hidden md:flex md:gap-2 text-[16px]">
          <img src={eye} className="w-6 h-6"></img>
          {views}
        </span>
        <span className="flex gap-2 text-[12px] md:text-[16px]">
          <img src={scrap} className="w-4 h-4 md:w-6 md:h-6 "></img>
          {scraps}
        </span>
      </div>
    </div>
  );
};

export default ItemCard;
