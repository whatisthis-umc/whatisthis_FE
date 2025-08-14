import React from "react";
import { eye } from "../assets";
import { like } from "../assets";
import { commentIcon } from "../assets";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
dayjs.locale("ko");

interface CommunityCardProps {
  hashtag: string;
  imageUrl?: string;
  nickname: string;
  date: Date;
  title: string;
  description: string;
  views: number;
  likes: number;
  comments: number;
  best?: boolean;
}

const CommunityCard = ({
  hashtag,
  nickname,
  date,
  title,
  description,
  views,
  likes,
  comments,
  best,
}: CommunityCardProps) => {
  return (
    <div className="flex flex-col justify-center w-[110px]  md:w-57 h-[225px] md:h-96 bg-transparent gap-2 ml-1 mr-0 md:ml-2 md:mr-2 mt-7">
      <div className="flex flex-row">
        {best && (
          <div className="px-2 py-[1px] md:py-[2px] w-fit md:w-[53px] h-[16px] md:h-[29px] mt-1 ml-2 bg-[#CCFF00] text-[#999999] rounded-4xl text-[10px] md:text-[16px] font-[500] items-center">
            Best
          </div>
        )}
        {/*해시태그*/}
        <div className="w-fit px-2 md:px-3 md:w-fit h-[16px] md:h-[29px] items-center flex rounded-4xl mt-1 ml-2 bg-[#CCFF00] text-[10px] md:text-[16px] text-[#999999]">
          #{hashtag}
        </div>
      </div>
      {/*썸네일*/}
      <div className="w-[90px] md:w-57 h-[90px] md:h-57 border border-black rounded-3xl md:rounded-4xl mt-2 mb-1 ml-2 p-2 flex flex-col justify-between">
        {/* 제목 */}
        <div className="text-[10px] md:text-[20px] md:mt-2 md:ml-1 font-[500] truncate">
          {title}
        </div>

        {/* 설명 */}
        <div className="text-[8px] md:text-[16px] md:ml-1 font-[500] text-[#555] truncate mb-5 md:mb-22">
          {description}
        </div>

        {/* 닉네임 & 날짜 */}
        <div className="md:ml-2 flex flex-row gap-3 md:gap-10 text-[9px] md:text-[14px] ">
          <span>{nickname}</span>
          <span className="text-[9px] md:text-[14px] text-[#999999]">
            {dayjs(date).fromNow()}
          </span>
        </div>
      </div>

      {/*조회수, 좋아요수, 댓글수*/}
      <div className="flex items-start gap-4 ml-2 mt-1">
        <span className="hidden md:flex md:gap-2">
          <img src={eye} className="w-6 h-6"></img>
          {views}
        </span>
        <span className="flex gap-1 md:gap-2 text-[11px] md:text-[16px]">
          <img src={like} className="w-4 md:w-6 h-4 md:h-6"></img>
          {likes}
        </span>
        <span className="flex gap-1 md:gap-2 text-[11px] md:text-[16px]">
          <img src={commentIcon} className="w-4 md:w-6 h-4 md:h-6"></img>
          {comments}
        </span>
      </div>
    </div>
  );
};

export default CommunityCard;
