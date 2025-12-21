import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff, FiLoader } from "react-icons/fi";
import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const { loginUserWithAPI, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- GOOGLE LOGIN HOOK ---
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (response) => googleLogin(response, navigate, toast),
    onError: () => toast.error("Google Login Failed"),
    flow: 'auth-code',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ FIX: Admin Redirection Logic Logic Here
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Call API and WAIT for userData response
      const userData = await loginUserWithAPI(form, null, toast); 
      
      // 2. Check Role & Redirect
      if (userData) {
          if (userData.is_superuser || userData.role === 'admin') {
              console.log("Redirecting to Admin...");
              navigate("/admin"); // 👑 Go to Admin Dashboard
          } else {
              console.log("Redirecting to Home...");
              navigate("/"); // 🛒 Go to User Home
          }
      }
      
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('https://www.apple.com/v/airpods-max/i/images/overview/product-stories/anc/anc_airpod_max_lifestyle__duzobvqwpz42_large_2x.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md p-8 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl"
        style={{ boxShadow: "0 8px 32px 0 rgba(191, 6, 3, 0.2)" }}
      >
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-3xl font-bold mb-8 text-center"
          style={{ color: "#f4d58d" }}
        >
          Welcome Back
        </motion.h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#f4d58d] placeholder-white/70 text-white"
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="relative">
                <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#f4d58d] placeholder-white/70 text-white pr-10"
                required
                />
                <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-[#f4d58d]"
                >
                {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
            </div>
            
            {/* Forgot Password Link */}
            <div className="flex justify-end mt-2">
                <Link 
                    to="/forgot-password" 
                    className="text-sm font-medium hover:underline transition-colors"
                    style={{ color: "#f4d58d" }}
                >
                    Forgot Password?
                </Link>
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            style={{
              backgroundColor: "#bf0603",
              color: "#f2e8cf",
              boxShadow: "0 4px 14px 0 rgba(191, 6, 3, 0.4)",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" /> Logging In...
              </>
            ) : (
              "Login"
            )}
          </motion.button>

          {/* --- GOOGLE LOGIN --- */}
          <div className="mt-4 flex flex-col gap-4">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-white/20 w-full"></div>
              <span className="bg-transparent px-2 text-sm text-white/50">OR</span>
              <div className="border-t border-white/20 w-full"></div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => handleGoogleLogin()}
              className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 bg-white text-gray-800 hover:bg-gray-100 transition-colors"
            >
              <FcGoogle className="text-xl" />
              Continue with Google
            </motion.button>
          </div>

        </form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center mt-6 text-sm"
          style={{ color: "#f2e8cf" }}
        >
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="cursor-pointer font-semibold hover:underline"
            style={{ color: "#f4d58d" }}
          >
            Sign up
          </span>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;