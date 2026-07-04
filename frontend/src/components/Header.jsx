import { useState } from "react";
import { 
  Settings, CreditCard, Sparkles, Coins, Sun, Moon, 
  LogIn, LogOut, User, Clock, Zap, Play, Trash2, Key 
} from "lucide-react";

const handleDownloadReceipt = (tx, userContact, userTier) => {
  const htmlContent = `
    <html>
    <head>
      <title>Invoice - BigO.ai</title>
      <style>
        body { font-family: sans-serif; padding: 40px; color: #1e1b4b; background: #fafafd; line-height: 1.5; }
        .header { border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
        .meta { display: flex; justify-content: space-between; margin-bottom: 40px; font-size: 13px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        .table th, .table td { border: 1px solid rgba(99, 102, 241, 0.15); padding: 12px; text-align: left; }
        .table th { background: #f0f2ff; font-weight: bold; }
        .total { text-align: right; font-size: 1.3em; font-weight: bold; color: #6366f1; margin-top: 30px; }
        .footer { border-top: 1px solid rgba(99, 102, 241, 0.1); padding-top: 25px; font-size: 11px; text-align: center; color: #64748b; margin-top: 60px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 style="margin: 0; font-size: 24px; color: #6366f1;">BigO.ai</h1>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">Code Complexity Analyzer & Simulator</p>
        </div>
        <div style="text-align: right;">
          <h3 style="margin: 0; font-size: 14px;">TAX RECEIPT</h3>
          <p style="margin: 5px 0 0 0; font-size: 12px; font-family: monospace;">${tx.id}</p>
        </div>
      </div>
      <div class="meta">
        <div>
          <strong style="color: #6366f1;">CUSTOMER DETAILS:</strong><br>
          Contact: ${userContact}<br>
          Tier: ${userTier.toUpperCase()}
        </div>
        <div style="text-align: right;">
          <strong style="color: #6366f1;">PAYMENT META:</strong><br>
          Date: ${tx.date}<br>
          Time: ${tx.time}<br>
          Status: <span style="color: #059669; font-weight: bold;">PAID</span>
        </div>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>Item Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Total Price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${tx.desc}</td>
            <td style="text-align: center;">1</td>
            <td style="text-align: right;">${tx.amount}</td>
            <td style="text-align: right;">${tx.amount}</td>
          </tr>
        </tbody>
      </table>
      <div class="total">Total Amount Billed: ${tx.amount}</div>
      <div class="footer">
        Thank you for choosing BigO.ai. Verification ID: txn_${(tx.id + "_" + tx.date).replace(/-/g, "").toUpperCase()}<br>
        For billing support, reach out to billing@bigo.ai.
      </div>
      <script>window.print();</script>
    </body>
    </html>
  `;
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
};

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
  history = [],
  onLoadHistory,
  onDeleteHistory,
  onChangePassword,
  usersDb = []
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [settingsTab, setSettingsTab] = useState("account");
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdStatus, setPwdStatus] = useState({ type: "", text: "" });
  const [historyPage, setHistoryPage] = useState(1);

  const activeUser = usersDb.find(u => u.contact === userContact) || {};
  const activeUserSignup = activeUser.signup || "2026-06-15 14:32";

  // Mock transactions list
  const transactions = userTier === "premium" ? [
    { id: "TXN-9021", desc: "Premium Access Upgrade (1 Month)", amount: "₹40", date: activeUserSignup.split(" ")[0] || "2026-06-15", time: activeUserSignup.split(" ")[1] || "14:32" },
    { id: "TXN-4820", desc: "Simulation Tokens Pack (10 Tokens)", amount: "₹10", date: "2026-06-15", time: "18:00" }
  ] : [];

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currPassword || !newPassword || !confirmPassword) {
      setPwdStatus({ type: "error", text: "Please fill out all password fields." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdStatus({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setPwdStatus({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    
    try {
      const res = await onChangePassword(userContact, currPassword, newPassword);
      if (res.success) {
        setPwdStatus({ type: "success", text: res.message || "Password updated successfully!" });
        setCurrPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPwdStatus({ type: "error", text: res.message || "Failed to update password." });
      }
    } catch (err) {
      setPwdStatus({ type: "error", text: "An unexpected error occurred." });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="glass-panel sticky top-4 z-50 flex flex-col sm:flex-row justify-between items-center p-3 px-4 gap-3 sm:gap-4 rounded-xl backdrop-blur-md">
      <div className="flex items-center gap-2">
        <Sparkles size={22} className="text-primary" />
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-text-main via-primary to-secondary bg-clip-text text-transparent">
          BigO.ai
        </span>
        <span className="bg-gradient-to-r from-primary to-secondary text-[10px] font-bold px-1.5 py-0.5 rounded text-white uppercase tracking-wider">
          Beta
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3">
        {/* 1. Theme Change */}
        <button
          className="bg-white/5 dark:bg-black/3 border border-border-color text-text-main p-2 rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-500/15 transition-all duration-200"
          onClick={toggleTheme}
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={15} className="text-accent-yellow" /> : <Moon size={15} className="text-primary" />}
        </button>
 
        {/* 2. Demo Toggles */}
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

        {/* 4. Tokens Available */}
        {userTier === "premium" && (
          <div className="flex items-center gap-1.5 bg-accent-yellow/10 border border-accent-yellow/20 text-accent-yellow text-xs font-semibold px-2.5 py-1.5 rounded-full">
            <Coins size={14} />
            <span>{tokens} Tokens</span>
          </div>
        )}

        {/* 5. Upgrade or Buy Tokens */}
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

        {/* 6. User Login Number / Login Button */}
        {userContact ? (
          <div className="bg-white/5 dark:bg-black/3 border border-border-color text-text-main px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-default">
            <User size={13} className="text-primary" />
            <span className="max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">
              {userContact}
            </span>
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

        {/* 7. Settings Button with Dropdown */}
        {userContact && (
          <div className="relative">
            <button
              className={`bg-white/5 dark:bg-black/3 border text-text-main p-2 px-3 rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-500/15 transition-all duration-200 flex items-center gap-1.5 ${
                showSettingsDropdown ? "border-primary text-primary bg-primary/5" : "border-border-color"
              }`}
              onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
              title="Account Settings"
            >
              <Settings size={14} className={showSettingsDropdown ? "animate-spin-slow" : ""} />
              <span>Settings</span>
            </button>
            
            {showSettingsDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-[998] cursor-default bg-transparent" 
                  onClick={() => setShowSettingsDropdown(false)} 
                />
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border-color bg-bg-main shadow-lg z-[999] py-1 text-left glass-panel">
                  <div className="px-3.5 py-1 text-[9px] font-bold text-text-dark uppercase tracking-wider border-b border-border-color/40 mb-1">
                    User Settings
                  </div>
                  <button
                    className="w-full text-left bg-transparent border-none px-3.5 py-2 text-xs text-text-muted hover:text-text-main hover:bg-white/5 cursor-pointer flex items-center gap-2 transition-colors"
                    onClick={() => {
                      setSettingsTab("account");
                      setShowSettings(true);
                      setHistoryPage(1);
                      setShowSettingsDropdown(false);
                    }}
                  >
                    <User size={13} className="text-primary" />
                    <span>Account</span>
                  </button>
                  <button
                    className="w-full text-left bg-transparent border-none px-3.5 py-2 text-xs text-text-muted hover:text-text-main hover:bg-white/5 cursor-pointer flex items-center gap-2 transition-colors"
                    onClick={() => {
                      setSettingsTab("password");
                      setShowSettings(true);
                      setHistoryPage(1);
                      setShowSettingsDropdown(false);
                    }}
                  >
                    <Key size={13} className="text-secondary" />
                    <span>Change Password</span>
                  </button>
                  <button
                    className="w-full text-left bg-transparent border-none px-3.5 py-2 text-xs text-text-muted hover:text-text-main hover:bg-white/5 cursor-pointer flex items-center gap-2 transition-colors"
                    onClick={() => {
                      setSettingsTab("history");
                      setShowSettings(true);
                      setHistoryPage(1);
                      setShowSettingsDropdown(false);
                    }}
                  >
                    <Clock size={13} className="text-accent-yellow" />
                    <span>History</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* 8. Logout Button */}
        {userContact && (
          <button
            className="bg-white/5 dark:bg-black/3 border border-border-color text-text-main p-2 rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-500/15 transition-all duration-200"
            onClick={onLogout}
            title="Log Out"
          >
            <LogOut size={14} className="text-accent-red" />
          </button>
        )}
      </div>

      {/* Settings Modal (Positioned with gap from top) */}
      {showSettings && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-start justify-center p-4 pt-[12vh]"
          onClick={() => setShowSettings(false)}
        >
          <div 
            className="bg-bg-main border border-border-color rounded-xl w-full max-w-[620px] shadow-glass-shadow overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header (Changes dynamically per tab/screen) */}
            <div className="p-4 px-5 border-b border-border-color flex justify-between items-center bg-white/2">
              <h3 className="flex items-center gap-2.5 text-sm font-bold text-text-main">
                {settingsTab === "account" && (
                  <>
                    <User size={18} className="text-primary animate-pulse" />
                    <span>Account Details</span>
                  </>
                )}
                {settingsTab === "password" && (
                  <>
                    <Key size={18} className="text-secondary" />
                    <span>Change Password</span>
                  </>
                )}
                {settingsTab === "history" && (
                  <>
                    <Clock size={18} className="text-accent-yellow" />
                    <span>Code History Logs</span>
                  </>
                )}
              </h3>
              <button
                className="bg-transparent border-none text-text-muted cursor-pointer hover:text-text-main transition-colors text-lg"
                onClick={() => setShowSettings(false)}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 text-xs">
              {settingsTab === "account" && (
                <div className="flex flex-col gap-5">
                  {/* Account details */}
                  <div className="bg-white/3 border border-border-color rounded-lg p-4">
                    <h4 className="font-bold text-text-main mb-2.5 uppercase tracking-wider text-[10px] text-primary">Account Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-text-muted text-left">
                      <div>
                        <span className="text-[10px] text-text-dark block uppercase">Email / Mobile</span>
                        <strong className="text-text-main text-[13px]">{userContact}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-dark block uppercase">Account Level</span>
                        <strong className="text-text-main text-[13px] uppercase flex items-center gap-1">
                          {userTier === "premium" ? (
                            <span className="text-accent-purple font-bold">Premium (Paid)</span>
                          ) : (
                            <span className="text-text-dark font-medium">Free Tier</span>
                          )}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-dark block uppercase">Signup Timestamp</span>
                        <span className="font-mono text-text-main">{activeUserSignup}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-dark block uppercase">Subscription Expiry</span>
                        <span className="text-text-main font-semibold">
                          {userTier === "premium" ? "Active (Expires in 30 Days)" : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Receipts (only for premium users) */}
                  {userTier === "premium" && (
                    <div className="bg-white/3 border border-border-color rounded-lg p-4">
                      <h4 className="font-bold text-text-main mb-2 uppercase tracking-wider text-[10px] text-primary text-left">Simulated Transaction Receipts</h4>
                      <div className="overflow-hidden border border-border-color rounded-lg">
                        <table className="w-full text-[11px] border-collapse text-left">
                          <thead>
                            <tr className="bg-white/5 border-b border-border-color text-text-muted font-semibold">
                              <th className="p-2">Transaction ID</th>
                              <th className="p-2">Description</th>
                              <th className="p-2">Amount</th>
                              <th className="p-2 text-right">Receipt</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map(tx => (
                              <tr key={tx.id} className="border-b border-border-color/60 hover:bg-white/1 text-text-main">
                                <td className="p-2 font-mono">{tx.id}</td>
                                <td className="p-2 text-text-muted">{tx.desc}</td>
                                <td className="p-2 font-semibold text-accent-yellow">{tx.amount}</td>
                                <td className="p-2 text-right">
                                  <button
                                    onClick={() => handleDownloadReceipt(tx, userContact, userTier)}
                                    className="bg-primary/10 border border-primary/20 text-primary p-0.5 px-2 rounded hover:bg-primary/20 transition-all cursor-pointer text-[10px] font-semibold"
                                  >
                                    Invoice
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {settingsTab === "password" && (
                <form onSubmit={handleUpdatePassword} className="bg-white/3 border border-border-color rounded-lg p-4 flex flex-col gap-3 text-left">
                  <h4 className="font-bold text-text-main uppercase tracking-wider text-[10px] text-primary flex items-center gap-1.5">
                    <Key size={13} />
                    <span>Change Account Password</span>
                  </h4>

                  {pwdStatus.text && (
                    <div className={`p-2 rounded font-medium text-[11px] ${
                      pwdStatus.type === "success" ? "bg-accent-green/10 text-accent-green border border-accent-green/20" : "bg-accent-red/10 text-accent-red border border-accent-red/20"
                    }`}>
                      {pwdStatus.text}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-text-dark uppercase">Current Password</label>
                      <input
                        type="password"
                        className="bg-black/25 border border-border-color rounded p-1.5 text-text-main outline-none focus:border-primary text-xs"
                        value={currPassword}
                        onChange={(e) => setCurrPassword(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-text-dark uppercase">New Password</label>
                      <input
                        type="password"
                        className="bg-black/25 border border-border-color rounded p-1.5 text-text-main outline-none focus:border-primary text-xs"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-text-dark uppercase">Confirm Password</label>
                      <input
                        type="password"
                        className="bg-black/25 border border-border-color rounded p-1.5 text-text-main outline-none focus:border-primary text-xs"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-1.5">
                    <button type="submit" className="bg-gradient-to-r from-primary to-secondary text-white p-1.5 px-3 rounded text-[11px] font-semibold cursor-pointer border-none shadow-md shadow-primary/20">
                      Update Password
                    </button>
                  </div>
                </form>
              )}

              {settingsTab === "history" && (
                /* History logs tab */
                <div className="flex flex-col gap-3">
                  {history.length === 0 ? (
                    <div className="text-center p-8 text-text-dark flex flex-col items-center gap-2">
                      <Clock size={28} className="opacity-25 text-primary" />
                      <p>No history records found. Analyze custom code to populate history logs.</p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto border border-border-color rounded-lg">
                        <table className="w-full text-[12px] text-left border-collapse">
                          <thead>
                            <tr className="bg-white/3 border-b border-border-color text-text-muted font-semibold">
                              <th className="p-2 px-3">Algorithm</th>
                              <th className="p-2">Language</th>
                              <th className="p-2 text-center">Complexity</th>
                              {userTier === "premium" && <th className="p-2 text-center">Tokens</th>}
                              <th className="p-2 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const hPageSize = 6;
                              const maxHLogs = userTier === "premium" ? 30 : 20;
                              const slicedHistory = history.slice(0, maxHLogs);
                              const hStartIndex = (historyPage - 1) * hPageSize;
                              const paginatedH = slicedHistory.slice(hStartIndex, hStartIndex + hPageSize);

                              return paginatedH.map((item, index) => {
                                const globalIdx = hStartIndex + index;
                                return (
                                  <tr key={globalIdx} className="hover:bg-white/2 border-b border-border-color/60 text-text-main transition-colors">
                                    <td className="p-2 px-3 font-semibold max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap">
                                      {item.name || "Custom Code"}
                                    </td>
                                    <td className="p-2">
                                      <span className="text-[10px] bg-secondary/15 text-secondary border border-secondary/25 px-1 py-0.2 rounded font-mono uppercase">
                                        {item.language}
                                      </span>
                                    </td>
                                    <td className="p-2 text-center">
                                      <span className="font-mono font-bold text-primary">{item.timeComplexity}</span>
                                    </td>
                                    {userTier === "premium" && (
                                      <td className="p-2 text-center font-mono font-semibold text-accent-yellow">
                                        {item.tokensUsed !== undefined ? item.tokensUsed : 0}
                                      </td>
                                    )}
                                    <td className="p-2 text-right flex gap-1 justify-end">
                                      <button
                                        className="bg-primary hover:bg-primary-hover text-white p-1 px-2.5 rounded text-[10px] font-semibold flex items-center gap-1 border-none cursor-pointer"
                                        onClick={() => {
                                          onLoadHistory(item);
                                          setShowSettings(false);
                                        }}
                                      >
                                        <Play size={8} />
                                        <span>Load</span>
                                      </button>
                                      <button
                                        className="bg-transparent text-text-dark hover:text-accent-red p-1 rounded hover:bg-white/5 border-none cursor-pointer"
                                        onClick={() => {
                                          onDeleteHistory(globalIdx);
                                          // Handle page overflow if deleting last item on page
                                          const nextTotal = slicedHistory.length - 1;
                                          const nextPages = Math.ceil(nextTotal / hPageSize);
                                          if (historyPage > nextPages && nextPages > 0) {
                                            setHistoryPage(nextPages);
                                          }
                                        }}
                                        title="Delete log"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination buttons */}
                      {(() => {
                        const hPageSize = 6;
                        const maxHLogs = userTier === "premium" ? 30 : 20;
                        const slicedHistory = history.slice(0, maxHLogs);
                        const hTotalPages = Math.ceil(slicedHistory.length / hPageSize);
                        if (hTotalPages <= 1) return null;

                        return (
                          <div className="flex justify-center items-center gap-1 mt-2">
                            <button
                              disabled={historyPage === 1}
                              onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                              className="bg-white/5 border border-border-color text-text-muted p-1 px-2 rounded cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-[10px]"
                            >
                              Prev
                            </button>
                            {Array.from({ length: hTotalPages }).map((_, i) => {
                              const pageNum = i + 1;
                              const isActive = pageNum === historyPage;
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setHistoryPage(pageNum)}
                                  className={`p-1 px-2 rounded text-[10px] font-bold cursor-pointer border border-none ${
                                    isActive
                                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                                      : "bg-white/5 text-text-muted hover:bg-white/10"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                            <button
                              disabled={historyPage === hTotalPages}
                              onClick={() => setHistoryPage(p => Math.min(hTotalPages, p + 1))}
                              className="bg-white/5 border border-border-color text-text-muted p-1 px-2 rounded cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-[10px]"
                            >
                              Next
                            </button>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 px-4 border-t border-border-color flex justify-end gap-2 bg-black/10">
              <button
                className="bg-white/5 border border-border-color text-text-main px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-500/15"
                onClick={() => setShowSettings(false)}
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
