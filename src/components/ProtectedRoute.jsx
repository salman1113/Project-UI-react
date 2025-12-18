import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// 👇 Loading Spinner Component (Reused)
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#001427]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f4d58d] mx-auto mb-4"></div>
      <p className="text-[#708d81]">Loading...</p>
    </div>
  </div>
);

// ✅ 1. PRIVATE ROUTE (Only for Logged In Users)
// Cart, Orders, Settings ഒക്കെ ഇതിൽ വരും
export const PrivateRoute = () => {
  const { user, isLoading } = useContext(AuthContext);
  const location = useLocation();

  if (isLoading) return <LoadingSpinner />;

  return user ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

// ✅ 2. PUBLIC ROUTE (Only for Guests)
// Login, Signup ഒക്കെ ഇതിൽ വരും. ലോഗിൻ ചെയ്തവർ വന്നാൽ Home-ലേക്ക് വിടും.
export const PublicRoute = () => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) return <LoadingSpinner />;

  return user ? <Navigate to="/" replace /> : <Outlet />;
};

export default PrivateRoute; // Default export for backward compatibility if needed