import eye from "/src/assets/eye.png";
import like from "/src/assets/likes.png";
import comment from "/src/assets/comments.png";
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
    <div className="flex flex-col justify-center w-57 h-96 bg-transparent gap-2 ml-2 mr-2 mt-7">
      <div className="flex flex-row">
        {best && (
          <div className="px-2 py-[2px] w-[53px] h-[29px] mt-1 ml-2 bg-[#CCFF00] text-[#999999] rounded-4xl text-[14px] font-[500]">
            Best
          </div>
        )}
        {/*해시태그*/}
        <div className="w-[85px] h-[29px] items-start rounded-4xl mt-1 ml-2 bg-[#CCE5FF] text-[#666666]">
          #{hashtag}
        </div>
      </div>
      {/*썸네일*/}
      <div className="w-57 h-57 border border-black rounded-4xl mt-2 mb-1 ml-2 flex flex-col justify-between">
        <div className="w-56 h-7 font-[500] text-[20px] truncate ml-3 mt-5">
          {title}
        </div>
        <div className="w-56 h-6 font-[500] text-[16px] truncate ml-3 mb-28">
          {description}
        </div>
        <div className="flex justify-between items-center ml-2 px-2 pb-2 text-[14px] font-[500] text-black">
          <span>{nickname}</span>
          <span className="text-[#999999] mr-20">{dayjs(date).fromNow()}</span>
        </div>
      </div>

      {/*조회수, 좋아요수, 댓글수*/}
      <div className="flex items-start gap-4 ml-2 mt-1">
        <span className="flex gap-2">
          <img src={eye} className="w-6 h-6"></img>
          {views}
        </span>
        <span className="flex gap-2">
          <img src={like} className="w-6 h-6"></img>
          {likes}
        </span>
        <span className="flex gap-2">
          <img src={comment} className="w-6 h-6"></img>
          {comments}
        </span>
      </div>
    </div>
  );
};

export default CommunityCard;
