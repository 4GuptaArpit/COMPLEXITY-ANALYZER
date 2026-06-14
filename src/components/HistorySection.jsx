import React, { useState } from "react";
import { Clock, Calendar, Code, Play, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

export default function HistorySection({ history, onLoadHistory, onDeleteHistory, userTier }) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = userTier === "premium" ? 15 : 10;
  
  const totalPages = Math.ceil((history || []).length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedHistory = (history || []).slice(startIndex, startIndex + pageSize);

  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) {
      setCurrentPage(p);
    }
  };

  return (
    <div className="glass-panel p-5 mt-4 flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-border-color pb-3">
        <div className="flex items-center gap-2">
          <Clock className="text-primary animate-pulse" size={20} />
          <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">
            Code Analysis History Logs
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
            {userTier === "premium" ? "Premium (15 logs/page)" : "Free Account (10 logs/page)"}
          </span>
          <span className="text-xs text-text-muted">
            Total Logs: <strong>{history?.length || 0}</strong>
          </span>
        </div>
      </div>

      {paginatedHistory.length === 0 ? (
        <div className="text-center p-8 text-text-dark text-xs flex flex-col items-center gap-2">
          <Clock size={32} className="opacity-20 text-primary" />
          <p>No history entries found. Analyze custom code to populate logs!</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-border-color rounded-lg">
          <table className="w-full border-collapse text-xs text-left">
            <thead>
              <tr className="bg-white/3 dark:bg-black/15 border-b border-border-color text-text-muted font-semibold">
                <th className="p-3">Saved Algorithm / Code</th>
                <th className="p-3">Language</th>
                <th className="p-3 text-center">Time Complexity</th>
                <th className="p-3 text-center">Space Complexity</th>
                <th className="p-3">Analysis Date & Time</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedHistory.map((item, idx) => {
                const globalIdx = startIndex + idx;
                const isOptimal = item.timeComplexity.includes("O(1)") || item.timeComplexity.toLowerCase().includes("log");
                
                return (
                  <tr key={globalIdx} className="hover:bg-white/2 border-b border-border-color transition-colors">
                    <td className="p-3 font-semibold text-text-main max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Code size={13} className="text-primary" />
                        <span>{item.name || "Custom Code"}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] bg-secondary/10 text-secondary border border-secondary/20 px-1.5 py-0.5 rounded font-mono uppercase">
                        {item.language}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        isOptimal ? "bg-accent-green/10 text-accent-green border border-accent-green/20" : "bg-accent-red/10 text-accent-red border border-accent-red/20"
                      }`}>
                        {item.timeComplexity}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                        {item.spaceComplexity}
                      </span>
                    </td>
                    <td className="p-3 text-text-muted font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="opacity-60" />
                        <span>{item.timestamp || "Just Now"}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        className="btn-secondary text-[10px] py-1 px-2.5 mr-1 hover:border-primary/50"
                        onClick={() => onLoadHistory(item)}
                      >
                        <Play size={10} />
                        <span>Reload</span>
                      </button>
                      <button
                        className="bg-transparent border border-transparent hover:border-accent-red/20 hover:bg-accent-red/10 text-text-dark hover:text-accent-red p-1 rounded cursor-pointer transition-all"
                        onClick={() => onDeleteHistory(globalIdx)}
                        title="Delete log entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-2 border-t border-border-color pt-3">
          <button
            className="btn-secondary text-[11px] py-1 disabled:opacity-40"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={14} />
            <span>Prev</span>
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  className={`p-1 px-2.5 rounded text-[11px] font-semibold cursor-pointer border transition-all ${
                    isActive 
                      ? "bg-primary border-primary text-white shadow-sm shadow-primary/30" 
                      : "bg-white/5 border-border-color text-text-muted hover:bg-white/10 hover:text-text-main"
                  }`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            className="btn-secondary text-[11px] py-1 disabled:opacity-40"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <span>Next</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
