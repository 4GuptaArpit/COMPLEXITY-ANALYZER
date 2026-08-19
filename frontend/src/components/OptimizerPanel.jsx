import { useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  TrendingUp,
  FileText,
  Zap,
  Columns,
  Maximize2,
  Code2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { parseMarkdown } from "../utils/markdownParser";
import { generateMarkdown } from "../utils/exportMarkdown";
import { useToast } from "../context/ToastContext";

export default function OptimizerPanel({
  originalCode,
  optimizedCode,
  explanation,
  timeComplexity = "O(N)",
  spaceComplexity = "O(1)",
  language = "javascript",
}) {
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState("split"); // "split" | "optimized" | "original"
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);

  const cleanOriginal = (timeComplexity || "").toUpperCase().replace(/\s+/g, "");
  const hasOptimizedVersion = Boolean(
    optimizedCode && optimizedCode.trim() && optimizedCode.trim() !== (originalCode || "").trim()
  );

  // Determine effective optimized complexity
  const getOptimizedComplexity = () => {
    if (!hasOptimizedVersion) return timeComplexity;
    if (cleanOriginal.includes("O(N²)") || cleanOriginal.includes("O(N2)")) return "O(N log N)";
    if (cleanOriginal.includes("O(N³)") || cleanOriginal.includes("O(N3)")) return "O(N²)";
    if (cleanOriginal.includes("O(2^N)") || cleanOriginal.includes("O(2N)")) return "O(N)";
    if (cleanOriginal.includes("O(N)") && !cleanOriginal.includes("LOG")) return "O(log N)";
    return timeComplexity;
  };

  const optimizedComplexity = getOptimizedComplexity();
  const isAlreadyOptimal = !hasOptimizedVersion || timeComplexity === optimizedComplexity;

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedCode || originalCode);
    setCopiedCode(true);
    showToast("Optimized code copied to clipboard!", "success");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdown({
      code: originalCode,
      language,
      timeComplexity,
      spaceComplexity,
      explanation: explanation || "Complexity optimization analysis.",
      optimizedCode: optimizedCode || originalCode,
      optimizationExplanation: explanation,
    });
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    showToast("Full Markdown analysis report copied to clipboard!", "success");
    setTimeout(() => setCopiedMd(false), 2000);
  };

  // SVG Chart Dimensions
  const width = 360;
  const height = 130;
  const paddingLeft = 40;
  const paddingBottom = 22;
  const pointsCount = 40;

  const getPoints = (type) => {
    let pts = [];
    const clean = (type || "").toUpperCase().replace(/\s+/g, "");
    for (let i = 0; i <= pointsCount; i++) {
      const percent = i / pointsCount;
      const n = 1 + percent * 50;
      const x = paddingLeft + percent * (width - paddingLeft - 10);
      let val;

      if (clean.includes("O(1)")) {
        val = 10;
      } else if (clean.includes("LOGN")) {
        val = Math.log2(n) * 16 + 10;
      } else if (clean.includes("NLOGN")) {
        val = n * Math.log2(n) * 0.35 + 10;
      } else if (clean.includes("N²") || clean.includes("N2") || clean.includes("N^2")) {
        val = n * n * 0.042 + 10;
      } else if (clean.includes("2^N") || clean.includes("2N")) {
        val = Math.pow(1.15, n) * 2 + 10;
      } else {
        val = n * 2.2 + 10;
      }

      const y = Math.max(10, height - paddingBottom - val);
      pts.push(`${x},${y}`);
    }
    return `M ${pts.join(" L ")}`;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Delta & Actions Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-card-bg via-bg-dark/80 to-card-bg border border-border-color p-3.5 rounded-2xl shadow-sm">
        {/* Complexity Delta Badge */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/25">
                {timeComplexity}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted" />
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                {optimizedComplexity}
              </span>
              {isAlreadyOptimal ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Fully Optimal
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent-primary/20 text-accent-primary border border-accent-primary/30">
                  ⚡ Asymptotic Speedup
                </span>
              )}
            </div>
          </div>
        </div>

        {/* View Mode Controls & Copy Buttons */}
        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex rounded-lg bg-bg-dark/80 p-0.5 border border-border-color">
            <button
              onClick={() => setViewMode("split")}
              className={`p-1.5 px-2.5 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === "split"
                  ? "bg-accent-primary text-white shadow-sm"
                  : "text-text-muted hover:text-text-main"
              }`}
              title="Side-by-side comparison"
            >
              <Columns size={12} />
              <span>Split</span>
            </button>
            <button
              onClick={() => setViewMode("optimized")}
              className={`p-1.5 px-2.5 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === "optimized"
                  ? "bg-accent-primary text-white shadow-sm"
                  : "text-text-muted hover:text-text-main"
              }`}
              title="Full width optimized code"
            >
              <Maximize2 size={12} />
              <span>Optimized</span>
            </button>
          </div>

          <button
            className="p-1.5 px-3 rounded-lg bg-bg-dark hover:bg-card-bg border border-border-color text-text-muted hover:text-text-main text-xs font-semibold flex items-center gap-1.5 transition-all"
            onClick={handleCopyMarkdown}
            title="Export as Notion/GitHub Markdown"
          >
            {copiedMd ? <Check size={13} className="text-emerald-400" /> : <FileText size={13} />}
            <span>{copiedMd ? "Copied!" : "Markdown"}</span>
          </button>

          <button
            className="p-1.5 px-3 rounded-lg bg-accent-primary/10 hover:bg-accent-primary/20 border border-accent-primary/30 text-accent-primary text-xs font-semibold flex items-center gap-1.5 transition-all"
            onClick={handleCopy}
            title="Copy optimized code"
          >
            {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copiedCode ? "Copied Code!" : "Copy Code"}</span>
          </button>
        </div>
      </div>

      {/* Code Comparison Windows */}
      {viewMode === "split" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
          {/* Left Window: Original */}
          <div className="border border-border-color rounded-xl overflow-hidden bg-[#282c34] flex flex-col shadow-md">
            <div className="p-2.5 px-3.5 bg-black/40 border-b border-border-color flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
                  Original Code
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-mono font-bold">
                {timeComplexity}
              </span>
            </div>
            <div className="p-3 whitespace-pre overflow-x-auto max-h-[260px] text-text-main leading-relaxed select-text font-mono text-[12px]">
              <code>{originalCode}</code>
            </div>
          </div>

          {/* Right Window: Optimized */}
          <div className="border border-emerald-500/30 rounded-xl overflow-hidden bg-[#282c34] flex flex-col shadow-md">
            <div className="p-2.5 px-3.5 bg-emerald-950/30 border-b border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Optimized Alternative
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono font-bold">
                {optimizedComplexity}
              </span>
            </div>
            <div className="p-3 whitespace-pre overflow-x-auto max-h-[260px] text-text-main leading-relaxed select-text font-mono text-[12px]">
              <code>{optimizedCode || originalCode}</code>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-emerald-500/30 rounded-xl overflow-hidden bg-[#282c34] flex flex-col shadow-md font-mono text-xs">
          <div className="p-2.5 px-4 bg-emerald-950/30 border-b border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                Full Optimized Source ({language.toUpperCase()})
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono font-bold">
              {optimizedComplexity}
            </span>
          </div>
          <div className="p-4 whitespace-pre overflow-x-auto max-h-[300px] text-text-main leading-relaxed select-text font-mono text-[13px]">
            <code>{optimizedCode || originalCode}</code>
          </div>
        </div>
      )}

      {/* Performance Gains Curve Comparison */}
      <div className="bg-card-bg border border-border-color rounded-xl p-4 flex flex-col gap-2.5 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp size={14} className="text-accent-primary" /> Growth Trajectory: Before vs. After
          </h4>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-400" /> Before ({timeComplexity})
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Optimized ({optimizedComplexity})
            </span>
          </div>
        </div>

        {/* SVG Curve */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          className="rounded-lg overflow-visible"
          style={{ backgroundColor: "var(--color-chart-bg)" }}
        >
          <line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - 5}
            y2={height - paddingBottom}
            stroke="var(--color-chart-axis)"
            strokeWidth={1}
          />
          <line
            x1={paddingLeft}
            y1={10}
            x2={paddingLeft}
            y2={height - paddingBottom}
            stroke="var(--color-chart-axis)"
            strokeWidth={1}
          />

          <text x={paddingLeft - 8} y={height - paddingBottom} fill="var(--color-chart-text)" fontSize={8} textAnchor="end">O(1)</text>
          <text x={paddingLeft - 8} y={20} fill="var(--color-chart-text)" fontSize={8} textAnchor="end">CPU Ops</text>
          <text x={paddingLeft} y={height - 5} fill="var(--color-chart-text)" fontSize={8} textAnchor="middle">N=1</text>
          <text x={width - 15} y={height - 5} fill="var(--color-chart-text)" fontSize={8} textAnchor="middle">N=50</text>

          {/* Original curve */}
          <path
            d={getPoints(timeComplexity)}
            fill="none"
            stroke="#ef4444"
            strokeWidth={3}
            style={{ filter: "drop-shadow(0 0 4px rgba(239, 68, 68, 0.4))" }}
          />

          {/* Optimized curve */}
          {!isAlreadyOptimal && (
            <path
              d={getPoints(optimizedComplexity)}
              fill="none"
              stroke="#10b981"
              strokeWidth={3}
              style={{ filter: "drop-shadow(0 0 4px rgba(16, 185, 129, 0.4))" }}
            />
          )}
        </svg>
      </div>

      {/* Optimization Explanation Breakdown */}
      <div className="bg-card-bg border border-border-color rounded-xl p-4 flex flex-col gap-2">
        <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={13} className="text-accent-primary" /> Algorithmic Optimization Rationale
        </h4>
        <div className="text-xs text-text-muted leading-relaxed">
          {explanation
            ? parseMarkdown(explanation)
            : "Your code is already running at optimal complexity! No further asymptotic improvements are required."}
        </div>
      </div>
    </div>
  );
}
