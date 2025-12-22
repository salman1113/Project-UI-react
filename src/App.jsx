import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

// Layouts
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./admin/components/AdminLayout";

// Guards
import { PrivateRoute, PublicRoute } from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

// User Pages
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
import Notifications from "./pages/Notifications";
import AdminProducts from "./admin/pages/AdminProducts";
import AdminUsers from "./admin/pages/AdminUsers";

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ToastContainer position="bottom-left" autoClose={2000} theme="dark" />

          <Routes>
            {/* 🛡️ ADMIN ROUTES */}
            <Route path="/admin" element={<AdminProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
              </Route>
            </Route>

            {/* 👤 USER ROUTES */}
            <Route element={<UserLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />

              {/* Public Routes (Logged out users only) */}
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/password-reset/confirm/:uid/:token" element={<ResetPasswordConfirm />} />
              </Route>

              {/* Private Routes (Logged in users only) */}
              <Route element={<PrivateRoute />}>
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/success" element={<Success />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>

        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;