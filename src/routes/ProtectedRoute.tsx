import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6f9] flex flex-col justify-center items-center">
        <Loader2 className="animate-spin text-blue-700" size={40} />
        <p className="mt-3 text-gray-600 font-medium">Đang xác thực hệ thống...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
