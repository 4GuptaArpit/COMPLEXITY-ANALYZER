import React from "react";
import { Zap, Clock, Bookmark } from "lucide-react";

export default function AdSidebar({ history, onLoadHistory, userTier }) {
  return (
    <aside className="sidebar-ad sidebar-ad-left">
      {/* Sponsored Ad Unit */}
      <div className="glass-panel ad-box" style={{ flexShrink: 0 }}>
        <span className="ad-badge">Sponsored</span>
        <Zap size={20} color="#eab308" style={{ marginBottom: "6px" }} />
        <h4 style={{ fontSize: "0.8rem", fontWeight: "600", marginBottom: "2px" }}>HostVibe SSD</h4>
        <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: "6px" }}>
          SSD Cloud hosting from ₹240/mo. Fast & secure.
        </p>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          style={{ color: "var(--primary)", fontSize: "0.7rem", fontWeight: "600", textDecoration: "none" }}
        >
          Buy Now →
        </a>
      </div>

      {/* Code History Box (Unlocked for logged in users) */}
      <div className="glass-panel history-card">
        <h4 className="section-label" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem" }}>
          <Clock size={12} />
          <span>Code History</span>
        </h4>
        
        {userTier === "anonymous" ? (
          <div className="history-empty">
            <Bookmark size={20} style={{ opacity: 0.3, marginBottom: "6px" }} />
            <p>Log in to save and reload your code history</p>
          </div>
        ) : history && history.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
            {history.map((item, idx) => (
              <button
                key={idx}
                className="history-item"
                onClick={() => onLoadHistory(item)}
              >
                <div className="history-name">{item.name || "Custom Analysis"}</div>
                <div className="history-meta">
                  <span style={{ color: "var(--primary)", fontWeight: "600" }}>{item.timeComplexity}</span>
                  <span>{item.language}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="history-empty">
            <p>No analyzed history yet. Write code and click "Analyze Complexity"!</p>
          </div>
        )}
      </div>
    </aside>
  );
}
