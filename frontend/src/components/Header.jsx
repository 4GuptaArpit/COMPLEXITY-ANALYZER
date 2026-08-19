import { useState } from "react";
import { Settings, Sparkles, LogOut, User, Clock, Key, Play, Trash2, ShieldAlert, AlertTriangle } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";

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
  onOpenAdmin,
}) {
  const [showSettings, setShowSettings] = useState(false);
  useBodyScrollLock(showSettings);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [settingsTab, setSettingsTab] = useState("account"); // "account" | "password" | "history" | "danger"

  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileGithub, setProfileGithub] = useState(user?.github || "");
  const [profileBio, setProfileBio] = useState(user?.bio || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdStatus, setPwdStatus] = useState({ type: "", text: "" });

  const [deletePassword, setDeletePassword] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [historyPage, setHistoryPage] = useState(1);
  const { showToast } = useToast();
  const { deleteAccount } = useAuth();

  const handleOpenSettings = (tab) => {
    setSettingsTab(tab);
    setProfileName(user?.name || "");
    setProfileGithub(user?.github || "");
    setProfileBio(user?.bio || "");
    setDeletePassword("");
    setShowSettings(true);
    setHistoryPage(1);
    setShowSettingsDropdown(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!onUpdateProfile) return;
    setIsSavingProfile(true);
    await onUpdateProfile({
      name: profileName,
      github: profileGithub,
      bio: profileBio,
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
    const res = await onChangePassword(currPassword, newPassword);
    if (res.success) {
      setPwdStatus({ type: "success", text: "Password updated successfully!" });
      setCurrPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setPwdStatus({ type: "error", text: res.message || "Failed to update password." });
    }
  };

  const handleDeleteAccountSubmit = async (e) => {
    e.preventDefault();
    if (!deletePassword) {
      showToast("Password confirmation is required to delete your account.", "warning");
      return;
    }
    if (!window.confirm("WARNING: This will permanently delete your account and all history. Continue?")) return;

    setIsDeletingAccount(true);
    const res = await deleteAccount(deletePassword);
    setIsDeletingAccount(false);
    if (res.success) {
      setShowSettings(false);
    }
  };

  const toggleTheme = () => {
    if (theme === "desert") setTheme("rainy");
    else setTheme("desert");
  };

  return (
    <header className="glass-panel sticky top-4 z-40 flex flex-col sm:flex-row justify-between items-center p-3 px-4 gap-3 sm:gap-4 rounded-xl backdrop-blur-md">
      <div className="flex items-center gap-2">
        <Sparkles size={22} className="text-primary" />
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-text-main via-primary to-secondary bg-clip-text text-transparent">
          BigO.ai
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3">
        {/* Theme Switcher */}
        <button
          className="bg-white/5 dark:bg-black/3 border border-border-color text-text-main px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:bg-gray-500/15 transition-all flex items-center gap-1.5"
          onClick={toggleTheme}
          title="Switch Theme (Desert ↔ Rainy)"
        >
          {theme === "rainy" ? <span>🌧️ Rainy</span> : <span>🏜️ Desert</span>}
        </button>

        {/* Admin Portal shortcut if user is admin */}
        {user?.isAdmin && onOpenAdmin && (
          <button
            className="bg-purple-500/15 border border-purple-500/30 text-purple-400 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:bg-purple-500/25 transition-all flex items-center gap-1.5"
            onClick={onOpenAdmin}
            title="Open Admin Portal"
          >
            <ShieldAlert size={14} />
            <span>Admin</span>
          </button>
        )}

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
                    <span>Account Profile</span>
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
                    <span>History Logs</span>
                  </button>
                  <button
                    className="w-full text-left bg-transparent border-none px-3.5 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer flex items-center gap-2 transition-colors border-t border-border-color/40 mt-1 pt-2"
                    onClick={() => handleOpenSettings("danger")}
                  >
                    <Trash2 size={13} />
                    <span>Delete Account</span>
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
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-start justify-center p-4 pt-[10vh]"
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
                    <span>Account Profile Details</span>
                  </>
                )}
                {settingsTab === "password" && (
                  <>
                    <Key size={18} className="text-secondary" />
                    <span>Change Account Password</span>
                  </>
                )}
                {settingsTab === "history" && (
                  <>
                    <Clock size={18} className="text-accent-yellow" />
                    <span>Saved Complexity History</span>
                  </>
                )}
                {settingsTab === "danger" && (
                  <>
                    <AlertTriangle size={18} className="text-accent-red" />
                    <span>Delete Account (Danger Zone)</span>
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
                      <label className="text-[10px] text-text-dark uppercase font-semibold">Short Bio</label>
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
                                          onDeleteHistory(item._id || globalIdx);
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
                    </>
                  )}
                </div>
              )}

              {settingsTab === "danger" && (
                <form onSubmit={handleDeleteAccountSubmit} className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 flex flex-col gap-3 text-left">
                  <h4 className="font-bold text-accent-red uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <AlertTriangle size={13} />
                    <span>Permanent Account Deletion</span>
                  </h4>
                  <p className="text-text-muted text-xs leading-relaxed">
                    Deleting your account will permanently wipe your profile, saved analysis history, and active sessions. This action cannot be reversed.
                  </p>

                  <div className="flex flex-col gap-1 mt-1">
                    <label className="text-[10px] text-text-dark uppercase font-semibold">Enter Password to Confirm Deletion</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="bg-black/25 border border-red-500/30 rounded p-2 text-text-main outline-none focus:border-red-500 text-xs"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={isDeletingAccount || !deletePassword}
                      className="bg-accent-red hover:bg-accent-red/90 text-white p-2 px-4 rounded text-xs font-semibold cursor-pointer border-none shadow-md disabled:opacity-40 flex items-center gap-1.5"
                    >
                      <Trash2 size={13} />
                      <span>{isDeletingAccount ? "Deleting Account..." : "Confirm & Delete Account"}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
