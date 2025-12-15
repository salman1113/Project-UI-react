import { createContext, useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; 
import { useNavigate } from "react-router-dom";

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
      // If it's not a JWT (e.g. standard token), assume valid if it exists
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

  // --- SIGNUP (Register) ---
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
      console.error("Signup error:", err);
    }
  }, []);

  // --- LOGIN (Standard Username/Password) - FIXED ---
  const loginUserWithAPI = useCallback(async (form, navigate, toast) => {
    const { username, password } = form;

    if (!username || !password) {
      toast.warn("Please enter username and password");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/login/`, {
        username: username,
        password: password,
      });

      const { access, refresh } = res.data;
      
      let userData = {};

      // Case 1: If backend sends full user object (Like in Google Login config)
      if (res.data.user) {
         const userObj = res.data.user;
         userData = {
            id: userObj.pk || userObj.id,
            username: userObj.username,
            email: userObj.email,
            name: userObj.name || userObj.username, 
            image: userObj.profile_image,
            role: "user",       
         };
      } 
      // Case 2: If backend sends only Token (Standard JWT Response) -> Use Fallback
      else {
         const decoded = jwtDecode(access);
         userData = {
            id: decoded.user_id,
            username: username, // Form-ൽ നിന്ന് എടുത്ത username
            email: "", 
            name: username,     // Fallback name
            image: null,        // No image available in standard token
            role: "user",       
         };
      }

      loginUser(userData, { access, refresh });
      toast.success("Login successful");
      navigate("/");

    } catch (err) {
      // 401 Error വന്നാൽ പാസ്‌വേഡ് തെറ്റാണ് എന്നാണ് അർത്ഥം
      const errorMessage = err.response?.data?.detail || "Invalid credentials";
      toast.error(errorMessage);
      console.error("Login error:", err);
    }
  }, [loginUser]);

  // --- GOOGLE LOGIN (Hybrid Support) ---
  const googleLogin = useCallback(async (response, navigate, toast) => {
    try {
      const res = await axios.post(`${API_URL}/auth/google/`, {
        code: response.code, 
      });

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
                image: data.user.profile_image,
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
                console.log("Using standard token login");
                userData = {
                    username: "Google User",
                    name: "Google User",
                    role: "user"
                };
             }
        }

        loginUser(userData, { access, refresh });

        toast.success("Google Login Successful!");
        navigate("/");
      }
    } catch (err) {
      console.error("Google Login Error:", err);
      if (err.response?.data?.non_field_errors) {
        toast.error(err.response.data.non_field_errors[0]);
      } else {
        toast.error("Google Login Failed. Please try again.");
      }
    }
  }, [loginUser]);


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
  }), [user, tokens, isLoading, loginUser, logoutUser, signupUser, loginUserWithAPI, googleLogin]);

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
    const instance = axios.create({
      baseURL: API_URL,
    });

    instance.interceptors.request.use(async (config) => {
      if (token) {
        const isJwt = token.split('.').length === 3;
        config.headers.Authorization = isJwt ? `Bearer ${token}` : `Token ${token}`;
      }
      return config;
    }, (error) => {
      return Promise.reject(error);
    });

    return instance;
  }, [token]);

  return axiosInstance;
};