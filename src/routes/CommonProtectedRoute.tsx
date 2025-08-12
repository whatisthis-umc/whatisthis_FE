import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function CommonProtectedRoute() {
  const token = localStorage.getItem("accessToken");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
