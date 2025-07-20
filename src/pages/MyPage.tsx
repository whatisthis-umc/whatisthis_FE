import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { eye } from "../assets";
import { like } from "../assets";
import { commentIcon } from "../assets";

const MyPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"작성내역" | "문의내역">("작성내역");

  const posts = [
    {
      id: 1,
      category: "생활꿀팁",
      hashtags: ["#백색가전", "#세탁기"],
      title: "전자레인지에 용기 돌렸는데 녹았어요...",
      content: "PP지만 PS인지도 모르고 그냥 돌렸다가 바닥에 구멍 났어요ㅠㅠ",
      views: 108,
      likes: 244,
      comments: 32,
    },
    {
      id: 2,
      category: "생활꿀팁",
      hashtags: ["#백색가전", "#세탁기"],
      title: "전자레인지에 용기 돌렸는데 녹았어요...",
      content: "PP지만 PS인지도 모르고 그냥 돌렸다가 바닥에 구멍 났어요ㅠㅠ",
      views: 108,
      likes: 244,
      comments: 32,
    },
  ];

  const inquiries = [
    {
      id: 1,
      title: "회원탈퇴는 어떻게 하나요?",
      content: "설정에 들어가면 회원탈퇴가 있나요?",
      date: "2025-07-15",
    },
    {
      id: 2,
      title: "문의 드립니다",
      content: "배송 문의드립니다.",
      date: "2025-07-14",
    },
  ];

  return (
    <div className="w-full max-w-[1440px] mx-auto mt-20 p-8 font-[Pretendard]">
      {/* 상단 제목 */}
      <div className="text-[32px] font-bold text-[#333333] mb-10">
        마이페이지
      </div>

      {/* 상단 프로필 */}
      <div className="flex justify-between items-center mt-20 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-[80px] h-[80px] rounded-full bg-[#D9D9D9]" />
          <div>
            <div className="text-[20px] font-bold">닉네임</div>
            <div className="text-[14px] text-[#999]">이메일 주소이메일주소</div>
          </div>
        </div>
        <button
          onClick={() => navigate("/myinfo")}
          className="bg-[#0080FF] text-white text-[16px] rounded-[32px]"
          style={{ width: "180px", height: "54px", fontWeight: 500 }}
        >
          계정 관리
        </button>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setTab("작성내역")}
          className={`text-[16px] rounded-[32px] px-6 py-3 ${
            tab === "작성내역"
              ? "bg-[#333333] text-white"
              : "bg-[#F5F5F5] text-[#999999]"
          }`}
          style={{ width: "155px", height: "54px", fontWeight: 500 }}
        >
          나의 작성내역
        </button>
        <button
          onClick={() => setTab("문의내역")}
          className={`text-[16px] rounded-[32px] px-6 py-3 ${
            tab === "문의내역"
              ? "bg-[#333333] text-white"
              : "bg-[#F5F5F5] text-[#999999]"
          }`}
          style={{ width: "155px", height: "54px", fontWeight: 500 }}
        >
          나의 문의내역
        </button>
      </div>

      {/* 리스트 영역 */}
      <div className="flex flex-col gap-4">
        {(tab === "작성내역" ? posts : inquiries).map((item: any) => (
          <div
            key={item.id}
            className="w-full relative border border-[#CCCCCC] rounded-[32px] p-6"
            style={{ width: "1132px", height: "220px" }}
          >
            {/* 수정/삭제 버튼 */}
            <div className="absolute top-6 right-6 flex gap-2 text-[14px] text-[#999999]">
              <button className="hover:underline">수정</button>
              <span>|</span>
              <button className="hover:underline">삭제</button>
            </div>

            {tab === "작성내역" ? (
              <div className="flex flex-col justify-between h-full">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[12px] border border-[#CCCCCC] rounded-[32px] px-3 py-1">
                    {item.category}
                  </span>
                  {item.hashtags.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-[#CCE5FF] text-[12px] text-[#000] rounded-[32px] px-3 py-1"
                      style={{ padding: "4px 12px" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div>
                  <div className="text-[20px] font-bold mb-1">{item.title}</div>
                  <div className="text-[16px] font-medium text-[#666]">
                    {item.content}
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-[#999] text-[14px]">
                  <span>닉네임</span>
                  <span>3일 전</span>
                  <div className="flex items-center gap-1">
                    <img src={eye} alt="view" className="w-4 h-4" />
                    {item.views}
                  </div>
                  <div className="flex items-center gap-1">
                    <img src={like} alt="like" className="w-4 h-4" />
                    {item.likes}
                  </div>
                  <div className="flex items-center gap-1">
                    <img src={commentIcon} alt="comment" className="w-4 h-4" />
                    {item.comments}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-between h-full mt-1">
                <div className="text-[20px] font-bold mb-1">{item.title}</div>
                <div className="text-[16px] font-medium text-[#666]">
                  {item.content}
                </div>
                <div className="text-[#999] text-[14px] mt-3">{item.date}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center mt-10 gap-2 text-[#999] text-[14px]">
        <span>&lt;</span>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <span key={n} className="mx-1 cursor-pointer">
            {n}
          </span>
        ))}
        <span>&gt;</span>
      </div>
    </div>
  );
};

export default MyPage;
