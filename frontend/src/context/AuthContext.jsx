import { createContext, useContext, useState, useEffect } from "react";
import client from "../api/client";
import { useToast } from "./ToastContext";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("BIGO_JWT_TOKEN"));
  const [loading, setLoading] = useState(true);

  // Sync profile on token change or initial load
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

  // Handle unauthorized global event dispatched from axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem("BIGO_JWT_TOKEN");
      setToken(null);
      setUser(null);
      showToast("Session expired. Please log in again.", "info");
    };

    window.addEventListener("bigo:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("bigo:unauthorized", handleUnauthorized);
  }, [showToast]);

  const register = async (name, contact, password) => {
    try {
      const { data } = await client.post("/auth/register", { name, contact, password });
      localStorage.setItem("BIGO_JWT_TOKEN", data.token);
      setToken(data.token);
      setUser(data.user);
      showToast("Account created successfully! Welcome to BigO.ai.", "success");
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
      showToast("Verification code dispatched to " + contact, "success");
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
      const errorMsg = err.response?.data?.error || "Invalid or expired verification code.";
      showToast(errorMsg, "error");
      return false;
    }
  };

  const forgotPassword = async (contact) => {
    try {
      const { data } = await client.post("/auth/forgot-password", { contact });
      showToast(data.message || "Reset instructions sent to your email.", "info");
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to request password reset.";
      showToast(errorMsg, "error");
      return false;
    }
  };

  const resetPassword = async (contact, otp, newPassword) => {
    try {
      const { data } = await client.post("/auth/reset-password", { contact, otp, newPassword });
      if (data.token) {
        localStorage.setItem("BIGO_JWT_TOKEN", data.token);
        setToken(data.token);
        setUser(data.user);
      }
      showToast(data.message || "Password reset successfully!", "success");
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to reset password.";
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

  const deleteAccount = async (password) => {
    try {
      await client.delete("/user/account", { data: { password } });
      localStorage.removeItem("BIGO_JWT_TOKEN");
      setToken(null);
      setUser(null);
      showToast("Your account has been deleted permanently.", "info");
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to delete account.";
      showToast(errorMsg, "error");
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
        forgotPassword,
        resetPassword,
        updateProfile,
        logout,
        changePassword,
        deleteAccount,
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
