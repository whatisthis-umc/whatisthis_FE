import { Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import AdminDashboard from '../pages/AdminDashboard'; 
import AdminPostPage from '../pages/AdminPost';       
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/posts" element={<AdminPostPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}