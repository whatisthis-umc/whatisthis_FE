import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import MainPage from "./pages/MainPage";
import Navbar from "./components/Navbar";
import TipsPage from "./pages/TipsPage";
import Footer from "./components/Footer";
<<<<<<< HEAD
import CustomerPage from "./pages/customer/CustomerPage"; // 고객센터 메인
import NoticeListPage from "./pages/customer/NoticeListPage"; // 공지사항 목록
import NoticeDetailPage from "./pages/customer/NoticeDetailPage"; // 공지사항 상세
import QnaPage from "./pages/customer/QnaPage"; // 1:1 문의

=======
import PostDetailPage from "./pages/PostDetailPage";
import CommunityPage from "./pages/CommunityPage";
import MyInfoPage from "./pages/MyInfoPage";
>>>>>>> main

function App() {
  return (
    <BrowserRouter>
<<<<<<< HEAD
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/tips" element={<TipsPage />} />
          <Route path="/customer" element={<CustomerPage />} />
          <Route path="/customer/notice" element={<NoticeListPage />} />
          <Route path="/customer/notice/:id" element={<NoticeDetailPage />} />
          <Route path="/customer/qna" element={<QnaPage />} />
        </Routes>
=======
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/tips" element={<TipsPage />} />
            <Route path="/post" element={<PostDetailPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/myinfo" element={<MyInfoPage />} />
          </Routes>
        </main>
>>>>>>> main
        <Footer />
      </div>
    </BrowserRouter>
  );
}
<<<<<<< HEAD

=======
>>>>>>> main
export default App;