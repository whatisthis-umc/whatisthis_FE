import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import MainPage from "./pages/MainPage";
import Navbar from "./components/Navbar";
import TipsPage from "./pages/TipsPage";
import Footer from "./components/Footer";
import NoticeListPage from "./pages/customer/NoticeListPage"; // 공지사항 목록
import QnaPage from "./pages/customer/QnaPage"; // Q&A
import InquiryPage from "./pages/customer/InquiryPage"; // 1:1 문의
import InquiryWritePage from "./pages/customer/InquiryWritePage"; // 1:1 문의 작성
import PostDetailPage from "./pages/PostDetailPage";
import CommunityPage from "./pages/CommunityPage";
import MyInfoPage from "./pages/MyInfoPage";
import { InquiryProvider } from "./contexts/InquiryContext";

function App() {
  return (
    <InquiryProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 pb-[1300px]">
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/tips" element={<TipsPage />} />
              <Route path="/customer/notice" element={<NoticeListPage />} />
              <Route path="/customer/qna" element={<QnaPage />} />
              <Route path="/customer/inquiry" element={<InquiryPage />} />
              <Route path="/customer/inquiry/write" element={<InquiryWritePage />} />
              <Route path="/post" element={<PostDetailPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/myinfo" element={<MyInfoPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </InquiryProvider>
  );
}

export default App;