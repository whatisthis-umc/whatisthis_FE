import { BrowserRouter, Route, Routes } from "react-router-dom";
import React from "react";
import "./App.css";
import MainPage from "./pages/MainPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import NoticeListPage from "./pages/customer/NoticeListPage"; // 공지사항 목록
import InquiryPage from "./pages/customer/InquiryPage"; // 1:1 문의
import InquiryWritePage from "./pages/customer/InquiryWritePage"; // 1:1 문의 작성
import QnaPage from "./pages/customer/QnaPage"; // Q&A
import PostDetailPage from "./pages/PostDetailPage";
import CommunityPage from "./pages/CommunityPage";
import MyInfoPage from "./pages/MyInfoPage";
import ItemsPage from "./pages/items/ItemsPage";
import ItemsDetailPage from "./pages/items/ItemsDetailPage";
import MyPage from "./pages/MyPage";
import LikesPage from "./pages/LikesPage";
import ScrapPage from "./pages/ScrapPage";
import { InquiryProvider } from "./contexts/InquiryContext";
import AdminDashboard from "./pages/AdminPages/AdminDashboard";
import AdminPostPage from "./pages/AdminPages/AdminPost/AdminPostPage";
import AdminLoginPage from "./pages/AdminPages/AdminLogin";
import AdminPostDetailPage from "./pages/AdminPages/AdminPost/AdminPostDetailPage";
import AdminPostEditPage from "./pages/AdminPages/AdminPost/AdminPostEditPage";
import AdminNoticePage from "./pages/AdminPages/AdminNotice/AdminNoticePage";
import TipsPage from "./pages/tips/TipsPage";
import ItemsPostDetailPage from "./pages/items/ItemsPostDetailPage";
import TipsPostDetailPage from "./pages/tips/TipsPostDetailPage";
import TipsDetailPage from "./pages/tips/TipsDetailPage";
import AdminNewPostPage from "./pages/AdminPages/AdminPost/AdminNewPostPage";
import AdminNewNoticePage from "./pages/AdminPages/AdminNotice/AdminNewNoticePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AdminNoticeDetailPage from "./pages/AdminPages/AdminNotice/AdminNoticeDetailPage";
import AdminQnaPage from "./pages/AdminPages/AdminQna/AdminQnaPage";
import AdminQnaDetailPage from "./pages/AdminPages/AdminQna/AdminQnaDetailPage";
import AdminQnaEditPage from "./pages/AdminPages/AdminQna/AdminQnaEditPage";
import AdminNewQnaPage from "./pages/AdminPages/AdminQna/AdminNewQnaPage";
import AdminNoticeEditPage from "./pages/AdminPages/AdminNotice/AdminNoticeEditPage";

function App() {
  return (
    <BrowserRouter>
      <InquiryProvider>
        <div className="min-h-screen flex flex-col">
          <div className="w-full max-w-[1440px] px-4 mx-auto flex flex-col flex-grow">
            <Navbar />
            <main className="flex-grow pb-[1300px]">
              <Routes>
                <Route path="/" element={<MainPage />} />

                <Route path="/my" element={<MyPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup/*" element={<SignupPage />} />
                
                <Route path="/likes" element={<LikesPage />} />
                <Route path="/scrap" element={<ScrapPage />} />
                <Route path="/post" element={<PostDetailPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/myinfo" element={<MyInfoPage />} />

                <Route path="/tips" element={<TipsPage />} />
                <Route path="/tips/list" element={<TipsDetailPage />} />
                <Route path="/tips/:id" element={<TipsPostDetailPage />} />

                <Route path="/items" element={<ItemsPage />} />
                <Route path="/items/list" element={<ItemsDetailPage />} />
                <Route path="/items/:id" element={<ItemsPostDetailPage />} />

                <Route path="/customer/notice" element={<NoticeListPage />} />
                <Route path="/customer/qna" element={<QnaPage />} />
                <Route path="/customer/inquiry" element={<InquiryPage />} />
                <Route
                  path="/customer/inquiry/write"
                  element={<InquiryWritePage />}
                />

                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin" element={<AdminDashboard />} />

                <Route path="/admin/notice" element={<AdminNoticePage />} />
                <Route path="/admin/notice/new" element={<AdminNewNoticePage />} />
                <Route path="/admin/notice/edit/:id" element={<AdminNoticeEditPage />} />
                <Route path="/admin/notice/:id" element={<AdminNoticeDetailPage />} />
                

                <Route path="/admin/post" element={<AdminPostPage />} />
                <Route
                  path="/admin/post/:id"
                  element={<AdminPostDetailPage />}
                />
                <Route
                  path="/admin/post/edit/:id"
                  element={<AdminPostEditPage />}
                />
                <Route path="/admin/post/new" element={<AdminNewPostPage />} />
                <Route path="/admin/qna" element={<AdminQnaPage />} />
                <Route path="/admin/qna/:id" element={<AdminQnaDetailPage />} />
                <Route path="/admin/qna/edit/:id" element={<AdminQnaEditPage />} />
                <Route path="/admin/qna/new" element={<AdminNewQnaPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </div>
      </InquiryProvider>
    </BrowserRouter>
  );
}

export default App;
