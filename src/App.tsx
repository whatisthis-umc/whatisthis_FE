
import { BrowserRouter, Route, Routes,Navigate } from "react-router-dom";
import "./App.css";
import MainPage from "./pages/MainPage";
import Navbar from "./components/Navbar";
import TipsPage from "./pages/TipsPage";
import Footer from "./components/Footer";

import CustomerPage from "./pages/customer/CustomerPage"; // 고객센터 메인
import NoticeListPage from "./pages/customer/NoticeListPage"; // 공지사항 목록
import NoticeDetailPage from "./pages/customer/NoticeDetailPage"; // 공지사항 상세
import QnaPage from "./pages/customer/QnaPage"; // 1:1 문의


import PostDetailPage from "./pages/PostDetailPage";
import CommunityPage from "./pages/CommunityPage";
import MyInfoPage from "./pages/MyInfoPage";
import LoginPage from '../pages/LoginPage';
import AdminDashboard from '../pages/AdminDashboard'; 
import AdminPostPage from '../pages/AdminPost';   


function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className = "flex-1 pb-[-1300px]">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/tips" element={<TipsPage />} />
          <Route path="/customer" element={<CustomerPage />} />
          <Route path="/customer/notice" element={<NoticeListPage />} />
          <Route path="/customer/notice/:id" element={<NoticeDetailPage />} />
          <Route path="/customer/qna" element={<QnaPage />} />
          <Route path="/post" element={<PostDetailPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/myinfo" element={<MyInfoPage />} />
            <Route path="/" element={<LoginPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/posts" element={<AdminPostPage />} />
      <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

