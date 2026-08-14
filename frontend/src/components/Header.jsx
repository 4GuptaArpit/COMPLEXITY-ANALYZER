import { useState } from "react";
import { 
  Settings, Sparkles, LogOut, User, Clock, Key, Play, Trash2 
} from "lucide-react";
import { useToast } from "../context/ToastContext";

export default function Header({
  user,
  theme,
  setTheme,
  userContact,
  onOpenLogin,
  onLogout,
  history = [],
  onLoadHistory,
  onDeleteHistory,
  onChangePassword,
  onUpdateProfile,
  usersDb = []
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [settingsTab, setSettingsTab] = useState("account");
  
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileGithub, setProfileGithub] = useState(user?.github || "");
  const [profileBio, setProfileBio] = useState(user?.bio || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdStatus, setPwdStatus] = useState({ type: "", text: "" });
  const [historyPage, setHistoryPage] = useState(1);
  const { showToast } = useToast();

  const handleOpenSettings = (tab) => {
    setSettingsTab(tab);
    setProfileName(user?.name || "");
    setProfileGithub(user?.github || "");
    setProfileBio(user?.bio || "");
    setShowSettings(true);
    setHistoryPage(1);
    setShowSettingsDropdown(false);
  };

  const activeUser = usersDb.find(u => u.contact === userContact) || {};
  const activeUserSignup = user?.signupAt ? new Date(user.signupAt).toLocaleString() : (activeUser.signup || "2026-06-15 14:32");

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!onUpdateProfile) return;
    setIsSavingProfile(true);
    await onUpdateProfile({
      name: profileName,
      github: profileGithub,
      bio: profileBio
    });
    setIsSavingProfile(false);
  };

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
    if (!onChangePassword) return;
    const res = await onChangePassword(userContact, currPassword, newPassword);
    if (res.success) {
      setPwdStatus({ type: "success", text: "Password updated successfully!" });
      setCurrPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setPwdStatus({ type: "error", text: res.message || "Failed to update password." });
    }
  };

  const toggleTheme = () => {
    if (theme === "desert") setTheme("rainy");
    else setTheme("desert");
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
        {/* Theme Switcher (Desert ↔ Rainy) */}
        <button
          className="bg-white/5 dark:bg-black/3 border border-border-color text-text-main px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:bg-gray-500/15 transition-all flex items-center gap-1.5"
          onClick={toggleTheme}
          title="Switch Theme (Desert ↔ Rainy)"
        >
          {theme === "rainy" ? <span>🌧️ Rainy</span> : <span>🏜️ Desert</span>}
        </button>


        {/* User Badge / Login Button */}
        {userContact ? (
          <div className="bg-white/5 dark:bg-black/3 border border-border-color text-text-main px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-default">
            <User size={13} className="text-primary" />
            <span className="max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold">
              {user?.name || userContact}
            </span>
          </div>
        ) : (
          <button
            className="bg-white/5 dark:bg-black/3 border border-border-color text-text-main px-3 py-2 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1.5 hover:bg-gray-500/15 transition-all duration-200"
            onClick={onOpenLogin}
          >
            <User size={14} />
            <span>Login / Sign Up</span>
          </button>
        )}

        {/* Settings Dropdown */}
        {userContact ? (
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
                    onClick={() => handleOpenSettings("account")}
                  >
                    <User size={13} className="text-primary" />
                    <span>Account</span>
                  </button>
                  <button
                    className="w-full text-left bg-transparent border-none px-3.5 py-2 text-xs text-text-muted hover:text-text-main hover:bg-white/5 cursor-pointer flex items-center gap-2 transition-colors"
                    onClick={() => handleOpenSettings("password")}
                  >
                    <Key size={13} className="text-secondary" />
                    <span>Change Password</span>
                  </button>
                  <button
                    className="w-full text-left bg-transparent border-none px-3.5 py-2 text-xs text-text-muted hover:text-text-main hover:bg-white/5 cursor-pointer flex items-center gap-2 transition-colors"
                    onClick={() => handleOpenSettings("history")}
                  >
                    <Clock size={13} className="text-accent-yellow" />
                    <span>History</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : null}

        {/* Logout Button */}
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

      {/* Settings Modal */}
      {showSettings && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-start justify-center p-4 pt-[12vh]"
          onClick={() => setShowSettings(false)}
        >
          <div 
            className="bg-bg-main border border-border-color rounded-xl w-full max-w-[620px] shadow-glass-shadow overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
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
                <div className="flex flex-col gap-4 text-left">
                  {/* Interactive Profile Form */}
                  <form onSubmit={handleSaveProfile} className="bg-white/3 border border-border-color rounded-lg p-4 flex flex-col gap-3">
                    <h4 className="font-bold text-text-main uppercase tracking-wider text-[10px] text-primary flex items-center gap-1.5">
                      <User size={13} />
                      <span>User Profile Details</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-text-dark uppercase font-semibold">Full Name / Display Name</label>
                        <input
                          type="text"
                          className="bg-black/25 border border-border-color rounded p-1.5 text-text-main outline-none focus:border-primary text-xs"
                          placeholder="e.g. Alex Rivera"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-text-dark uppercase font-semibold">GitHub Username</label>
                        <input
                          type="text"
                          className="bg-black/25 border border-border-color rounded p-1.5 text-text-main outline-none focus:border-primary text-xs"
                          placeholder="e.g. alexcoder"
                          value={profileGithub}
                          onChange={(e) => setProfileGithub(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-text-dark uppercase font-semibold">Short Bio / Developer Bio</label>
                      <textarea
                        rows="2"
                        className="bg-black/25 border border-border-color rounded p-1.5 text-text-main outline-none focus:border-primary text-xs resize-none"
                        placeholder="e.g. Full-stack developer passionate about algorithms & optimization."
                        value={profileBio}
                        onChange={(e) => setProfileBio(e.target.value)}
                      />
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[10px] text-text-dark font-mono">Registered Email: <strong>{userContact}</strong></span>
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="bg-gradient-to-r from-primary to-secondary text-white p-1.5 px-3 rounded text-[11px] font-semibold cursor-pointer border-none shadow-md shadow-primary/20 disabled:opacity-40"
                      >
                        {isSavingProfile ? "Saving Profile..." : "Save Profile Changes"}
                      </button>
                    </div>
                  </form>

                  {/* Account Meta */}
                  <div className="bg-white/3 border border-border-color rounded-lg p-3 flex justify-between items-center text-text-muted">
                    <span className="text-[10px] text-text-dark uppercase font-semibold">Account Signup Timestamp:</span>
                    <span className="font-mono text-text-main text-[12px]">{activeUserSignup}</span>
                  </div>
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
                              <th className="p-2 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const hPageSize = 6;
                              const slicedHistory = history.slice(0, 30);
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
                                          const nextTotal = slicedHistory.length - 1;
                                          const nextPages = Math.ceil(nextTotal / hPageSize);
                                          if (historyPage > nextPages && nextPages > 0) {
                                            setHistoryPage(nextPages);
                                          }
                                        }}
                                        title="Delete Log Record"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Controls */}
                      {history.length > 6 && (
                        <div className="flex justify-between items-center text-[11px] text-text-muted mt-1">
                          <span>
                            Showing {((historyPage - 1) * 6) + 1} - {Math.min(historyPage * 6, Math.min(history.length, 30))} of {Math.min(history.length, 30)} logs
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              disabled={historyPage === 1}
                              onClick={() => setHistoryPage(prev => prev - 1)}
                              className="px-2 py-0.5 rounded border border-border-color bg-white/3 disabled:opacity-30 cursor-pointer text-text-main"
                            >
                              Prev
                            </button>
                            <span className="px-2 py-0.5 font-mono">{historyPage} / {Math.ceil(Math.min(history.length, 30) / 6)}</span>
                            <button
                              disabled={historyPage >= Math.ceil(Math.min(history.length, 30) / 6)}
                              onClick={() => setHistoryPage(prev => prev + 1)}
                              className="px-2 py-0.5 rounded border border-border-color bg-white/3 disabled:opacity-30 cursor-pointer text-text-main"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
