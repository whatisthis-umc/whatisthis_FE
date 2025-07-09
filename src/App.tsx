import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import MainPage from "./pages/MainPage";
import Navbar from "./components/Navbar";
import TipsPage from "./pages/TipsPage";
import Footer from "./components/Footer";
import PostDetailPage from "./pages/PostDetailPage";
import CommunityPage from "./pages/CommunityPage";
import MyInfoPage from "./pages/MyInfoPage";

function App() {
  return (
    <BrowserRouter>
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
        <Footer />
      </div>
    </BrowserRouter>
  );
}
export default App;