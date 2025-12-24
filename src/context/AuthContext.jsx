import { createContext, useEffect, useState, useMemo, useCallback, useContext } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Base URL for your Django Backend
const API_URL = "/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() =>
    localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null
  );
  const [tokens, setTokens] = useState(() =>
    localStorage.getItem("tokens") ? JSON.parse(localStorage.getItem("tokens")) : null
  );
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Helper: Check token validity
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
    navigate("/login");
  }, [navigate]);

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
      throw err;
    }
  }, []);

  // --- LOGIN (Standard) ---
  // --- LOGIN FUNCTION (Updated with Console Log) ---
  const loginUserWithAPI = useCallback(async (form, navigateUnused, toast) => {
    const { username, password } = form;

    // 1. Basic Validation
    if (!username || !password) {
      toast.warn("Please enter username and password");
      return;
    }

    try {
      // 2. Call API
      const res = await axios.post(`${API_URL}/login/`, { username, password });
      const { access, refresh } = res.data;

      // 3. Token Check:
      if (!access) {
        toast.warn("Login Failed: No Token Received. Check Console.");
        return;
      }

      // 4. User Data Setup
      let userData = {};
      if (res.data.user) {
        const userObj = res.data.user;
        const isAdmin = userObj.is_superuser || userObj.role === 'admin';
        userData = {
          id: userObj.pk || userObj.id,
          username: userObj.username,
          email: userObj.email,
          name: userObj.name || userObj.username,
          image: userObj.image,
          role: isAdmin ? "admin" : "user",
          is_superuser: isAdmin
        };
      } else {
        const decoded = jwtDecode(access);
        userData = {
          id: decoded.user_id,
          username: username,
          role: "user",
        };
      }

      // 5. Save & Update State
      loginUser(userData, { access, refresh });
      toast.success("Login Successful!");

      return userData;

    } catch (err) {
      console.error("Login Error:", err);
      const errorMessage = err.response?.data?.detail || "Invalid credentials";
      toast.error(errorMessage);
      throw err;
    }
  }, [loginUser]);

  // --- GOOGLE LOGIN (UPDATED) ---
  const googleLogin = useCallback(async (response, navigate, toast) => {
    try {
      // മാറ്റം 1: ലിങ്കിന്റെ അവസാനം സ്ലാഷ് (/) ഇട്ടു.
      // മാറ്റം 2: callback_url ആഡ് ചെയ്തു (ഇത് Backend-മായി മാച്ച് ആവണം).
      const res = await axios.post(`${API_URL}/auth/google/`, {
        code: response.code,
        callback_url: "https://project-ui-react.vercel.app"
      });

      const data = res.data;
      const access = data.access_token || data.access || data.key;
      const refresh = data.refresh_token || data.refresh || "";

      if (access) {
        let userData = {};
        const isAdmin = data.user?.is_superuser || data.user?.role === 'admin';

        if (data.user) {
          userData = {
            id: data.user.pk || data.user.id,
            username: data.user.username,
            email: data.user.email,
            name: data.user.name || data.user.username,
            image: data.user.image,
            role: isAdmin ? "admin" : "user",
            is_superuser: isAdmin
          };
        } else {
          userData = { username: "Google User", role: "user" };
        }

        loginUser(userData, { access, refresh });
        toast.success("Google Login Successful!");

        if (userData.role === "admin") navigate("/admin");
        else navigate("/");
      }
    } catch (err) {
      console.error("Google Login Error:", err); // കൺസോളിൽ എറർ കാണാൻ
      if (err.response?.data?.non_field_errors) {
        toast.error(err.response.data.non_field_errors[0]);
      } else {
        toast.error("Google Login Failed.");
      }
    }
  }, [loginUser]);

  // --- UPDATE PROFILE ---
  const updateProfile = useCallback(async (profileData) => {
    try {
      const token = tokens?.access;
      const response = await axios.patch(`${API_URL}/user/`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });

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

  // --- CHANGE PASSWORD ---
  const changePassword = useCallback(async (passwordData) => {
    try {
      const token = tokens?.access;
      await axios.post(`${API_URL}/password/change/`, passwordData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Password changed successfully!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Password change failed");
      throw err;
    }
  }, [tokens]);

  // --- PASSWORD RESET ---
  const requestPasswordReset = useCallback(async (email) => {
    try {
      await axios.post(`${API_URL}/password/reset/`, { email });
      toast.success("Password reset link sent!");
    } catch (err) {
      toast.error("Failed to send reset link.");
    }
  }, []);

  const confirmPasswordReset = useCallback(async (data) => {
    try {
      await axios.post(`${API_URL}/password/reset/confirm/`, data);
      toast.success("Password has been reset successfully!");
      return true;
    } catch (err) {
      toast.error("Failed to reset password.");
      return false;
    }
  }, []);

  // --- TOKEN VALIDATION EFFECT ---
  useEffect(() => {
    if (tokens && tokens.access) {
      if (!isTokenValid(tokens.access)) {
        logoutUser();
      }
    }
  }, [tokens, logoutUser]);

  const contextValue = useMemo(() => ({
    user,
    tokens,
    isLoading,
    loginUser,
    logoutUser,
    signupUser,
    loginUserWithAPI,
    googleLogin,
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

export const useAxios = () => {
  const { logoutUser } = useContext(AuthContext);

  return useMemo(() => {
    const instance = axios.create({ baseURL: API_URL });

    instance.interceptors.request.use(async (config) => {
      const storedTokens = localStorage.getItem("tokens");

      if (storedTokens) {
        const parsedTokens = JSON.parse(storedTokens);
        const token = parsedTokens?.access || parsedTokens?.key;

        if (token) {
          const isJWT = token.startsWith('eyJ');
          config.headers.Authorization = isJWT ? `Bearer ${token}` : `Token ${token}`;
        }
      }
      return config;
    }, (error) => Promise.reject(error));

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.warn("Unauthorized Access! Redirecting to login...");
          logoutUser();
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [logoutUser]);
};