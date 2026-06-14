import React from "react";
import { Zap, Clock, Bookmark } from "lucide-react";

export default function AdSidebar({ history, onLoadHistory, userTier }) {
  return (
    <aside className="flex flex-col gap-4 sticky top-4 h-[calc(100vh-32px)] overflow-y-auto pr-0.5 max-md:hidden">
      {/* Sponsored Ad Unit */}
      <div className="glass-panel bg-white/2 dark:bg-black/2 border border-dashed border-gray-500/15 rounded-lg flex flex-col items-center justify-center p-3 text-center shrink-0 text-text-dark text-xs transition-all duration-300 hover:bg-white/4 hover:border-primary hover:text-text-muted">
        <span className="bg-gray-500/10 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider mb-2">
          Sponsored
        </span>
        <Zap size={20} className="text-accent-yellow mb-1.5" />
        <h4 className="text-[13px] font-semibold mb-0.5 text-text-main">HostVibe SSD</h4>
        <p className="text-[11px] text-text-muted mb-1.5">
          SSD Cloud hosting from ₹240/mo. Fast & secure.
        </p>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="text-primary text-[11px] font-semibold no-underline"
        >
          Buy Now →
        </a>
      </div>

      {/* Code History Box */}
      <div className="glass-panel flex flex-col gap-2 p-3 flex-1 min-h-[180px] overflow-y-auto">
        <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5 border-b border-border-color pb-2">
          <Clock size={12} />
          <span>Code History</span>
        </h4>
        
        {userTier === "anonymous" ? (
          <div className="text-text-dark text-[11px] text-center my-auto p-4 flex flex-col items-center justify-center">
            <Bookmark size={20} className="opacity-30 mb-1.5" />
            <p>Log in to save and reload your code history</p>
          </div>
        ) : history && history.length > 0 ? (
          <div className="flex flex-col gap-1.5 mt-1">
            {history.map((item, idx) => (
              <button
                key={idx}
                className="bg-white/3 dark:bg-black/2 border border-border-color rounded-md p-2 cursor-pointer text-left transition-all duration-200 hover:border-primary hover:bg-primary/5 w-full"
                onClick={() => onLoadHistory(item)}
              >
                <div className="text-xs font-semibold text-text-main overflow-hidden text-ellipsis whitespace-nowrap">
                  {item.name || "Custom Analysis"}
                </div>
                <div className="flex justify-between text-[10px] text-text-dark mt-1">
                  <span className="text-primary font-semibold">{item.timeComplexity}</span>
                  <span>{item.language}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-text-dark text-[11px] text-center my-auto p-4">
            <p>No analyzed history yet. Write code and click "Analyze Complexity"!</p>
          </div>
        )}
      </div>
    </aside>
  );
}
