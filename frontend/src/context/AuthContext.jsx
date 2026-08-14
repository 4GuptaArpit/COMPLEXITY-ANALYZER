import { createContext, useContext, useState, useEffect } from "react";
import client from "../api/client";
import { useToast } from "./ToastContext";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("BIGO_JWT_TOKEN"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const { data } = await client.get("/user/profile");
        setUser(data);
      } catch (err) {
        console.error("Session verification failed", err);
        localStorage.removeItem("BIGO_JWT_TOKEN");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const register = async (name, contact, password) => {
    try {
      const { data } = await client.post("/auth/register", { name, contact, password });
      localStorage.setItem("BIGO_JWT_TOKEN", data.token);
      setToken(data.token);
      setUser(data.user);
      showToast("Account created successfully! Logged in.", "success");
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Registration failed.";
      showToast(errorMsg, "error");
      return false;
    }
  };

  const login = async (contact, password) => {
    try {
      const { data } = await client.post("/auth/login", { contact, password });
      localStorage.setItem("BIGO_JWT_TOKEN", data.token);
      setToken(data.token);
      setUser(data.user);
      showToast("Welcome back! Logged in successfully.", "success");
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Authentication failed.";
      showToast(errorMsg, "error");
      return false;
    }
  };

  const sendOtp = async (contact) => {
    try {
      await client.post("/auth/send-otp", { contact });
      showToast("OTP sent successfully to " + contact, "success");
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to send verification code.";
      showToast(errorMsg, "error");
      return false;
    }
  };

  const verifyOtp = async (contact, otp) => {
    try {
      const { data } = await client.post("/auth/verify-otp", { contact, otp });
      localStorage.setItem("BIGO_JWT_TOKEN", data.token);
      setToken(data.token);
      setUser(data.user);
      showToast("Verification successful! Logged in.", "success");
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Invalid verification code.";
      showToast(errorMsg, "error");
      return false;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await client.patch("/user/profile", profileData);
      setUser(data.user);
      showToast(data.message || "Profile updated successfully!", "success");
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to update profile.";
      showToast(errorMsg, "error");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("BIGO_JWT_TOKEN");
    setToken(null);
    setUser(null);
    showToast("Logged out successfully.", "info");
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await client.patch("/user/password", { currentPassword, newPassword });
      showToast("Password updated successfully!", "success");
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to update password.";
      return { success: false, message: errorMsg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        sendOtp,
        verifyOtp,
        updateProfile,
        logout,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
