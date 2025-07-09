import { useState } from "react";
import { FaRegCommentDots, FaRegHeart } from "react-icons/fa";
import { IoMdEye } from "react-icons/io";

interface Comment {
  id: number;
  user: string;
  content: string;
  timestamp: string;
  liked: number;
}

const PostDetailPage: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      user: "강주영",
      content: "너무 유용한 정보네요!",
      timestamp: "1시간 전",
      liked: 12,
    },
    {
      id: 2,
      user: "주디",
      content: "감사합니다~",
      timestamp: "1시간 전",
      liked: 7,
    },
  ]);

  return (
    <div className="w-full max-w-[1200px] mx-auto p-6">
      {/* 상단 본문 */}
      <div className="flex flex-col lg:flex-row gap-6 mb-10">
        {/* 왼쪽 이미지 영역 */}
        <div className="w-full lg:w-1/2 h-[400px] bg-gray-200 rounded-xl flex items-center justify-center">
          <span className="text-gray-500">이미지 영역</span>
        </div>

        {/* 오른쪽 게시글 설명 */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>유엠씨 · 작성일</span>
            <span className="flex items-center gap-1">
              <IoMdEye /> 100 | <FaRegHeart className="inline-block text-gray-500" /> 244
            </span>
          </div>
          <h1 className="text-2xl font-bold">작업명: 라벨용기 (BPA Free)</h1>

          <p className="text-gray-700">
            냉장고에 넣기 좋은 밀폐용기입니다. BPA 프리이며 식기세척기 사용도 가능합니다.
          </p>

          <div className="bg-gray-100 rounded-md p-4 text-sm">
            <p className="font-semibold mb-2">추천 대상</p>
            <ul className="list-disc pl-5">
              <li>밀폐 용기가 필요한 자취생</li>
              <li>식기세척기 사용 용기 찾는 분</li>
            </ul>
          </div>

          <div className="flex gap-4 mt-2">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-full">
              좋아요
            </button>
            <button className="bg-gray-300 text-black px-4 py-2 rounded-full">
              신고하기
            </button>
          </div>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <FaRegCommentDots /> 댓글 {comments.length}
        </h2>

        {comments.map((c) => (
          <div key={c.id} className="flex gap-4 mb-6">
            {/* 프로필 이미지 (더미) */}
            <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0" />

            {/* 댓글 내용 */}
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="font-semibold">{c.user}</span>
                <span>{c.timestamp}</span>
              </div>
              <p className="text-gray-800 mt-1">{c.content}</p>
              <div className="flex items-center text-sm text-gray-500 mt-2 gap-2">
                <FaRegHeart className="text-gray-500" />
                <span>{c.liked}</span>
                <FaRegCommentDots className="ml-4" />
                <span>1</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostDetailPage;
