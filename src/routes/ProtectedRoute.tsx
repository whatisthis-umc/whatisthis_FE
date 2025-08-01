import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem("adminAccessToken");

  // 토큰 없으면 로그인 페이지로
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // 토큰 있으면 자식 컴포넌트 렌더링
  return children;
}
