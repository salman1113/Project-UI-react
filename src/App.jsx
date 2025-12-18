import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext } from "react";

// Context Providers
import { AuthContext, AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

// Layouts and Components
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";
// 👇 Import both guards
import { PrivateRoute, PublicRoute } from "./components/ProtectedRoute"; 
import AdminProtectedRoute from "./admin/components/AdminProtectedRoute";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Success from "./pages/Success";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings"; 
import ForgotPassword from "./pages/ForgotPassword";
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm";

// Admin Pages
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminProducts from "./admin/pages/AdminProducts";
import AdminUsers from "./admin/pages/AdminUsers";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ToastContainer
              position="bottom-left"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              theme="dark"
            />
            <AppContent />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

const AppContent = () => {
  const { user } = useContext(AuthContext);

  // ADMIN ROUTING
  if (user?.role === "admin") {
    return (
      <AdminLayout>
        <Routes>
          <Route element={<AdminProtectedRoute />}>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AdminLayout>
    );
  }

  // USER ROUTING
  return (
    <UserLayout>
      <Routes>
        {/* 🟢 OPEN ROUTES (Anyone can access) */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        
        {/* 🟡 PUBLIC ROUTES (Only for Guests - No Logged In Users) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/password-reset/confirm/:uid/:token" element={<ResetPasswordConfirm />} />
        </Route>

        {/* 🔴 PRIVATE ROUTES (Login Required) */}
        <Route element={<PrivateRoute />}>
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/success" element={<Success />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </UserLayout>
  );
};

export default App;