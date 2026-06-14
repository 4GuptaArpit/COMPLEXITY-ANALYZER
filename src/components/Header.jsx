import React, { useState } from "react";
import { Settings, Award, CreditCard, Sparkles, Coins, Sun, Moon, LogIn, LogOut, User } from "lucide-react";
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
  onLogout
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
    <header className="app-header glass-panel">
      <div className="logo-section">
        <Sparkles className="logo-icon" size={22} color="var(--primary)" />
        <span className="logo-text">BigO.ai</span>
        <span className="logo-badge">Beta</span>
      </div>

      <div className="header-controls">
        {/* Switch themes (Sun/Moon Toggle) */}
        <button className="btn-secondary" onClick={toggleTheme} title="Toggle Theme" style={{ padding: "8px" }}>
          {theme === "dark" ? <Sun size={15} color="#eab308" /> : <Moon size={15} color="#4f46e5" />}
        </button>

        {/* User Session Profile Section */}
        {userContact ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="btn-secondary" style={{ cursor: "default", gap: "6px" }}>
              <User size={13} color="var(--primary)" />
              <span style={{ fontSize: "0.75rem", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {userContact}
              </span>
            </div>
            <button className="btn-secondary" onClick={onLogout} title="Log Out" style={{ padding: "8px" }}>
              <LogOut size={14} color="var(--accent-red)" />
            </button>
          </div>
        ) : (
          <button className="btn-secondary" onClick={onOpenLogin}>
            <LogIn size={14} />
            <span>Login / Sign Up</span>
          </button>
        )}

        {/* Token Balance for Premium User */}
        {userTier === "premium" && (
          <div className="token-pill">
            <Coins size={14} />
            <span>{tokens} Tokens</span>
          </div>
        )}

        {/* Upgrade / Token Actions */}
        {userTier !== "premium" ? (
          <button className="btn-primary" onClick={onOpenCheckout}>
            <CreditCard size={14} />
            <span>Upgrade (₹40)</span>
          </button>
        ) : (
          <button className="btn-secondary" onClick={onOpenCheckout}>
            <Coins size={14} />
            <span>Buy Tokens</span>
          </button>
        )}

        {/* Developer Demo Toggles (Helper for demo reviewer to switch tiers instantly) */}
        <div className="tier-badge-pill" style={{ opacity: 0.6 }}>
          <button
            className={`tier-btn ${userTier === "anonymous" ? "active" : ""}`}
            onClick={() => setUserTier("anonymous")}
            title="Demo: Set to Anonymous"
          >
            Anon
          </button>
          <button
            className={`tier-btn ${userTier === "free" ? "active" : ""}`}
            onClick={() => setUserTier("free")}
            title="Demo: Set to Logged In Free"
          >
            Free
          </button>
          <button
            className={`tier-btn ${userTier === "premium" ? "active" : ""}`}
            onClick={() => setUserTier("premium")}
            title="Demo: Set to Paid Premium"
          >
            Paid
          </button>
        </div>

        {/* Settings gear */}
        <button className="btn-secondary" onClick={() => setShowSettings(true)} title="Gemini API settings">
          <Settings size={15} />
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="card-title">
                <Settings size={18} className="var-changed" />
                <span>API Settings</span>
              </h3>
              <button className="close-btn" onClick={() => setShowSettings(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p className="explanation-text">
                Enter your Gemini API key below to enable live calculation and execution simulation for any custom code.
              </p>
              <div className="settings-input-group">
                <label className="section-label">Gemini API Key</label>
                <input
                  type="password"
                  className="settings-input"
                  placeholder="AIzaSy..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                />
              </div>
              <p className="settings-help">
                Don't have a key? Get a free Gemini API key from{" "}
                <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">
                  Google AI Studio
                </a>.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowSettings(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSaveSettings}>
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
