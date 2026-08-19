import { useState } from "react";
import { Mail, Lock, User, Key, ArrowRight, ShieldAlert, Sparkles, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, sendOtp, verifyOtp, forgotPassword, resetPassword } = useAuth();
  const { showToast } = useToast();

  // Prevent background page from scrolling when auth modal is open
  useBodyScrollLock(isOpen);

  const [authMode, setAuthMode] = useState("login"); // "login" | "signup" | "otp" | "forgot"
  const [forgotStep, setForgotStep] = useState(1); // 1: send otp, 2: verify & reset

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    setNewPassword("");
    setForgotStep(1);
  };

  const handleModeChange = (mode) => {
    resetForm();
    setAuthMode(mode);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast("Please enter both email and password.", "warning");
      return;
    }
    setIsSubmitting(true);
    const success = await login(email.trim(), password);
    setIsSubmitting(false);
    if (success) {
      onClose();
      resetForm();
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast("Please enter email and password.", "warning");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "warning");
      return;
    }
    if (password.length < 6) {
      showToast("Password must be at least 6 characters.", "warning");
      return;
    }
    setIsSubmitting(true);
    const success = await register(name.trim(), email.trim(), password);
    setIsSubmitting(false);
    if (success) {
      onClose();
      resetForm();
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast("Please enter your email address.", "warning");
      return;
    }
    setIsSubmitting(true);
    const success = await sendOtp(email.trim());
    setIsSubmitting(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!email.trim() || !otp.trim()) {
      showToast("Please enter email and verification code.", "warning");
      return;
    }
    setIsSubmitting(true);
    const success = await verifyOtp(email.trim(), otp.trim());
    setIsSubmitting(false);
    if (success) {
      onClose();
      resetForm();
    }
  };

  const handleForgotSend = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast("Please enter your email address.", "warning");
      return;
    }
    setIsSubmitting(true);
    const success = await forgotPassword(email.trim());
    setIsSubmitting(false);
    if (success) {
      setForgotStep(2);
    }
  };

  const handleForgotReset = async (e) => {
    e.preventDefault();
    if (!email.trim() || !otp.trim() || !newPassword.trim()) {
      showToast("Please fill in all fields.", "warning");
      return;
    }
    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters.", "warning");
      return;
    }
    setIsSubmitting(true);
    const success = await resetPassword(email.trim(), otp.trim(), newPassword);
    setIsSubmitting(false);
    if (success) {
      onClose();
      resetForm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-card-bg border border-border-color rounded-2xl w-full max-w-md p-6 shadow-2xl relative flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-border-color/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tabs */}
        <div className="flex flex-col gap-1 text-center">
          <div className="mx-auto p-2.5 rounded-xl bg-accent-primary/10 text-accent-primary w-fit mb-1">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-text-main">
            {authMode === "login" && "Welcome Back"}
            {authMode === "signup" && "Create an Account"}
            {authMode === "otp" && "One-Time Code Login"}
            {authMode === "forgot" && "Reset Your Password"}
          </h2>
          <p className="text-xs text-text-muted">
            {authMode === "login" && "Sign in to save complexity history and sync profiles"}
            {authMode === "signup" && "Join BigO.ai for unlimited complexity simulations & history"}
            {authMode === "otp" && "Passwordless sign in with verification code sent to your email"}
            {authMode === "forgot" && "Verify your email to create a new secure password"}
          </p>
        </div>

        {/* Tab switch buttons */}
        {authMode !== "forgot" && (
          <div className="flex rounded-xl bg-bg-dark/60 p-1 border border-border-color">
            <button
              onClick={() => handleModeChange("login")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                authMode === "login" ? "bg-accent-primary text-white shadow-sm" : "text-text-muted hover:text-text-main"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleModeChange("signup")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                authMode === "signup" ? "bg-accent-primary text-white shadow-sm" : "text-text-muted hover:text-text-main"
              }`}
            >
              Register
            </button>
            <button
              onClick={() => handleModeChange("otp")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                authMode === "otp" ? "bg-accent-primary text-white shadow-sm" : "text-text-muted hover:text-text-main"
              }`}
            >
              OTP Code
            </button>
          </div>
        )}

        {/* LOGIN FORM */}
        {authMode === "login" && (
          <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text-muted">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="developer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-bg-dark/80 border border-border-color rounded-xl text-sm text-text-main focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-text-muted">Password</label>
                <button
                  type="button"
                  onClick={() => handleModeChange("forgot")}
                  className="text-[11px] text-accent-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-bg-dark/80 border border-border-color rounded-xl text-sm text-text-main focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full py-2.5 bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? "Authenticating..." : "Sign In to BigO.ai"}
            </button>
          </form>
        )}

        {/* SIGNUP FORM */}
        {authMode === "signup" && (
          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text-muted">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Alex Rivers"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-bg-dark/80 border border-border-color rounded-xl text-sm text-text-main focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text-muted">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="developer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-bg-dark/80 border border-border-color rounded-xl text-sm text-text-main focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text-muted">Password (min 6 chars)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-bg-dark/80 border border-border-color rounded-xl text-sm text-text-main focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text-muted">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-bg-dark/80 border border-border-color rounded-xl text-sm text-text-main focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full py-2.5 bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? "Creating Account..." : "Complete Registration"}
            </button>
          </form>
        )}

        {/* OTP FORM */}
        {authMode === "otp" && (
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text-muted">Email Address</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="developer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-bg-dark/80 border border-border-color rounded-xl text-sm text-text-main focus:outline-none focus:border-accent-primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSubmitting || !email.trim()}
                  className="px-3.5 py-2 bg-bg-dark border border-border-color hover:border-accent-primary text-xs font-semibold text-text-main rounded-xl transition-all disabled:opacity-50 whitespace-nowrap"
                >
                  Send OTP
                </button>
              </div>
            </div>

            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-muted">6-Digit Code</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-bg-dark/80 border border-border-color rounded-xl text-sm font-mono tracking-widest text-text-main focus:outline-none focus:border-accent-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !otp.trim()}
                className="w-full py-2.5 bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? "Verifying..." : "Verify & Enter BigO.ai"}
              </button>
            </form>
          </div>
        )}

        {/* FORGOT PASSWORD FORM */}
        {authMode === "forgot" && (
          <div className="flex flex-col gap-3.5">
            {forgotStep === 1 ? (
              <form onSubmit={handleForgotSend} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-muted">Account Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="developer@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-bg-dark/80 border border-border-color rounded-xl text-sm text-text-main focus:outline-none focus:border-accent-primary"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? "Sending Reset Code..." : "Send Reset Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotReset} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-muted">6-Digit Code</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-bg-dark/80 border border-border-color rounded-xl text-sm font-mono tracking-widest text-text-main focus:outline-none focus:border-accent-primary"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-muted">New Password (min 6 chars)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-bg-dark/80 border border-border-color rounded-xl text-sm text-text-main focus:outline-none focus:border-accent-primary"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-1 w-full py-2.5 bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? "Updating Password..." : "Update Password & Sign In"}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => handleModeChange("login")}
              className="text-xs text-text-muted hover:text-text-main text-center mt-1"
            >
              ← Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
