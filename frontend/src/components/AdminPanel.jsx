import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Users,
  MessageSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  Activity,
  BarChart3,
  Flame,
  Code2,
} from "lucide-react";
import client from "../api/client";
import { useToast } from "../context/ToastContext";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";

export default function AdminPanel({ isOpen, onClose }) {
  const { showToast } = useToast();
  useBodyScrollLock(isOpen);

  const [activeTab, setActiveTab] = useState("stats"); // "stats" | "users" | "feedback"
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const { data } = await client.get("/admin/stats");
      setStats(data);
    } catch (err) {
      console.error("Admin fetch stats error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async (p = 1) => {
    setIsLoading(true);
    try {
      const { data } = await client.get(`/admin/users?page=${p}&limit=10`);
      setUsers(data.users || []);
      setPage(data.page || 1);
      setTotalPages(data.pages || 1);
      setTotalUsers(data.total || 0);
    } catch (err) {
      console.error("Admin fetch users error:", err);
      showToast("Failed to load user directory.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeedback = async () => {
    setIsLoading(true);
    try {
      const { data } = await client.get("/feedback");
      setFeedbackList(data || []);
    } catch (err) {
      console.error("Admin fetch feedback error:", err);
      showToast("Failed to load feedback logs.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (activeTab === "stats") fetchStats();
      if (activeTab === "users") fetchUsers(page);
      if (activeTab === "feedback") fetchFeedback();
    }
  }, [isOpen, activeTab]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user and their history?")) return;
    try {
      await client.delete(`/admin/users/${userId}`);
      showToast("User account removed successfully.", "success");
      fetchUsers(page);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to delete user.", "error");
    }
  };

  const handleDeleteFeedback = async (id) => {
    try {
      await client.delete(`/feedback/${id}`);
      setFeedbackList((prev) => prev.filter((f) => f._id !== id));
      showToast("Feedback removed successfully.", "success");
    } catch (err) {
      showToast("Failed to delete feedback.", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-card-bg border border-border-color rounded-2xl w-full max-w-4xl max-h-[88vh] p-6 shadow-2xl relative flex flex-col gap-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-color pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
                Administrator Portal
                <span className="px-2 py-0.5 rounded-md bg-accent-primary/20 text-accent-primary text-[10px] uppercase font-mono font-bold tracking-wider">
                  Admin Guard
                </span>
              </h2>
              <p className="text-xs text-text-muted">Real-time aggregate analytics, user access directory & feedback moderation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-border-color/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex rounded-xl bg-bg-dark/60 p-1 border border-border-color">
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "stats" ? "bg-accent-primary text-white shadow-sm" : "text-text-muted hover:text-text-main"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Platform Analytics
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "users" ? "bg-accent-primary text-white shadow-sm" : "text-text-muted hover:text-text-main"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Users Directory ({totalUsers || stats?.totalUsers || 0})
            </button>
            <button
              onClick={() => setActiveTab("feedback")}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "feedback" ? "bg-accent-primary text-white shadow-sm" : "text-text-muted hover:text-text-main"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Feedback Logs ({feedbackList.length || stats?.totalFeedback || 0})
            </button>
          </div>

          <button
            onClick={() => {
              if (activeTab === "stats") fetchStats();
              else if (activeTab === "users") fetchUsers(page);
              else fetchFeedback();
            }}
            disabled={isLoading}
            className="p-2 rounded-xl bg-bg-dark border border-border-color text-text-muted hover:text-text-main hover:border-accent-primary transition-all flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto min-h-[340px] border border-border-color rounded-xl bg-bg-dark/40 p-4">
          {activeTab === "stats" && (
            <div className="flex flex-col gap-5">
              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-card-bg border border-border-color flex flex-col gap-1">
                  <span className="text-[11px] text-text-muted font-medium flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-accent-primary" /> Total Users
                  </span>
                  <span className="text-2xl font-bold text-text-main font-mono">
                    {stats ? stats.totalUsers : "..."}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-card-bg border border-border-color flex flex-col gap-1">
                  <span className="text-[11px] text-text-muted font-medium flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-purple-400" /> Total Analyses
                  </span>
                  <span className="text-2xl font-bold text-text-main font-mono">
                    {stats ? stats.totalAnalyses : "..."}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-card-bg border border-border-color flex flex-col gap-1">
                  <span className="text-[11px] text-text-muted font-medium flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-accent-yellow" /> 24h Velocity
                  </span>
                  <span className="text-2xl font-bold text-text-main font-mono">
                    {stats ? stats.analyses24h : "..."}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-card-bg border border-border-color flex flex-col gap-1">
                  <span className="text-[11px] text-text-muted font-medium flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> User Feedback
                  </span>
                  <span className="text-2xl font-bold text-text-main font-mono">
                    {stats ? stats.totalFeedback : "..."}
                  </span>
                </div>
              </div>

              {/* Distributions Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Languages Breakdown */}
                <div className="p-4 rounded-xl bg-card-bg border border-border-color flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-accent-primary" /> Top Polyglot Languages
                  </h4>
                  <div className="flex flex-col gap-2">
                    {stats?.languageDistribution?.length ? (
                      stats.languageDistribution.map((item) => (
                        <div key={item.language} className="flex flex-col gap-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-text-muted capitalize">{item.language}</span>
                            <span className="font-bold text-text-main">{item.count}</span>
                          </div>
                          <div className="w-full bg-border-color h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-accent-primary h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.max(8, (item.count / (stats.totalAnalyses || 1)) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-text-muted">No algorithm data logged yet.</p>
                    )}
                  </div>
                </div>

                {/* Complexity Breakdown */}
                <div className="p-4 rounded-xl bg-card-bg border border-border-color flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-purple-400" /> Complexity Class Mix
                  </h4>
                  <div className="flex flex-col gap-2">
                    {stats?.complexityDistribution?.length ? (
                      stats.complexityDistribution.map((item) => (
                        <div key={item.complexity} className="flex flex-col gap-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-text-muted">{item.complexity}</span>
                            <span className="font-bold text-purple-400">{item.count}</span>
                          </div>
                          <div className="w-full bg-border-color h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-purple-500 h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.max(8, (item.count / (stats.totalAnalyses || 1)) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-text-muted">No complexity classes logged yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg-dark/80 text-text-muted border-b border-border-color sticky top-0">
                  <tr>
                    <th className="p-3">User Contact</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Role / Tier</th>
                    <th className="p-3">Registered</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color/60">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-text-muted">
                        No registered users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id} className="hover:bg-card-bg/60 transition-colors">
                        <td className="p-3 font-mono font-medium text-text-main">{u.contact}</td>
                        <td className="p-3 text-text-muted">{u.name || "—"}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold font-mono ${
                              u.isAdmin ? "bg-purple-500/20 text-purple-400" : "bg-emerald-500/20 text-emerald-400"
                            }`}
                          >
                            {u.isAdmin ? "ADMIN" : "MEMBER"}
                          </span>
                        </td>
                        <td className="p-3 text-text-muted">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "feedback" && (
            <div className="flex flex-col gap-2 p-2">
              {feedbackList.length === 0 ? (
                <div className="p-8 text-center text-text-muted text-xs">No user feedback submissions yet.</div>
              ) : (
                feedbackList.map((f) => (
                  <div
                    key={f._id}
                    className="p-3.5 bg-card-bg/80 border border-border-color rounded-xl flex flex-col gap-2 relative group hover:border-accent-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-text-main">{f.name}</span>
                        <span className="text-[11px] font-mono text-text-muted">({f.email})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-text-muted">
                          {f.createdAt ? new Date(f.createdAt).toLocaleString() : ""}
                        </span>
                        <button
                          onClick={() => handleDeleteFeedback(f._id)}
                          className="p-1 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed whitespace-pre-wrap">{f.message}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer with Users Pagination */}
        {activeTab === "users" && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border-color pt-3 text-xs text-text-muted">
            <span>
              Page {page} of {totalPages} ({totalUsers} total users)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fetchUsers(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg bg-bg-dark border border-border-color disabled:opacity-30 hover:border-accent-primary transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchUsers(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg bg-bg-dark border border-border-color disabled:opacity-30 hover:border-accent-primary transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
