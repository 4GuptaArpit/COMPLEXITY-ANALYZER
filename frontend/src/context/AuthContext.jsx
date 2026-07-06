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

  const socialLogin = async (provider) => {
    try {
      const mockEmail = provider === "Google" ? "google.coder@gmail.com" : "github.developer@github.com";
      const otpSent = await sendOtp(mockEmail);
      if (otpSent) {
        return await verifyOtp(mockEmail, "1234");
      }
      return false;
    } catch (err) {
      showToast("Social Login Failed", "error");
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

  const purchase = async (option) => {
    try {
      const { data } = await client.post("/billing/purchase", { option });
      setUser(data.user);
      showToast(data.message, "success");
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Purchase transaction failed.";
      showToast(errorMsg, "error");
      return false;
    }
  };

  const deductSimToken = async () => {
    if (!token || user?.id === "demo_id") {
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          tokens: Math.max(0, prev.tokens - 1)
        };
      });
      return true;
    }

    try {
      const { data } = await client.patch("/billing/deduct-token");
      setUser(data.user);
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Token deduction failed.";
      showToast(errorMsg, "error");
      return false;
    }
  };

  const handleDemoSetTier = (tier) => {
    if (tier === "anonymous") {
      logout();
      return;
    }
    setUser((prev) => {
      if (!prev) {
        // If not logged in, mock a contact for demo purposes
        const mockContact = tier === "premium" ? "+919988776655" : "alex.coder@gmail.com";
        return {
          id: "demo_id",
          contact: mockContact,
          tier,
          tokens: tier === "premium" ? 70 : 0,
        };
      }
      return {
        ...prev,
        tier,
        tokens: tier === "premium" ? 70 : 0,
      };
    });
    showToast(`Tier switched to ${tier.toUpperCase()} for demo.`, "info");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        sendOtp,
        verifyOtp,
        socialLogin,
        logout,
        changePassword,
        purchase,
        handleDemoSetTier,
        deductSimToken
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
