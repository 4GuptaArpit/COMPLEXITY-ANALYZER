import { TrendingUp, BookOpen, Lightbulb, Cpu, ShieldCheck, HelpCircle } from "lucide-react";
import { parseMarkdown } from "../utils/markdownParser";

export default function ChartViewer({
  timeComplexity,
  spaceComplexity,
  explanation,
  plainExplanation,
  staticAnalysis,
}) {
  // Map time complexity string to curves
  const cleanComplexity = (timeComplexity || "").toUpperCase().replace(/\s+/g, "");

  const isO1 = cleanComplexity.includes("O(1)");
  const isOLogN = cleanComplexity.includes("O(LOGN)");
  const isON = cleanComplexity.includes("O(N)") && !cleanComplexity.includes("O(NLOGN)") && !cleanComplexity.includes("O(N²)") && !cleanComplexity.includes("O(N2)");
  const isONLogN = cleanComplexity.includes("O(NLOGN)");
  const isON2 = cleanComplexity.includes("O(N²)") || cleanComplexity.includes("O(N2)");
  const isO2N = cleanComplexity.includes("O(2^N)") || cleanComplexity.includes("O(2N)");

  // Generate path points for SVG
  const width = 360;
  const height = 160;
  const paddingLeft = 40;
  const paddingBottom = 20;
  
  const pointsCount = 40;
  
  const getPoints = (type) => {
    let pts = [];
    for (let i = 0; i <= pointsCount; i++) {
      const percent = i / pointsCount;
      const n = 1 + percent * 50; // N goes from 1 to 50
      const x = paddingLeft + percent * (width - paddingLeft - 10);
      let val;
      
      switch (type) {
        case "O(1)":
          val = 10;
          break;
        case "O(log N)":
          val = Math.log2(n) * 20 + 10;
          break;
        case "O(N)":
          val = n * 2.5 + 10;
          break;
        case "O(N log N)":
          val = n * Math.log2(n) * 0.5 + 10;
          break;
        case "O(N²)":
          val = n * n * 0.05 + 10;
          break;
        case "O(2^N)":
          val = Math.pow(1.18, n) * 3 + 10;
          break;
        default:
          val = 10;
      }
      
      const y = Math.max(10, height - paddingBottom - val);
      pts.push(`${x},${y}`);
    }
    return `M ${pts.join(" L ")}`;
  };

  const curves = [
    { name: "O(1)", type: "O(1)", color: "#10b981", active: isO1 },
    { name: "O(log N)", type: "O(log N)", color: "#22c55e", active: isOLogN },
    { name: "O(N)", type: "O(N)", color: "#eab308", active: isON },
    { name: "O(N log N)", type: "O(N log N)", color: "#f97316", active: isONLogN },
    { name: "O(N²)", type: "O(N²)", color: "#ef4444", active: isON2 || isO2N },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Static Pre-Analysis Heuristic Banner */}
      {staticAnalysis && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-accent-primary/10 via-purple-500/5 to-transparent border border-accent-primary/25 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-accent-primary" />
              <span className="text-xs font-bold text-text-main">
                Deterministic Static Code Scan
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-primary/20 text-accent-primary font-mono font-semibold">
                Zero-Latency
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-text-muted">
                Confidence: <strong className="capitalize text-accent-green font-semibold">{staticAnalysis.confidence}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-text-muted">Static Prediction:</span>
            <span className="px-2 py-0.5 rounded bg-black/20 dark:bg-white/10 font-mono font-bold text-accent-primary">
              Time: {staticAnalysis.timeComplexity}
            </span>
            <span className="px-2 py-0.5 rounded bg-black/20 dark:bg-white/10 font-mono font-bold text-purple-400">
              Space: {staticAnalysis.spaceComplexity}
            </span>
            {staticAnalysis.loopDepth > 0 && (
              <span className="text-[11px] text-text-muted">
                (Loop Depth: {staticAnalysis.loopDepth})
              </span>
            )}
            {staticAnalysis.hasRecursion && (
              <span className="text-[11px] text-accent-yellow">
                (Recursion Detected)
              </span>
            )}
          </div>

          {staticAnalysis.reasoning && staticAnalysis.reasoning.length > 0 && (
            <ul className="text-[11px] text-text-muted list-disc list-inside space-y-0.5 pt-1 border-t border-border-color/50">
              {staticAnalysis.reasoning.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Complexity Summary Badges */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent-primary/10 border border-accent-primary/20">
          <span className="text-[10px] uppercase font-bold text-accent-primary tracking-wider">Time</span>
          <span className="text-base font-mono font-black text-text-main">{timeComplexity || "O(N)"}</span>
        </div>
        <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Space</span>
          <span className="text-base font-mono font-black text-text-main">{spaceComplexity || "O(1)"}</span>
        </div>
      </div>

      {/* Growth Curve Chart */}
      <div className="bg-black/15 dark:bg-white/8 border border-border-color rounded-lg p-3 flex flex-col gap-2">
        <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex justify-between items-center">
          <span className="flex items-center gap-1.5">
            <TrendingUp size={14} /> Complexity Growth Curve
          </span>
          <span className="text-accent-yellow">
            Highlighted: {timeComplexity || "O(1)"}
          </span>
        </h4>

        {/* SVG Canvas */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          className="rounded-md overflow-visible"
          style={{ backgroundColor: "var(--color-chart-bg)" }}
        >
          {/* Grid lines */}
          <line x1={paddingLeft} y1={height - paddingBottom} x2={width - 5} y2={height - paddingBottom} stroke="var(--color-chart-axis)" strokeWidth={1} />
          <line x1={paddingLeft} y1={10} x2={paddingLeft} y2={height - paddingBottom} stroke="var(--color-chart-axis)" strokeWidth={1} />
          
          {/* Y-Axis labels */}
          <text x={paddingLeft - 10} y={height - paddingBottom} fill="var(--color-chart-text)" fontSize={8} textAnchor="end">O(1)</text>
          <text x={paddingLeft - 10} y={height / 2} fill="var(--color-chart-text)" fontSize={8} textAnchor="end">Operations</text>
          <text x={paddingLeft - 10} y={20} fill="var(--color-chart-text)" fontSize={8} textAnchor="end">O(N²)</text>

          {/* X-Axis labels */}
          <text x={paddingLeft} y={height - 5} fill="var(--color-chart-text)" fontSize={8} textAnchor="middle">1</text>
          <text x={width / 2 + paddingLeft / 2} y={height - 5} fill="var(--color-chart-text)" fontSize={8} textAnchor="middle">Input Size (N)</text>
          <text x={width - 15} y={height - 5} fill="var(--color-chart-text)" fontSize={8} textAnchor="middle">N = 50</text>

          {/* Curves */}
          {curves.map((curve) => {
            const isCurrent = curve.active;
            return (
              <path
                key={curve.name}
                d={getPoints(curve.type)}
                fill="none"
                stroke={isCurrent ? "var(--color-accent-yellow)" : curve.color}
                strokeWidth={isCurrent ? 3.5 : 1.5}
                strokeOpacity={isCurrent ? 1 : 0.25}
                style={{
                  filter: isCurrent ? "drop-shadow(0px 0px 4px var(--color-accent-yellow))" : "none",
                  transition: "all 0.3s ease"
                }}
              />
            );
          })}

          {/* Extra path for O(2^N) */}
          {isO2N && (
            <path
              d={getPoints("O(2^N)")}
              fill="none"
              stroke="var(--color-accent-red)"
              strokeWidth={3.5}
              style={{
                filter: "drop-shadow(0px 0px 4px var(--color-accent-red))"
              }}
            />
          )}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap gap-2.5">
          {curves.map((curve) => (
            <div key={curve.name} className="flex items-center gap-1">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: curve.active ? "var(--color-accent-yellow)" : curve.color,
                  opacity: curve.active ? 1 : 0.4,
                  boxShadow: curve.active ? "0 0 6px var(--color-accent-yellow)" : "none"
                }}
              />
              <span style={{ 
                fontSize: "10px", 
                fontWeight: curve.active ? "600" : "normal",
                color: curve.active ? "var(--color-text-main)" : "var(--color-text-muted)" 
              }}>
                {curve.name} {curve.active ? "(Your Algo)" : ""}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Plain English Explanation */}
      {plainExplanation && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-accent-primary/5 border border-accent-primary/15">
          <Lightbulb size={14} className="text-accent-primary mt-0.5 shrink-0" />
          <div className="text-xs text-text-muted leading-relaxed flex-1">
            {parseMarkdown(plainExplanation)}
          </div>
        </div>
      )}

      {/* Technical Complexity Breakdown */}
      {explanation && (
        <div className="p-3 rounded-xl bg-card-bg border border-border-color flex flex-col gap-2">
          <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen size={13} /> Asymptotic Breakdown
          </h4>
          <div className="text-xs text-text-muted leading-relaxed">
            {parseMarkdown(explanation)}
          </div>
        </div>
      )}
    </div>
  );
}
