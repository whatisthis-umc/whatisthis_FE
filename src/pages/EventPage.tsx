import { useNavigate } from "react-router-dom";
import { event } from "../assets";

const EventPage = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 md:px-8 pt-8 md:pt-12">
      <img
        src={event}
        alt="이벤트페이지"
        className="w-full max-w-[1000px] h-auto rounded-2xl mx-auto"
      />

      <div className="flex justify-center mt-8 md:mt-12">
        <button
          onClick={() => navigate("/post/602")}
          className="bg-[#0080FF] hover:bg-[#0066CC] text-white font-semibold px-8 md:px-12 py-3 md:py-4 rounded-3xl text-base md:text-lg transition-colors duration-200 shadow-lg hover:shadow-xl cursor-pointer"
        >
          ⭐️ 꿀팁 공유하러 가기 ⭐️
        </button>
      </div>
    </div>
  );
};

export default EventPage;
