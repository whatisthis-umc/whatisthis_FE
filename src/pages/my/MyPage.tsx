import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { eye, like, commentIcon } from "../../assets";



const MyPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"작성내역" | "문의내역">("작성내역");
  
  

  const posts = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    category: "생활꿀팁",
    hashtags: ["#전자레인지", "#세탁기", "#백색가전"],
    title: "전자레인지에 용기 돌렸는데 녹았어요 등등 등등 등등...",
    content: "PP지만 PS인지도 모르고 그냥 돌렸다가 바닥에 구멍났어요ㅠㅠ",
    views: 106,
    likes: 244,
    comments: 32,
  }));

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
    <div className="w-full max-w-[1440px] mx-auto px-4 py-8 font-[Pretendard]">
      {/* 상단 제목 */}
      <h1 className="text-[24px] md:text-[32px] font-bold text-[#333] mb-10">
        마이페이지
      </h1>

      <div className="flex items-center gap-4 mb-10">
        {/* 프로필 이미지 */}
        <div className="w-[80px] h-[80px] sm:w-[80px] sm:h-[80px] rounded-full bg-[#D9D9D9]" />

        {/* 닉네임 + 이메일 + 계정관리 버튼 한 줄로 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 w-full justify-between">
          <div>
            <p className="text-[18px] sm:text-[20px] font-bold">닉네임</p>
            <p className="text-[14px] text-[#999]">이메일 주소이메일주소</p>
          </div>
          <button
            onClick={() => navigate("/myinfo")}
            className="
              bg-[#0080FF] text-white 
              text-[14px] px-6 py-2 rounded-full font-medium
              sm:text-[16px] sm:px-[16px] sm:py-[12px] sm:w-[180px] sm:h-[54px] sm:rounded-[32px]
            "
          >
            계정관리
          </button>
        </div>
      </div>

      {/* 탭 버튼 */}
      <div className="flex gap-3 mb-8">
        {["작성내역", "문의내역"].map((type) => (
          <button
            key={type}
            onClick={() => setTab(type as "작성내역" | "문의내역")}
            className={`text-[14px] sm:text-[16px] font-medium rounded-full px-6 py-3 w-[140px] sm:w-[155px] h-[48px] sm:h-[54px] ${
              tab === type
                ? "bg-[#333333] text-white"
                : "bg-[#F5F5F5] text-[#999]"
            }`}
          >
            나의 {type}
          </button>
        ))}
      </div>

      {/* 카드 리스트 */}
      <div className="flex flex-col gap-6">
        {(tab === "작성내역" ? posts : inquiries).map((item, idx) => (
          <div
            key={item.id}
            className="relative border border-[#CCCCCC] rounded-[32px] p-6 pr-8 hover:shadow-md transition-all duration-150 cursor-pointer"
            style={{ minHeight: "150px" }}
            onClick={() => {
              if (tab === "작성내역" && idx === 0) navigate("/post");
            }}
          >
            {/* 수정/삭제 */}
            {tab === "작성내역" && (
              <div className="absolute top-4 right-4 flex gap-2 text-[14px] text-[#999] z-10">
                <button className="hover:underline">수정</button>
                <span>|</span>
                <button className="hover:underline">삭제</button>
              </div>
            )}

            {/* 내부 내용 */}
            {tab === "작성내역" ? (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  <span className="text-[12px] border border-[#CCCCCC] rounded-full px-3 py-1">
                    {item.category}
                  </span>
                  {item.hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-[#CCE5FF] text-[12px] rounded-full px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-1">
                  <div className="text-[18px] sm:text-[20px] font-bold truncate w-full">
                    {item.title}
                  </div>
                  <div className="text-[14px] sm:text-[16px] text-[#666] line-clamp-2">
                    {item.content}
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-[#999] text-[14px] flex-wrap">
                  <span>닉네임</span>
                  <span>3일 전</span>
                  <div className="flex items-center gap-1">
                    <img src={eye} alt="views" className="w-4 h-4" />
                    {item.views}
                  </div>
                  <div className="flex items-center gap-1">
                    <img src={like} alt="likes" className="w-4 h-4" />
                    {item.likes}
                  </div>
                  <div className="flex items-center gap-1">
                    <img src={commentIcon} alt="comments" className="w-4 h-4" />
                    {item.comments}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="text-[18px] sm:text-[20px] font-bold truncate">
                  {item.title}
                </div>
                <div className="text-[14px] sm:text-[16px] text-[#666] line-clamp-2">
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
        <span className="cursor-pointer">&lt;</span>
        {[1, 2].map((n) => (
          <span
            key={n}
            className="mx-1 cursor-pointer w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#eee] transition"
          >
            {n}
          </span>
        ))}
        <span className="cursor-pointer">&gt;</span>
      </div>
    </div>
  );
};

export default MyPage;
