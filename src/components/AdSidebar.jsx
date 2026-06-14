import React from "react";
import { Zap, Award, Sparkles, Terminal, ArrowRight } from "lucide-react";

export default function AdSidebar({ onUpgrade }) {
  return (
    <aside className="flex flex-col gap-4 sticky top-4 h-[calc(100vh-32px)] pr-0.5 max-md:hidden select-none">
      {/* sponsored title header */}
      <div className="flex items-center justify-between px-1 shrink-0">
        <span className="text-[10px] font-bold text-text-dark uppercase tracking-wider">
          Sponsored Space
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-accent-yellow animate-pulse" />
      </div>

      {/* Sponsored Ad 1: HostVibe SSD */}
      <div className="glass-panel bg-white/2 dark:bg-black/2 border border-dashed border-gray-500/15 rounded-lg flex flex-col items-center justify-center p-4 text-center shrink-0 text-text-dark text-xs transition-all duration-300 hover:bg-white/4 hover:border-primary hover:text-text-muted hover:-translate-y-0.5">
        <span className="bg-gray-500/10 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider mb-2">
          Ad Sponsor
        </span>
        <Zap size={20} className="text-accent-yellow mb-1.5" />
        <h4 className="text-[13px] font-bold mb-0.5 text-text-main">HostVibe SSD</h4>
        <p className="text-[11px] text-text-muted mb-3 leading-relaxed">
          SSD Cloud hosting from ₹240/mo. Fast & secure.
        </p>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="text-primary text-[11px] font-semibold no-underline flex items-center gap-1 hover:brightness-110"
        >
          <span>Buy Now</span>
          <ArrowRight size={10} />
        </a>
      </div>

      {/* Sponsored Ad 2: BigO.ai Premium Upgrade */}
      <div className="glass-panel bg-gradient-to-b from-primary/10 to-accent-purple/5 border border-primary/20 rounded-lg flex flex-col items-center p-4 text-center shrink-0 text-xs transition-all duration-300 hover:brightness-105 hover:-translate-y-0.5 shadow-sm shadow-primary/5">
        <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider mb-2">
          PROMOTION
        </span>
        <Award size={20} className="text-accent-purple mb-1.5" />
        <h4 className="text-[13px] font-bold mb-0.5 text-text-main">BigO Premium</h4>
        <p className="text-[11px] text-text-muted mb-3 leading-relaxed">
          Remove all ads instantly & unlock step-by-step debugger simulator and quiz.
        </p>
        <button
          onClick={onUpgrade}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Sparkles size={12} />
          <span>Upgrade Now (₹40)</span>
        </button>
      </div>

      {/* Sponsored Ad 3: AlgoPrep Masterclass */}
      <div className="glass-panel bg-white/2 dark:bg-black/2 border border-dashed border-gray-500/15 rounded-lg flex flex-col items-center justify-center p-4 text-center shrink-0 text-text-dark text-xs transition-all duration-300 hover:bg-white/4 hover:border-primary hover:text-text-muted hover:-translate-y-0.5">
        <span className="bg-gray-500/10 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider mb-2">
          Ad Sponsor
        </span>
        <Terminal size={20} className="text-accent-green mb-1.5" />
        <h4 className="text-[13px] font-bold mb-0.5 text-text-main">DSA Bootcamp</h4>
        <p className="text-[11px] text-text-muted mb-3 leading-relaxed">
          Master Data Structures & Algorithms. 500+ challenge exercises. 50% Off today!
        </p>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="text-secondary text-[11px] font-semibold no-underline flex items-center gap-1 hover:brightness-110"
        >
          <span>Claim Offer</span>
          <ArrowRight size={10} />
        </a>
      </div>
    </aside>
  );
}
