import React, { useRef, useEffect } from "react";
import { Play, Sparkles, AlertCircle, Lock } from "lucide-react";
import { mockAlgorithms } from "../mockData";

export default function EditorPanel({
  code,
  setCode,
  selectedLanguage,
  setSelectedLanguage,
  selectedTemplate,
  setSelectedTemplate,
  userTier,
  onAnalyze,
  onSimulate,
  isAnalyzing,
  activeSimLine,
  heatmapData,
  showHeatmap,
  detectedLanguage
}) {
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  const lines = code.split("\n");
  const lineCount = Math.max(lines.length, 1);

  // Sync scroll of textarea and line numbers
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Keep scroll in sync even on mount/resize
  useEffect(() => {
    handleScroll();
  }, [code]);

  // Handle template switch
  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);
    
    if (templateId === "custom") {
      setCode("// Write or paste your custom code here...\n\nfunction myAlgorithm() {\n  // your code\n}");
      setSelectedLanguage("auto");
    } else {
      const algo = mockAlgorithms.find((a) => a.id === templateId);
      if (algo) {
        setCode(algo.code);
        setSelectedLanguage(algo.language);
      }
    }
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    // Rust is locked for premium users
    if (lang === "rust" && userTier !== "premium") {
      alert("Rust support is a Premium feature! Please switch to the Paid (Premium) tier at the top to unlock.");
      return;
    }
    setSelectedLanguage(lang);
  };

  // Calculate top offset for line highlighter (assuming 22px line height, matching index.css)
  const getHighlighterTop = () => {
    if (!activeSimLine) return -100;
    return 16 + (activeSimLine - 1) * 22;
  };

  return (
    <div className="glass-panel flex flex-col min-h-[540px]">
      <div className="border-b border-border-color p-3 px-4 flex justify-between items-center">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles size={18} className="text-primary" />
          <span>Algorithm Sandbox</span>
        </h3>
        
        <div className="flex gap-2 items-center">
          {/* Display detected language badge */}
          {selectedLanguage === "auto" && detectedLanguage && (
            <span className="bg-secondary/15 border border-secondary/25 text-secondary text-[10px] font-semibold px-1.5 py-0.5 rounded animate-pulse">
              Detected: {detectedLanguage === "cpp" ? "C++" : detectedLanguage.toUpperCase()}
            </span>
          )}

          {/* Template Selector */}
          <select
            className="bg-white/5 dark:bg-black/3 border border-border-color text-text-main p-1.5 px-2.5 rounded-lg text-[13px] outline-none cursor-pointer focus:border-primary"
            value={selectedTemplate}
            onChange={handleTemplateChange}
          >
            <option value="custom" className="bg-[#171c26] text-[#f3f4f6]">📝 Custom Code</option>
            {mockAlgorithms.map((algo) => (
              <option key={algo.id} value={algo.id} className="bg-[#171c26] text-[#f3f4f6]">
                ⚡ {algo.name} ({algo.timeComplexity})
              </option>
            ))}
          </select>

          {/* Language Selector */}
          <select
            className="bg-white/5 dark:bg-black/3 border border-border-color text-text-main p-1.5 px-2.5 rounded-lg text-[13px] outline-none cursor-pointer focus:border-primary"
            value={selectedLanguage}
            onChange={handleLanguageChange}
          >
            <option value="auto" className="bg-[#171c26] text-[#f3f4f6]">✨ Auto-Detect</option>
            <option value="javascript" className="bg-[#171c26] text-[#f3f4f6]">JavaScript</option>
            <option value="python" className="bg-[#171c26] text-[#f3f4f6]">Python</option>
            <option value="cpp" className="bg-[#171c26] text-[#f3f4f6]">C++</option>
            <option value="c" className="bg-[#171c26] text-[#f3f4f6]">C</option>
            <option value="java" className="bg-[#171c26] text-[#f3f4f6]">Java</option>
            <option value="rust" className="bg-[#171c26] text-[#f3f4f6]">
              Rust {userTier !== "premium" ? "🔒" : ""}
            </option>
          </select>
        </div>
      </div>

      <div className="relative flex-1 flex bg-black/90 rounded-b-xl font-mono overflow-hidden">
        {/* Line Numbers */}
        <div className="w-10 border-r border-white/5 text-text-dark text-right py-4 px-2 select-none text-[13px] overflow-hidden" ref={lineNumbersRef}>
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} style={{ height: "22px" }}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea Area */}
        <div className="relative flex-1 overflow-hidden">
          {/* Simulator Active Line Highlight */}
          {activeSimLine && (
            <div
              className="line-highlight-overlay"
              style={{ top: `${getHighlighterTop()}px` }}
            />
          )}

          {/* Heatmap Line Highlights */}
          {showHeatmap && heatmapData && (
            Object.entries(heatmapData).map(([lineNum, intensity]) => {
              const num = parseInt(lineNum, 10);
              if (num > lineCount) return null;
              
              let heatmapClass = "";
              if (intensity === "low") heatmapClass = "bg-accent-green/8 border-l border-accent-green";
              else if (intensity === "medium") heatmapClass = "bg-accent-yellow/12 border-l border-accent-yellow";
              else if (intensity === "high") heatmapClass = "bg-accent-red/15 border-l border-accent-red";

              return (
                <div
                  key={lineNum}
                  className={`absolute left-0 right-0 pointer-events-none ${heatmapClass}`}
                  style={{ top: `${16 + (num - 1) * 22}px`, height: "22px" }}
                  title={`Execution intensity: ${intensity}`}
                />
              );
            })
          )}

          <textarea
            ref={textareaRef}
            className="w-full h-full bg-transparent border-none text-gray-200 font-mono text-[14.5px] p-4 resize-none outline-none overflow-y-auto whitespace-pre"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onScroll={handleScroll}
            spellCheck="false"
            style={{
              paddingTop: "16px",
              paddingBottom: "16px",
              lineHeight: "22px",
            }}
          />
        </div>
      </div>

      <div className="border-t border-border-color p-3 px-4 flex justify-between items-center">
        <div className="text-text-muted text-[11px] leading-relaxed m-0">
          {selectedTemplate === "custom" ? (
            <span className="flex items-center gap-1.5 text-accent-yellow">
              <AlertCircle size={14} /> Custom analysis runs on Gemini AI
            </span>
          ) : (
            <span>Running template: <strong>{mockAlgorithms.find(a => a.id === selectedTemplate)?.name}</strong></span>
          )}
        </div>

        <div className="flex gap-2">
          {/* Analyze Complexity (Free) */}
          <button
            className="bg-white/5 dark:bg-black/3 border border-border-color text-text-main px-3 py-2 rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-500/15 transition-all duration-200 disabled:opacity-40"
            onClick={onAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Complexity"}
          </button>

          {/* Step-by-Step Simulator (Paid Gate) */}
          <button
            className="bg-gradient-to-r from-primary to-secondary border-none text-white px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.01] hover:brightness-110 shadow-md shadow-primary/35 disabled:opacity-40"
            onClick={onSimulate}
            disabled={isAnalyzing}
          >
            <Play size={14} />
            <span>Simulate Step-by-Step</span>
            {userTier !== "premium" && <Lock size={12} className="ml-1" />}
          </button>
        </div>
      </div>
    </div>
  );
}
