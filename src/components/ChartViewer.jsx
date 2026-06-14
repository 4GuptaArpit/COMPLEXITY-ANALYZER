import React from "react";
import { TrendingUp } from "lucide-react";

export default function ChartViewer({ timeComplexity }) {
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
      let val = 0;
      
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
      
      // Keep y in bounds
      const y = Math.max(10, height - paddingBottom - val);
      pts.push(`${x},${y}`);
    }
    return `M ${pts.join(" L ")}`;
  };

  const curves = [
    { name: "O(1)", type: "O(1)", color: "#10b981", active: isO1 }, // Green (Constant)
    { name: "O(log N)", type: "O(log N)", color: "#22c55e", active: isOLogN }, // Light Green
    { name: "O(N)", type: "O(N)", color: "#eab308", active: isON }, // Yellow (Linear)
    { name: "O(N log N)", type: "O(N log N)", color: "#f97316", active: isONLogN }, // Orange (Linearithmic)
    { name: "O(N²)", type: "O(N²)", color: "#ef4444", active: isON2 || isO2N }, // Red (Quadratic/Exponential)
  ];

  return (
    <div className="chart-container">
      <h4 className="section-label" style={{ fontSize: "0.8rem", display: "flex", justifyContent: "space-between" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <TrendingUp size={14} /> Complexity Growth Curve
        </span>
        <span style={{ color: "var(--accent-yellow)" }}>
          Current: {timeComplexity || "O(1)"}
        </span>
      </h4>

      {/* SVG Canvas */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        style={{ background: "rgba(0,0,0,0.3)", borderRadius: "6px", overflow: "visible" }}
      >
        {/* Grid lines */}
        <line x1={paddingLeft} y1={height - paddingBottom} x2={width - 5} y2={height - paddingBottom} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
        <line x1={paddingLeft} y1={10} x2={paddingLeft} y2={height - paddingBottom} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
        
        {/* Y-Axis labels */}
        <text x={paddingLeft - 10} y={height - paddingBottom} fill="var(--text-dark)" fontSize={8} textAnchor="end">O(1)</text>
        <text x={paddingLeft - 10} y={height / 2} fill="var(--text-dark)" fontSize={8} textAnchor="end">Operations</text>
        <text x={paddingLeft - 10} y={20} fill="var(--text-dark)" fontSize={8} textAnchor="end">O(N²)</text>

        {/* X-Axis labels */}
        <text x={paddingLeft} y={height - 5} fill="var(--text-dark)" fontSize={8} textAnchor="middle">1</text>
        <text x={width / 2 + paddingLeft / 2} y={height - 5} fill="var(--text-dark)" fontSize={8} textAnchor="middle">Input Size (N)</text>
        <text x={width - 15} y={height - 5} fill="var(--text-dark)" fontSize={8} textAnchor="middle">N = 50</text>

        {/* Curves */}
        {curves.map((curve) => {
          // If the algorithm matches this curve, make it thick, glowing, and yellow/highlighted
          const isCurrent = curve.active;
          return (
            <path
              key={curve.name}
              d={getPoints(curve.type)}
              fill="none"
              stroke={isCurrent ? "var(--accent-yellow)" : curve.color}
              strokeWidth={isCurrent ? 3.5 : 1.5}
              strokeOpacity={isCurrent ? 1 : 0.25}
              style={{
                filter: isCurrent ? "drop-shadow(0px 0px 4px var(--accent-yellow))" : "none",
                transition: "all 0.3s ease"
              }}
            />
          );
        })}

        {/* Extra path for O(2^N) if explicitly selected */}
        {isO2N && (
          <path
            d={getPoints("O(2^N)")}
            fill="none"
            stroke="var(--accent-red)"
            strokeWidth={3.5}
            style={{
              filter: "drop-shadow(0px 0px 4px var(--accent-red))"
            }}
          />
        )}
      </svg>

      {/* Legend */}
      <div className="chart-legend">
        {curves.map((curve) => (
          <div key={curve.name} className="legend-item">
            <span
              className="legend-dot"
              style={{
                backgroundColor: curve.active ? "var(--accent-yellow)" : curve.color,
                opacity: curve.active ? 1 : 0.4,
                boxShadow: curve.active ? "0 0 6px var(--accent-yellow)" : "none"
              }}
            />
            <span style={{ 
              fontSize: "0.7rem", 
              fontWeight: curve.active ? "600" : "normal",
              color: curve.active ? "var(--text-main)" : "var(--text-muted)" 
            }}>
              {curve.name} {curve.active ? "(Your Algo)" : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
