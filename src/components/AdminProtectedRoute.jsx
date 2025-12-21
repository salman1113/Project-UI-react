import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const AdminProtectedRoute = () => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#001427] flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-[#f4d58d] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Check if Admin
  return user && (user.is_superuser || user.role === "admin") ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default AdminProtectedRoute;