import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Check if JWT token expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch (err) {
      return true;
    }
  };

  // ✅ Set or remove Authorization header globally
  const setAuthToken = useCallback((token) => {
    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete API.defaults.headers.common["Authorization"];
    }
  }, []);

  // ✅ Initialize user from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user") || "null");

      if (token && userData) {
        if (isTokenExpired(token)) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        } else {
          setAuthToken(token);
          setUser(userData);
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, [setAuthToken]);

  // ✅ Login function
  const login = async (credentials) => {
    try {
      console.log("🔹 Sending login request:", {
        email: credentials.email,
        hasPassword: !!credentials.password,
      });

      const response = await API.post("/auth/login", {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      });

      console.log("✅ Login response:", response.data);

      // ✅ Support both accessToken or token
      const token = response.data.accessToken || response.data.token;
      const user = response.data.user;

      if (!token || !user) {
        throw new Error("Invalid response from server");
      }

      // ✅ Save user and token
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setAuthToken(token);
      setUser(user);

      console.log("✅ Login successful for user:", user.email);
      return user;
    } catch (error) {
      console.error("❌ Login error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  };

  // ✅ Register function
  const register = async (userData) => {
    try {
      const response = await API.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      console.error("❌ Registration error:", error);
      throw error;
    }
  };

  // ✅ Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthToken(null);
    setUser(null);
    navigate("/login");
  }, [navigate, setAuthToken]);

  // ✅ Check if authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    return !!token && !isTokenExpired(token);
  };

  // ✅ Update user data locally
  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
