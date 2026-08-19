import { useState } from "react";
import {
  Gauge,
  Zap,
  CheckCircle2,
  Clock,
  HelpCircle,
  AlertTriangle,
  Flame,
  Info,
  TrendingUp,
  Cpu,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
} from "lucide-react";
import {
  calculateOps,
  formatOperationCount,
  getEstimatedLatency,
  getFormulaString,
  getScalabilityVerdict,
  getScalingComparisonTable,
} from "../utils/benchmarkMath";

export default function BenchmarkPanel({ timeComplexity = "O(N)" }) {
  const [nValue, setNValue] = useState(100000);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const currentOps = calculateOps(timeComplexity, nValue);
  const linearOps = calculateOps("O(N)", nValue);
  const logLinearOps = calculateOps("O(NLOGN)", nValue);
  const logOps = calculateOps("O(LOGN)", nValue);

  const formulaString = getFormulaString(timeComplexity, nValue);
  const verdict = getScalabilityVerdict(currentOps);
  const scalingTable = getScalingComparisonTable(timeComplexity);

  // Quick preset inputs commonly seen in technical interviews & tests
  const presets = [
    { label: "10", value: 10, tag: "Small array / Base" },
    { label: "100", value: 100, tag: "Small matrix / N² safe" },
    { label: "1k", value: 1000, tag: "Medium dataset" },
    { label: "10k", value: 10000, tag: "Batch query" },
    { label: "100k", value: 100000, tag: "LeetCode Standard" },
  ];

  return (
    <div className="bg-card-bg border border-border-color rounded-2xl p-5 shadow-lg flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-color pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text-main">Input Scalability Simulator</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Compute Engine
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Simulate CPU operation growth, time complexity overhead, and latency ceilings across scaling inputs (N)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showExplanation
                ? "bg-accent-primary text-white border-accent-primary shadow-sm"
                : "bg-bg-dark/60 hover:bg-bg-dark border-border-color text-text-muted hover:text-text-main"
            }`}
            title="Learn how this calculation works and what it measures"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showExplanation ? "Hide Guide" : "What is this calculating?"}</span>
          </button>

          <div className="px-3 py-1 rounded-lg bg-accent-primary/10 border border-accent-primary/30 text-xs font-mono font-bold text-accent-primary">
            Class: {timeComplexity}
          </div>
        </div>
      </div>

      {/* Explanatory Guide Box (Toggleable) */}
      {showExplanation && (
        <div className="bg-gradient-to-r from-accent-primary/10 via-purple-500/5 to-transparent border border-accent-primary/30 rounded-xl p-4.5 flex flex-col gap-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-bold text-accent-primary uppercase tracking-wider">
            <Info className="w-4 h-4" />
            <span>How the Scalability Simulator Works</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-text-muted leading-relaxed">
            <div className="p-3 rounded-lg bg-card-bg/80 border border-border-color flex flex-col gap-1.5">
              <span className="font-bold text-text-main flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-accent-primary" /> 1. Operation Count f(N)
              </span>
              <p>
                Calculates the exact number of atomic operations (loop iterations, comparisons, assignments) performed by your Big-O class for input size <strong>N</strong>.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-card-bg/80 border border-border-color flex flex-col gap-1.5">
              <span className="font-bold text-text-main flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> 2. 10⁸ Ops/Sec Benchmark
              </span>
              <p>
                Standard CPUs perform ~<strong>100 Million operations per second</strong>. Online judges (LeetCode, Codeforces) allocate a 1.0-second limit (10⁸ ops).
              </p>
            </div>

            <div className="p-3 rounded-lg bg-card-bg/80 border border-border-color flex flex-col gap-1.5">
              <span className="font-bold text-text-main flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> 3. Feasibility Verdict
              </span>
              <p>
                Identifies whether your code will pass or fail with <strong>Time Limit Exceeded (TLE)</strong> when scaled from prototype (N=10) to production (N=100k+).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Input Slider & Presets */}
      <div className="flex flex-col gap-3.5 bg-bg-dark/50 p-4.5 rounded-xl border border-border-color">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label htmlFor="input-slider-n" className="text-xs font-semibold text-text-muted">
              Simulated Input Size (N):
            </label>
            <span className="text-[11px] font-mono text-accent-primary font-bold bg-accent-primary/10 px-2 py-0.5 rounded">
              {nValue.toLocaleString()} elements
            </span>
          </div>
          <div className="text-[11px] font-mono text-text-muted">
            Formula: <span className="text-text-main font-bold">{formulaString}</span>
          </div>
        </div>

        <input
          id="input-slider-n"
          type="range"
          min="10"
          max="100000"
          step="50"
          value={nValue}
          onChange={(e) => setNValue(Number(e.target.value))}
          className="w-full h-2 bg-border-color rounded-lg appearance-none cursor-pointer accent-accent-primary"
        />

        {/* Preset quick buttons */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-text-muted font-mono">N = 10</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setNValue(preset.value)}
                className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all flex items-center gap-1 ${
                  nValue === preset.value
                    ? "bg-accent-primary text-white font-bold shadow-sm"
                    : "bg-card-bg hover:bg-border-color text-text-muted hover:text-text-main border border-border-color/50"
                }`}
                title={preset.tag}
              >
                <span>N={preset.label}</span>
              </button>
            ))}
          </div>
          <span className="text-[10px] text-text-muted font-mono">N = 100k</span>
        </div>
      </div>

      {/* Main Performance & Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Your Algorithm Performance Card */}
        <div className="p-4.5 rounded-xl bg-gradient-to-br from-card-bg to-bg-dark/90 border border-accent-primary/30 flex flex-col justify-between gap-3.5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-accent-primary flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Your Code ({timeComplexity})
            </span>
            <span className="text-xs font-mono text-text-muted flex items-center gap-1 bg-bg-dark/80 px-2.5 py-1 rounded-lg border border-border-color">
              <Clock className="w-3.5 h-3.5 text-accent-primary" /> {getEstimatedLatency(currentOps)}
            </span>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-text-main tracking-tight">
              {formatOperationCount(currentOps)}
            </div>
            <p className="text-[11px] text-text-muted mt-1 font-mono">
              Theoretical CPU operation volume at N = {nValue.toLocaleString()}
            </p>
          </div>

          {/* Scalability Progress Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="w-full bg-border-color h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${verdict.barColor}`}
                style={{
                  width: `${Math.min(100, Math.max(5, (Math.log10(Math.max(1, currentOps)) / 9) * 100))}%`,
                }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-text-muted font-mono">
              <span>Instant (&lt;10⁵)</span>
              <span>100ms (10⁷)</span>
              <span className="text-red-400 font-bold">1.0s Limit (10⁸)</span>
            </div>
          </div>
        </div>

        {/* Optimal Benchmark Reference Card */}
        <div className="p-4.5 rounded-xl bg-bg-dark/60 border border-border-color flex flex-col justify-between gap-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Ideal Linear/Log Target
            </span>
            <span className="text-xs font-mono text-text-muted flex items-center gap-1 bg-bg-dark/80 px-2.5 py-1 rounded-lg border border-border-color">
              <Clock className="w-3.5 h-3.5 text-emerald-400" /> {getEstimatedLatency(logLinearOps)}
            </span>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-text-main tracking-tight">
              {formatOperationCount(logLinearOps)}
            </div>
            <p className="text-[11px] text-text-muted mt-1">
              Standard O(N log N) reference operations (e.g. MergeSort, Efficient Sorting)
            </p>
          </div>

          {/* Reference Targets Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2 rounded-lg bg-card-bg/60 border border-border-color flex flex-col">
              <span className="text-[10px] text-text-muted uppercase font-mono">Logarithmic O(log N)</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {formatOperationCount(logOps)} ops
              </span>
            </div>
            <div className="p-2 rounded-lg bg-card-bg/60 border border-border-color flex flex-col">
              <span className="text-[10px] text-text-muted uppercase font-mono">Linear O(N)</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {formatOperationCount(linearOps)} ops
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Production / LeetCode Feasibility Verdict Card */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${verdict.badgeColor}`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-black/20 mt-0.5">
            {verdict.status === "critical" ? (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            ) : verdict.status === "warning" ? (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">{verdict.title}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${verdict.badgeColor}`}>
                {verdict.badge}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">{verdict.description}</p>
            <p className="text-[11px] text-text-main font-medium mt-0.5">
              💡 <strong>Actionable Strategy:</strong> {verdict.recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Scale Growth Comparison Table Toggle */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setShowTable(!showTable)}
          className="w-full py-2 px-3 rounded-xl bg-bg-dark/40 hover:bg-bg-dark/80 border border-border-color text-xs font-semibold text-text-muted hover:text-text-main flex items-center justify-between transition-all"
        >
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent-primary" />
            View Multi-Scale Complexity Growth Table (N = 10 to 100,000)
          </span>
          {showTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTable && (
          <div className="overflow-x-auto rounded-xl border border-border-color bg-bg-dark/60 animate-fadeIn">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-border-color bg-card-bg/60 text-text-muted text-[11px]">
                  <th className="py-2.5 px-3">Input Size (N)</th>
                  <th className="py-2.5 px-3 text-accent-primary">Your Code ({timeComplexity})</th>
                  <th className="py-2.5 px-3">Estimated Latency</th>
                  <th className="py-2.5 px-3 text-emerald-400">Linear O(N)</th>
                  <th className="py-2.5 px-3 text-emerald-400">Log-Linear O(N log N)</th>
                  <th className="py-2.5 px-3 text-red-400">Quadratic O(N²)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color/50">
                {scalingTable.map((row) => (
                  <tr
                    key={row.n}
                    className={`hover:bg-card-bg/40 transition-colors ${
                      nValue === row.n ? "bg-accent-primary/10 font-bold" : ""
                    }`}
                  >
                    <td className="py-2 px-3 text-text-main font-bold">N = {row.n.toLocaleString()}</td>
                    <td className="py-2 px-3 text-accent-primary font-bold">{formatOperationCount(row.currentOps)}</td>
                    <td className="py-2 px-3 text-text-muted">{row.currentLatency}</td>
                    <td className="py-2 px-3 text-emerald-400">{formatOperationCount(row.linearOps)}</td>
                    <td className="py-2 px-3 text-emerald-400">{formatOperationCount(row.logLinearOps)}</td>
                    <td className="py-2 px-3 text-red-400">{formatOperationCount(row.quadraticOps)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
