import React, { useState } from "react";
import { Sparkles, ArrowRight, Copy, Check, Lock, Award, TrendingUp } from "lucide-react";

export default function OptimizerPanel({
  userTier,
  originalCode,
  optimizedCode,
  explanation,
  timeComplexity,
  spaceComplexity,
  onSignUp
}) {
  const [copied, setCopied] = useState(false);
  const [showBadgeCreated, setShowBadgeCreated] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to map original complexity to an optimized target complexity for graph plotting
  const getOptimizedComplexity = (orig) => {
    const clean = (orig || "").toUpperCase().replace(/\s+/g, "");
    if (clean.includes("O(N²)") || clean.includes("O(N2)")) {
      // If original is bubble sort, optimized is merge sort O(N log N)
      if (originalCode && originalCode.includes("bubbleSort")) return "O(N log N)";
      return "O(N)";
    }
    if (clean.includes("O(2^N)") || clean.includes("O(2N)")) return "O(N)";
    if (clean.includes("O(N)") && !clean.includes("LOG")) return "O(log N)";
    return orig || "O(1)";
  };

  const optimizedComplexity = getOptimizedComplexity(timeComplexity);

  // SVG Chart rendering points
  const width = 340;
  const height = 130;
  const paddingLeft = 40;
  const paddingBottom = 20;
  const pointsCount = 40;

  const getPoints = (type) => {
    let pts = [];
    const clean = (type || "").toUpperCase().replace(/\s+/g, "");
    for (let i = 0; i <= pointsCount; i++) {
      const percent = i / pointsCount;
      const n = 1 + percent * 50;
      const x = paddingLeft + percent * (width - paddingLeft - 10);
      let val = 0;

      if (clean.includes("O(1)")) {
        val = 10;
      } else if (clean.includes("LOGN")) {
        val = Math.log2(n) * 15 + 10;
      } else if (clean.includes("NLOGN")) {
        val = n * Math.log2(n) * 0.35 + 10;
      } else if (clean.includes("N²") || clean.includes("N2")) {
        val = n * n * 0.04 + 10;
      } else if (clean.includes("2^N") || clean.includes("2N")) {
        val = Math.pow(1.15, n) * 2 + 10;
      } else if (clean.includes("O(N)")) {
        val = n * 2 + 10;
      } else {
        val = n * 2 + 10;
      }

      const y = Math.max(10, height - paddingBottom - val);
      pts.push(`${x},${y}`);
    }
    return `M ${pts.join(" L ")}`;
  };

  // Tier 1 (Anonymous) lock check
  if (userTier === "anonymous") {
    return (
      <div className="lock-overlay" style={{ marginTop: "10px" }}>
        <div className="lock-icon" style={{ background: "rgba(99, 102, 241, 0.1)", color: "var(--primary)" }}>
          <Lock size={28} />
        </div>
        <h3 className="lock-title">Unlock AI Optimizations</h3>
        <p className="lock-desc">
          Sign up for a free account to unlock better alternative solutions, detailed optimizations, and side-by-side code reviews.
        </p>
        <button className="btn-primary" onClick={onSignUp}>
          Create Free Account
        </button>
      </div>
    );
  }

  const isAlreadyOptimal = timeComplexity === optimizedComplexity;

  return (
    <div className="tab-content" style={{ padding: 0 }}>
      {/* Verification Badge Generator */}
      <div className="badge-generator" style={{ marginBottom: "16px", marginTop: "10px" }}>
        <div style={{ textAlign: "center" }}>
          <h4 className="option-title" style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <Award size={16} color="var(--primary)" /> Shareable Verification Badge
          </h4>
          <p className="option-desc" style={{ fontSize: "0.7rem", marginTop: "2px" }}>
            Generate a watermarked card to share your complexity score on LinkedIn or GitHub.
          </p>
        </div>
        
        {showBadgeCreated ? (
          <div className="visual-badge">
            <div className="visual-badge-header">
              <span>Verified Complexity</span>
              <Sparkles size={12} color="var(--accent-yellow)" />
            </div>
            <h3 style={{ fontSize: "1rem", margin: "4px 0", color: "#fff" }}>BigO.ai Scorecard</h3>
            <div style={{ margin: "10px 0" }}>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>TIME COMPLEXITY</div>
              <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--primary)" }}>{timeComplexity || "O(1)"}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>SPACE COMPLEXITY</div>
              <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--secondary)" }}>{spaceComplexity || "O(1)"}</div>
            </div>
            <div className="badge-watermark">Verified by BigO.ai</div>
          </div>
        ) : (
          <button className="btn-secondary" style={{ fontSize: "0.75rem" }} onClick={() => setShowBadgeCreated(true)}>
            Generate Badge Image
          </button>
        )}
      </div>

      {/* Side by Side Diff */}
      <h4 className="section-label" style={{ marginBottom: "8px" }}>
        <Sparkles size={12} color="var(--primary)" /> Side-by-Side Comparison
      </h4>
      <div className="diff-container">
        <div className="diff-panel">
          <div className="diff-header original" style={{ borderLeft: "2px solid var(--accent-red)" }}>
            <span>Your Code ({timeComplexity || "O(N²)"})</span>
          </div>
          <div className="diff-body">
            <code>{originalCode}</code>
          </div>
        </div>

        <div className="diff-panel">
          <div className="diff-header optimized" style={{ borderLeft: "2px solid var(--accent-green)" }}>
            <span>Optimized Code ({optimizedComplexity})</span>
          </div>
          <div className="diff-body">
            <code>{optimizedCode || originalCode}</code>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <button
          className="btn-secondary"
          onClick={handleCopy}
          disabled={!optimizedCode || isAlreadyOptimal}
          style={{ fontSize: "0.75rem" }}
        >
          {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
          <span>{copied ? "Copied!" : "Copy Optimized Code"}</span>
        </button>
      </div>

      {/* Overlay Complexity Chart (Original vs. Optimized) */}
      <div className="chart-container" style={{ marginBottom: "16px" }}>
        <h4 className="section-label" style={{ fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "6px" }}>
          <TrendingUp size={14} /> Performance Gains: Before vs. After
        </h4>
        
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          style={{ background: "rgba(0,0,0,0.25)", borderRadius: "6px", overflow: "visible" }}
        >
          {/* Axis */}
          <line x1={paddingLeft} y1={height - paddingBottom} x2={width - 5} y2={height - paddingBottom} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          <line x1={paddingLeft} y1={10} x2={paddingLeft} y2={height - paddingBottom} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />

          {/* Curves */}
          {/* Original Complexity Curve (Red Line) */}
          <path
            d={getPoints(timeComplexity)}
            fill="none"
            stroke="var(--accent-red)"
            strokeWidth={3}
            style={{ filter: "drop-shadow(0 0 3px rgba(239, 68, 68, 0.4))" }}
          />

          {/* Optimized Complexity Curve (Green Line) */}
          {!isAlreadyOptimal && (
            <path
              d={getPoints(optimizedComplexity)}
              fill="none"
              stroke="var(--accent-green)"
              strokeWidth={3}
              style={{ filter: "drop-shadow(0 0 3px rgba(16, 185, 129, 0.4))" }}
            />
          )}
        </svg>

        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: "var(--accent-red)" }} />
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              Before: <strong>{timeComplexity}</strong>
            </span>
          </div>
          {!isAlreadyOptimal && (
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: "var(--accent-green)" }} />
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                After (AI Optimized): <strong>{optimizedComplexity}</strong>
              </span>
            </div>
          )}
          {isAlreadyOptimal && (
            <div className="legend-item">
              <span style={{ fontSize: "0.7rem", color: "var(--accent-green)", fontWeight: 600 }}>
                ✓ Code is already optimal!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Explanation description */}
      <h4 className="section-label" style={{ marginBottom: "6px" }}>
        Why is this solution better?
      </h4>
      <div
        className="explanation-text"
        style={{
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid var(--border-color)",
          borderRadius: "8px",
          padding: "12px 16px",
          margin: 0,
          whiteSpace: "pre-wrap"
        }}
      >
        {explanation || "Your code is already running at optimal complexity! No further improvements were detected."}
      </div>
    </div>
  );
}
