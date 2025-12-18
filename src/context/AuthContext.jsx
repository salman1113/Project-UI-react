import { createContext, useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; 
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Base URL for your Django Backend
const API_URL = "http://localhost:8000/api";

export const AuthContext = createContext({
  user: null,
  tokens: null,
  isLoading: true,
  loginUser: () => { },
  logoutUser: () => { },
  signupUser: () => { },
  loginUserWithAPI: () => { },
  googleLogin: () => { },
  // pass Functions
  updateProfile: () => { },
  changePassword: () => { },
  requestPasswordReset: () => { },
  confirmPasswordReset: () => { },
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper: Check if token is valid
  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return !!token;
    }
  };

  // Internal helper to set state and localStorage
  const loginUser = useCallback((userData, tokenData) => {
    setUser(userData);
    setTokens(tokenData);
    localStorage.setItem("tokens", JSON.stringify(tokenData));
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  const logoutUser = useCallback(() => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem("tokens");
    localStorage.removeItem("user");
  }, []);

  // --- SIGNUP ---
  const signupUser = useCallback(async (form, navigate, toast) => {
    const { name, email, password } = form; 
    try {
      await axios.post(`${API_URL}/register/`, {
        username: name, 
        email: email,
        password: password,
      });
      toast.success("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      const errorMsg = err.response?.data?.username?.[0] || err.response?.data?.email?.[0] || "Signup failed";
      toast.error(errorMsg);
    }
  }, []);

  // --- LOGIN (Standard) ---
  const loginUserWithAPI = useCallback(async (form, navigate, toast) => {
    const { username, password } = form;
    if (!username || !password) {
      toast.warn("Please enter username and password");
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/login/`, { username, password });
      const { access, refresh } = res.data;
      
      let userData = {};
      if (res.data.user) {
         const userObj = res.data.user;
         userData = {
            id: userObj.pk || userObj.id,
            username: userObj.username,
            email: userObj.email,
            name: userObj.name || userObj.username, 
            image: userObj.image,
            role: "user",       
         };
      } else {
         const decoded = jwtDecode(access);
         userData = {
            id: decoded.user_id,
            username: username,
            email: "", 
            name: username,
            image: null,
            role: "user",       
         };
      }
      loginUser(userData, { access, refresh });
      toast.success("Login successful");
      navigate("/");
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "Invalid credentials";
      toast.error(errorMessage);
    }
  }, [loginUser]);

  // --- GOOGLE LOGIN ---
  const googleLogin = useCallback(async (response, navigate, toast) => {
    try {
      const res = await axios.post(`${API_URL}/auth/google/`, { code: response.code });
      const data = res.data;
      const access = data.access_token || data.access || data.key;
      const refresh = data.refresh_token || data.refresh || "";

      if (access) {
        let userData = {};
        if (data.user) {
            userData = {
                id: data.user.pk || data.user.id,
                username: data.user.username,
                email: data.user.email,
                name: data.user.name || data.user.username,
                image: data.user.image,
                role: "user"
            };
        } else {
             try {
                const decoded = jwtDecode(access);
                userData = {
                    id: decoded.user_id,
                    username: decoded.username || "Google User",
                    email: decoded.email || "",
                    name: decoded.username || "Google User",
                    role: "user"
                };
             } catch (e) {
                userData = { username: "Google User", name: "Google User", role: "user" };
             }
        }
        loginUser(userData, { access, refresh });
        toast.success("Google Login Successful!");
        navigate("/");
      }
    } catch (err) {
      if (err.response?.data?.non_field_errors) {
        toast.error(err.response.data.non_field_errors[0]);
      } else {
        toast.error("Google Login Failed. Please try again.");
      }
    }
  }, [loginUser]);

  // NEW: UPDATE PROFILE (Name, etc.) ---
  const updateProfile = useCallback(async (profileData) => {
    try {
      const token = tokens?.access;
      const response = await axios.patch(`${API_URL}/user/`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state with new info
      const updatedUser = { ...user, ...response.data };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile.");
      throw err;
    }
  }, [tokens, user]);

  // NEW: CHANGE PASSWORD (For Logged In Users) ---
  const changePassword = useCallback(async (passwordData) => {
    try {
      const token = tokens?.access;
      await axios.post(`${API_URL}/password/change/`, passwordData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Password changed successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Password change failed");
      throw err;
    }
  }, [tokens]);

  // NEW: REQUEST PASSWORD RESET (Forgot Password) ---
  const requestPasswordReset = useCallback(async (email) => {
    try {
      await axios.post(`${API_URL}/password/reset/`, { email });
      toast.success("Password reset link sent to your email!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send reset link. Please check the email.");
    }
  }, []);

  // NEW: CONFIRM PASSWORD RESET (From Email Link) ---
  const confirmPasswordReset = useCallback(async (data) => {
    try {
      await axios.post(`${API_URL}/password/reset/confirm/`, data);
      toast.success("Password has been reset successfully! Please login.");
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Failed to reset password. Link might be expired.");
      return false;
    }
  }, []);

  // --- RESTORE SESSION ---
  useEffect(() => {
    const loadUser = () => {
      const storedTokens = localStorage.getItem("tokens");
      const storedUser = localStorage.getItem("user");

      if (storedTokens && storedUser) {
        const parsedTokens = JSON.parse(storedTokens);
        const parsedUser = JSON.parse(storedUser);

        if (parsedTokens.access && isTokenValid(parsedTokens.access)) {
          setUser(parsedUser);
          setTokens(parsedTokens);
        } else {
          logoutUser();
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, [logoutUser]);

  const contextValue = useMemo(() => ({
    user,
    tokens,
    isLoading,
    loginUser,
    logoutUser,
    signupUser,
    loginUserWithAPI,
    googleLogin,
    // Add new functions to context
    updateProfile,
    changePassword,
    requestPasswordReset,
    confirmPasswordReset
  }), [user, tokens, isLoading, loginUser, logoutUser, signupUser, loginUserWithAPI, googleLogin, updateProfile, changePassword, requestPasswordReset, confirmPasswordReset]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// --- AXIOS INTERCEPTOR ---
export const useAxios = () => {
  const storedTokens = localStorage.getItem("tokens");
  const token = storedTokens ? JSON.parse(storedTokens)?.access : null;

  const axiosInstance = useMemo(() => {
    const instance = axios.create({ baseURL: API_URL });
    instance.interceptors.request.use(async (config) => {
      if (token) {
        const isJwt = token.split('.').length === 3;
        config.headers.Authorization = isJwt ? `Bearer ${token}` : `Token ${token}`;
      }
      return config;
    }, (error) => Promise.reject(error));
    return instance;
  }, [token]);
  return axiosInstance;
};