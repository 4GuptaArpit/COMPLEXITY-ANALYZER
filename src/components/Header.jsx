import React, { useState } from "react";
import { Settings, Award, CreditCard, Sparkles, Coins, Sun, Moon, LogIn, LogOut, User, Clock, Zap } from "lucide-react";
import { getApiKey, saveApiKey } from "../geminiService";

export default function Header({
  userTier,
  setUserTier,
  tokens,
  onOpenCheckout,
  theme,
  setTheme,
  userContact,
  onOpenLogin,
  onLogout,
  isSidebarOpen,
  onToggleSidebar
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getApiKey());

  const handleSaveSettings = () => {
    saveApiKey(apiKeyInput);
    setShowSettings(false);
    window.location.reload();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="glass-panel flex justify-between items-center p-3 px-4 rounded-xl relative z-50">
      <div className="flex items-center gap-2">
        <Sparkles size={22} className="text-primary" />
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-text-main via-primary to-secondary bg-clip-text text-transparent">
          BigO.ai
        </span>
        <span className="bg-gradient-to-r from-primary to-secondary text-[10px] font-bold px-1.5 py-0.5 rounded text-white uppercase tracking-wider">
          Beta
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Toggle Theme */}
        <button
          className="bg-white/5 dark:bg-black/3 border border-border-color text-text-main p-2 rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-500/15 transition-all duration-200"
          onClick={toggleTheme}
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={15} className="text-accent-yellow" /> : <Moon size={15} className="text-primary" />}
        </button>
 
        {/* Ads Toggle Button (Only for Paid Premium users who start collapsed by default) */}
        {userTier === "premium" && (
          <button
            className={`bg-white/5 dark:bg-black/3 border text-text-main p-2 rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-500/15 transition-all duration-200 flex items-center gap-1.5 ${
              isSidebarOpen ? "border-primary text-primary bg-primary/5" : "border-border-color"
            }`}
            onClick={onToggleSidebar}
            title={isSidebarOpen ? "Hide Sponsored Ads" : "Show Sponsored Ads"}
          >
            <Zap size={14} className={isSidebarOpen ? "text-primary animate-pulse" : "text-text-muted"} />
            <span>{isSidebarOpen ? "Hide Ads" : "Show Ads"}</span>
          </button>
        )}

        {/* User Session Profile Section */}
        {userContact ? (
          <div className="flex items-center gap-2">
            <div className="bg-white/5 dark:bg-black/3 border border-border-color text-text-main px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-default">
              <User size={13} className="text-primary" />
              <span className="max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">
                {userContact}
              </span>
            </div>
            <button
              className="bg-white/5 dark:bg-black/3 border border-border-color text-text-main p-2 rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-500/15 transition-all duration-200"
              onClick={onLogout}
              title="Log Out"
            >
              <LogOut size={14} className="text-accent-red" />
            </button>
          </div>
        ) : (
          <button
            className="bg-white/5 dark:bg-black/3 border border-border-color text-text-main px-3 py-2 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1.5 hover:bg-gray-500/15 transition-all duration-200"
            onClick={onOpenLogin}
          >
            <LogIn size={14} />
            <span>Login / Sign Up</span>
          </button>
        )}

        {/* Token Balance for Premium User */}
        {userTier === "premium" && (
          <div className="flex items-center gap-1.5 bg-accent-yellow/10 border border-accent-yellow/20 text-accent-yellow text-xs font-semibold px-2.5 py-1.5 rounded-full">
            <Coins size={14} />
            <span>{tokens} Tokens</span>
          </div>
        )}

        {/* Upgrade / Token Actions */}
        {userTier !== "premium" ? (
          <button
            className="bg-gradient-to-r from-primary to-secondary border-none text-white px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.01] hover:brightness-110 shadow-md shadow-primary/35"
            onClick={onOpenCheckout}
          >
            <CreditCard size={14} />
            <span>Upgrade (₹40)</span>
          </button>
        ) : (
          <button
            className="bg-white/5 dark:bg-black/3 border border-border-color text-text-main px-3 py-2 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1.5 hover:bg-gray-500/15 transition-all duration-200"
            onClick={onOpenCheckout}
          >
            <Coins size={14} />
            <span>Buy Tokens</span>
          </button>
        )}

        {/* Developer Demo Toggles */}
        <div className="bg-white/4 dark:bg-black/3 border border-border-color rounded-full flex p-0.5 opacity-60">
          <button
            className={`cursor-pointer text-[10px] font-semibold px-2 py-1 rounded-full transition-all duration-200 ${
              userTier === "anonymous" ? "bg-primary text-white shadow-md shadow-primary/30" : "text-text-muted"
            }`}
            onClick={() => setUserTier("anonymous")}
            title="Demo: Set to Anonymous"
          >
            Anon
          </button>
          <button
            className={`cursor-pointer text-[10px] font-semibold px-2 py-1 rounded-full transition-all duration-200 ${
              userTier === "free" ? "bg-primary text-white shadow-md shadow-primary/30" : "text-text-muted"
            }`}
            onClick={() => setUserTier("free")}
            title="Demo: Set to Logged In Free"
          >
            Free
          </button>
          <button
            className={`cursor-pointer text-[10px] font-semibold px-2 py-1 rounded-full transition-all duration-200 ${
              userTier === "premium" ? "bg-gradient-to-r from-accent-purple to-primary text-white shadow-md shadow-accent-purple/30" : "text-text-muted"
            }`}
            onClick={() => setUserTier("premium")}
            title="Demo: Set to Paid Premium"
          >
            Paid
          </button>
        </div>

        {/* Settings gear */}
        <button
          className="bg-white/5 dark:bg-black/3 border border-border-color text-text-main p-2 rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-500/15 transition-all duration-200"
          onClick={() => setShowSettings(true)}
          title="Gemini API settings"
        >
          <Settings size={15} />
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-bg-main border border-border-color rounded-xl w-full max-w-[440px] shadow-glass-shadow overflow-hidden">
            <div className="p-3.5 px-4 border-b border-border-color flex justify-between items-center">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Settings size={18} className="text-accent-yellow animate-spin-slow" />
                <span>API Settings</span>
              </h3>
              <button
                className="bg-transparent border-none text-text-muted cursor-pointer hover:text-text-main transition-colors"
                onClick={() => setShowSettings(false)}
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <p className="text-text-muted text-xs leading-relaxed mb-3">
                Enter your Gemini API key below to enable live calculation and execution simulation for any custom code.
              </p>
              <div className="flex flex-col gap-1.5 mb-3">
                <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Gemini API Key</label>
                <input
                  type="password"
                  className="bg-black/20 border border-border-color rounded-md p-2 text-text-main outline-none text-xs focus:border-primary"
                  placeholder="AIzaSy..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-text-dark leading-relaxed">
                Don't have a key? Get a free Gemini API key from{" "}
                <a
                  href="https://aistudio.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google AI Studio
                </a>.
              </p>
            </div>
            <div className="p-3 px-4 border-t border-border-color flex justify-end gap-2 bg-black/5">
              <button
                className="bg-white/5 border border-border-color text-text-main px-3 py-2 rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-500/15"
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </button>
              <button
                className="bg-gradient-to-r from-primary to-secondary text-white px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                onClick={handleSaveSettings}
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
