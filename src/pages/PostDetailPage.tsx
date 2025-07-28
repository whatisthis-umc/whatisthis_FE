import { useState } from "react";
import bestBadge from "../assets/best.png";
import heartIcon from "../assets/heart.png";
import reportIcon from "../assets/report.png";
import commentsIcon from "../assets/comments.png";
import commentsIconB from "../assets/comment_black.png";
import likesIcon from "../assets/likes.png";
import reportGrayIcon from "../assets/report_gray.png";
import ReportModal from "../components/modals/ReportModal";
import SortDropdown from "../components/common/SortDropdown";
import arrowLeft from "../assets/chevron_backward.svg";
import arrowRight from "../assets/chevron_forward.svg";

const PostDetailPage = () => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortType, setSortType] = useState("인기순");

  const commentsData = [
    [
      {
        id: 1,
        nickname: "황유빈",
        content: "너무 유용한 정보네요! 감사합니다.",
        likes: 12,
        createdAt: "2025-07-14T12:00:00",
        replies: [
          {
            id: 11,
            nickname: "강주영",
            content: "감사합니다~",
            likes: 12,
            createdAt: "2025-07-14T12:30:00",
          },
        ],
      },
      {
        id: 2,
        nickname: "박세현",
        content: "정말 좋은 팁이네요!",
        likes: 5,
        createdAt: "2025-07-14T11:00:00",
        replies: [],
      },
      {
        id: 3,
        nickname: "이채은",
        content: "저도 이렇게 써봐야겠어요.",
        likes: 8,
        createdAt: "2025-07-14T10:00:00",
        replies: [],
      },
    ],
  ];

  const comments = commentsData[currentPage - 1] || [];

  const sortedComments = [...comments].sort((a, b) => {
    if (sortType === "인기순") {
      return b.likes - a.likes;
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-8 font-[Pretendard]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] rounded-full bg-[#D9D9D9] opacity-80" />
        <div className="flex items-center gap-1">
          <img
            src={bestBadge}
            alt="best badge"
            className="w-4 h-4 sm:w-5 sm:h-5"
          />
          <span className="text-gray-800 font-medium text-sm sm:text-base">
            닉네임
          </span>
        </div>
        <span className="text-gray-500 text-sm">3일 전</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-[60px]">
        <div className="bg-[#D9D9D9] rounded-[32px] w-full lg:w-1/2 h-[300px] sm:h-[500px] lg:h-[680px]" />

        <div className="flex flex-col gap-6 flex-1">
          <h1 className="text-[20px] sm:text-[24px] font-bold leading-snug">
            락앤락 냉장고 전용 밀폐용기 (BPA Free)
          </h1>

          <p className="text-gray-700 text-[15px] sm:text-[16px] font-medium leading-relaxed">
            냉장고 내부 공간을 효율적으로 활용할 수 있는 락앤락의 전용
            밀폐용기입니다. <br /> BPA Free 재질로 인체에 유해한 환경호르몬이
            검출되지 않아 안심하고 사용할 수 있으며, 전자레인지 및 식기세척기
            사용도 가능합니다.
          </p>

          <div className="border border-[#E6E6E6] rounded-[24px] p-4 sm:p-6 text-[14px] sm:text-[16px]">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="font-bold w-[80px] sm:w-[95px] align-top">
                    주요 특징
                  </td>
                  <td>
                    <div className="mb-2 sm:mb-[8px]">
                      <span className="font-bold">공간 효율성</span>
                      <span className="ml-2 text-gray-700">
                        용기 높이가 낮고 규격화되어 있어 수직 적재가 용이합니다.
                      </span>
                    </div>
                    <div className="mb-2 sm:mb-[8px]">
                      <span className="font-bold">밀폐력 우수</span>
                      <span className="ml-2 text-gray-700">
                        실리콘 패킹을 통해 내용물의 냄새와 수분이 외부로 새지
                        않도록 차단합니다.
                      </span>
                    </div>
                    <div className="mb-2 sm:mb-[8px]">
                      <span className="font-bold">안전 인증</span>
                      <span className="ml-2 text-gray-700">
                        식품의약품안전처(FDA) 기준에 적합하며, 환경부 인증을
                        받은 소재를 사용하였습니다.
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border border-[#E6E6E6] rounded-[24px] p-4 sm:p-6 text-[14px] sm:text-[16px]">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="font-bold w-[80px] sm:w-[95px] align-top">
                    추천 대상
                  </td>
                  <td className="text-gray-700">
                    <div className="mb-2">
                      냉장고 정리를 효율적으로 하고 싶은 분
                    </div>
                    <div className="mb-2">
                      안전하고 위생적인 보관용기를 찾는 분
                    </div>
                    <div className="mb-2">
                      정리도구로 생활의 편리함을 높이고 싶은 자취생 및 1인 가구
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-2">
            {["#해시태그", "#해시태그", "#해시태그"].map((tag, i) => (
              <span
                key={i}
                className="bg-[#CCE5FF] text-[#000] text-xs sm:text-sm rounded-full px-3 py-1"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex justify-between mt-4 flex-wrap gap-4">
            <button
              className="flex items-center gap-2 
               bg-[#0080FF] text-white font-medium 
               text-sm sm:text-base lg:text-lg 
               px-4 sm:px-6 lg:px-8 
               py-2 sm:py-2.5 lg:py-3 
               rounded-full"
            >
              <img
                src={heartIcon}
                alt="like"
                className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
              />
              좋아요
            </button>

            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 
               bg-[#0080FF] text-white font-medium 
               text-sm sm:text-base lg:text-lg 
               px-4 sm:px-6 lg:px-8 
               py-2 sm:py-2.5 lg:py-3 
               rounded-full"
            >
              <img
                src={reportIcon}
                alt="report"
                className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
              />
              신고하기
            </button>
          </div>
        </div>
      </div>

      {/* 댓글 영역 */}
      <div className="w-full mt-24">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-[20px] font-bold">
            <img src={commentsIconB} alt="comments" className="w-5 h-5" /> 댓글{" "}
            {comments.length}
          </div>
          <SortDropdown defaultValue={sortType} onChange={setSortType} />
        </div>

        <div className="flex flex-col gap-10">
          {sortedComments.map((comment) => (
            <div key={comment.id} className="flex flex-col gap-2">
              <div className="flex justify-between">
                <div className="flex gap-4 items-center">
                  <div className="w-[40px] h-[40px] rounded-full bg-[#D9D9D9]" />
                  <div>
                    <div className="text-[16px] sm:text-[20px] font-medium">
                      {comment.nickname}
                    </div>
                    <div className="text-[14px] sm:text-[16px] mt-1">
                      {comment.content}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-[#999]">
                      <span>14시간 전</span>
                      <div className="flex items-center gap-1">
                        <img src={likesIcon} alt="likes" className="w-4 h-4" />{" "}
                        {comment.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <img
                          src={commentsIcon}
                          alt="replies"
                          className="w-4 h-4"
                        />{" "}
                        {comment.replies.length}
                      </div>
                    </div>
                  </div>
                </div>
                <img
                  src={reportGrayIcon}
                  alt="report"
                  className="w-4 h-4 cursor-pointer"
                  onClick={() => setShowReportModal(true)}
                />
              </div>

              {/* 대댓글 */}
              {comment.replies.map((reply) => (
                <div
                  key={reply.id}
                  className="flex gap-4 sm:gap-5 items-center ml-8 sm:ml-12 mt-4"
                >
                  <div className="w-[36px] h-[36px] rounded-full bg-[#D9D9D9]" />
                  <div>
                    <div className="text-[16px] sm:text-[18px] font-medium">
                      {reply.nickname}
                    </div>
                    <div className="text-[14px] sm:text-[16px] mt-1">
                      {reply.content}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-[#999]">
                      <span>14시간 전</span>
                      <div className="flex items-center gap-1">
                        <img src={likesIcon} alt="likes" className="w-4 h-4" />{" "}
                        {reply.likes}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-10 gap-4 items-center">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            <img src={arrowLeft} alt="prev" className="w-6 h-6" />
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`text-sm ${currentPage === page ? "text-[#333] font-bold" : "text-[#999]"}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, 3))}
          >
            <img src={arrowRight} alt="next" className="w-6 h-6" />
          </button>
        </div>
      </div>

      {showReportModal && (
        <ReportModal onClose={() => setShowReportModal(false)} />
      )}
    </div>
  );
};

export default PostDetailPage;
