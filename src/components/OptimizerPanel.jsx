import React, { useState } from "react";
import { Sparkles, ArrowRight, Copy, Check, Lock, Award, TrendingUp } from "lucide-react";
import { parseMarkdown } from "../utils/markdownParser";


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

  const getOptimizedComplexity = (orig) => {
    const clean = (orig || "").toUpperCase().replace(/\s+/g, "");
    if (clean.includes("O(N²)") || clean.includes("O(N2)")) {
      if (originalCode && originalCode.includes("bubbleSort")) return "O(N log N)";
      return "O(N)";
    }
    if (clean.includes("O(2^N)") || clean.includes("O(2N)")) return "O(N)";
    if (clean.includes("O(N)") && !clean.includes("LOG")) return "O(log N)";
    return orig || "O(1)";
  };

  const optimizedComplexity = getOptimizedComplexity(timeComplexity);

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

  if (userTier === "anonymous") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center flex-1 bg-black/10 rounded-lg border border-border-color mt-2.5">
        <div className="bg-primary/10 text-primary p-3 rounded-full mb-3 flex">
          <Lock size={28} />
        </div>
        <h3 className="text-base font-semibold mb-1.5">Unlock AI Optimizations</h3>
        <p className="text-xs text-text-muted max-w-[300px] mb-4 leading-relaxed">
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
    <div className="flex flex-col mt-2.5">
      {/* Verification Badge Generator */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-4 flex flex-col items-center gap-3.5 mb-4">
        <div className="text-center">
          <h4 className="text-sm font-semibold flex items-center justify-center gap-1.5 text-text-main">
            <Award size={16} className="text-primary" /> Shareable Verification Badge
          </h4>
          <p className="text-[11px] text-text-muted mt-0.5">
            Generate a watermarked card to share your complexity score on LinkedIn or GitHub.
          </p>
        </div>
        
        {showBadgeCreated ? (
          <div className="bg-[#0d1117] border border-white/10 rounded-lg p-4 w-full max-w-[280px] shadow-lg relative overflow-hidden text-left">
            <div className="flex justify-between items-center text-[10px] text-text-muted border-b border-white/5 pb-2 mb-3">
              <span>Verified Complexity</span>
              <Sparkles size={12} className="text-accent-yellow" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">BigO.ai Scorecard</h3>
            <div className="mb-2">
              <div className="text-[10px] text-text-muted">TIME COMPLEXITY</div>
              <div className="text-lg font-bold text-primary">{timeComplexity || "O(1)"}</div>
            </div>
            <div>
              <div className="text-[10px] text-text-muted">SPACE COMPLEXITY</div>
              <div className="text-base font-bold text-secondary">{spaceComplexity || "O(1)"}</div>
            </div>
            <div className="absolute bottom-1.5 right-2.5 text-[9px] text-text-dark font-semibold tracking-wider">
              Verified by BigO.ai
            </div>
          </div>
        ) : (
          <button className="btn-secondary text-xs" onClick={() => setShowBadgeCreated(true)}>
            Generate Badge Image
          </button>
        )}
      </div>

      {/* Side by Side Diff */}
      <h4 className="text-[12.5px] font-semibold text-text-muted uppercase tracking-wider mb-2">
        <Sparkles size={12} className="text-primary inline mr-1" /> Side-by-Side Comparison
      </h4>
      <div className="diff-container grid grid-cols-2 gap-3 font-mono text-[12px] rounded-lg overflow-hidden mb-3">
        <div className="flex flex-col">
          <div className="diff-header-left p-1.5 px-2.5 text-[11px] font-semibold border-b border-l-2">
            <span>Your Code ({timeComplexity || "O(N²)"})</span>
          </div>
          <div className="diff-body-left p-2.5 whitespace-pre max-h-[180px] overflow-y-auto">
            <code>{originalCode}</code>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="diff-header-right p-1.5 px-2.5 text-[11px] font-semibold border-b border-l-2">
            <span>Optimized Code ({optimizedComplexity})</span>
          </div>
          <div className="diff-body-right p-2.5 whitespace-pre max-h-[180px] overflow-y-auto">
            <code>{optimizedCode || originalCode}</code>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button
          className="btn-secondary text-[11px] py-1.5"
          onClick={handleCopy}
          disabled={!optimizedCode || isAlreadyOptimal}
        >
          {copied ? <Check size={14} className="text-accent-green" /> : <Copy size={14} />}
          <span>{copied ? "Copied!" : "Copy Optimized Code"}</span>
        </button>
      </div>

      {/* Overlay Complexity Chart */}
      <div className="bg-black/15 dark:bg-white/8 border border-border-color rounded-lg p-3 flex flex-col gap-2 mb-4">
        <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp size={14} /> Performance Gains: Before vs. After
        </h4>
        
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          className="rounded-md overflow-visible"
          style={{ backgroundColor: "var(--color-chart-bg)" }}
        >
          {/* Axis */}
          <line x1={paddingLeft} y1={height - paddingBottom} x2={width - 5} y2={height - paddingBottom} stroke="var(--color-chart-axis)" strokeWidth={1} />
          <line x1={paddingLeft} y1={10} x2={paddingLeft} y2={height - paddingBottom} stroke="var(--color-chart-axis)" strokeWidth={1} />

          {/* Curves */}
          <path
            d={getPoints(timeComplexity)}
            fill="none"
            stroke="var(--color-accent-red)"
            strokeWidth={3}
            style={{ filter: "drop-shadow(0 0 3px rgba(239, 68, 68, 0.4))" }}
          />

          {!isAlreadyOptimal && (
            <path
              d={getPoints(optimizedComplexity)}
              fill="none"
              stroke="var(--color-accent-green)"
              strokeWidth={3}
              style={{ filter: "drop-shadow(0 0 3px rgba(16, 185, 129, 0.4))" }}
            />
          )}
        </svg>

        <div className="flex flex-wrap gap-3 mt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-red" />
            <span className="text-[11px] text-text-muted">
              Before: <strong>{timeComplexity}</strong>
            </span>
          </div>
          {!isAlreadyOptimal && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
              <span className="text-[11px] text-text-muted">
                After (AI Optimized): <strong>{optimizedComplexity}</strong>
              </span>
            </div>
          )}
          {isAlreadyOptimal && (
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-accent-green font-semibold">
                ✓ Code is already optimal!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Explanation description */}
      <h4 className="text-[12.5px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">
        Why is this solution better?
      </h4>
      <div className="text-text-muted text-[13.5px] leading-relaxed bg-white/2 border border-border-color rounded-lg p-3">
        {explanation ? parseMarkdown(explanation) : "Your code is already running at optimal complexity! No further improvements were detected."}
      </div>

    </div>
  );
}
