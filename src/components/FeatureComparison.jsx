import React from "react";
import { Check, X, Sparkles } from "lucide-react";

export default function FeatureComparison({ userTier }) {
  const tiers = [
    { id: "anonymous", name: "Anonymous", desc: "No Login", color: "text-text-muted border-border-color bg-white/2" },
    { id: "free", name: "Free Member", desc: "Logged In", color: "text-primary border-primary/20 bg-primary/5" },
    { id: "premium", name: "Premium Pro", desc: "₹40/Month", color: "text-accent-yellow border-accent-yellow/20 bg-accent-yellow/5" }
  ];

  const features = [
    { name: "Time & Space Complexity Badges", anon: true, free: true, paid: true },
    { name: "Responsive SVG Complexity Charts", anon: true, free: true, paid: true },
    { name: "AI Code Converter (5 languages)", anon: true, free: true, paid: true },
    { name: "Line-by-Line Execution Heatmap", anon: false, free: true, paid: true },
    { name: "AI Optimization Recommendations", anon: false, free: true, paid: true },
    { name: "Side-by-Side Code Diff Viewer", anon: false, free: true, paid: true },
    { name: "LinkedIn & GitHub Badge Generator", anon: false, free: true, paid: true },
    { name: "Step-by-Step Logic Simulator", anon: false, free: false, paid: true },
    { name: "Custom Case Execution Trace", anon: false, free: false, paid: true },
    { name: "Variables Watcher & Stack Monitor", anon: false, free: false, paid: true },
    { name: "Simulated Custom Quiz Practice", anon: false, free: false, paid: true },
  ];

  return (
    <div className="glass-panel p-5 mt-6 border border-border-color rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-primary animate-pulse" />
        <h3 className="text-sm font-semibold text-text-main uppercase tracking-wider">
          Feature Comparison Matrix
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs text-left">
          <thead>
            <tr className="border-b border-border-color bg-white/2">
              <th className="p-3 text-text-muted font-semibold max-w-[200px]">Feature Details</th>
              {tiers.map((tier) => {
                const isActive = userTier === tier.id;
                return (
                  <th
                    key={tier.id}
                    className={`p-3 text-center transition-all duration-300 relative ${
                      isActive ? "bg-primary/8 font-bold border-x border-primary/20" : ""
                    }`}
                  >
                    {isActive && (
                      <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-[8px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
                        Current
                      </span>
                    )}
                    <div className="text-[12px] text-text-main font-semibold">{tier.name}</div>
                    <div className="text-[9px] text-text-muted font-normal mt-0.5">{tier.desc}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {features.map((feat, idx) => (
              <tr
                key={idx}
                className="border-b border-border-color hover:bg-white/1 transition-colors"
              >
                <td className="p-3 font-medium text-text-muted text-[11.5px] leading-relaxed">
                  {feat.name}
                </td>
                
                {/* Anonymous */}
                <td
                  className={`p-3 text-center transition-all duration-300 ${
                    userTier === "anonymous" ? "bg-primary/5 border-x border-primary/10" : ""
                  }`}
                >
                  {feat.anon ? (
                    <Check size={14} className="text-accent-green mx-auto" />
                  ) : (
                    <X size={14} className="text-accent-red mx-auto opacity-50" />
                  )}
                </td>

                {/* Free Member */}
                <td
                  className={`p-3 text-center transition-all duration-300 ${
                    userTier === "free" ? "bg-primary/5 border-x border-primary/10" : ""
                  }`}
                >
                  {feat.free ? (
                    <Check size={14} className="text-accent-green mx-auto" />
                  ) : (
                    <X size={14} className="text-accent-red mx-auto opacity-50" />
                  )}
                </td>

                {/* Premium Pro */}
                <td
                  className={`p-3 text-center transition-all duration-300 ${
                    userTier === "premium" ? "bg-primary/5 border-x border-primary/10" : ""
                  }`}
                >
                  {feat.paid ? (
                    <Check size={14} className="text-accent-green mx-auto" />
                  ) : (
                    <X size={14} className="text-accent-red mx-auto opacity-50" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
