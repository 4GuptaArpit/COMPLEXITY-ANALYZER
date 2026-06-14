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
    <div className="glass-panel editor-card">
      <div className="card-header">
        <h3 className="card-title">
          <Sparkles size={18} color="var(--primary)" />
          <span>Algorithm Sandbox</span>
        </h3>
        
        <div className="selector-group">
          {/* Display detected language badge */}
          {selectedLanguage === "auto" && detectedLanguage && (
            <span className="detection-badge">
              Detected: {detectedLanguage === "cpp" ? "C++" : detectedLanguage.toUpperCase()}
            </span>
          )}

          {/* Template Selector */}
          <select
            className="select-dropdown"
            value={selectedTemplate}
            onChange={handleTemplateChange}
          >
            <option value="custom">📝 Custom Code</option>
            {mockAlgorithms.map((algo) => (
              <option key={algo.id} value={algo.id}>
                ⚡ {algo.name} ({algo.timeComplexity})
              </option>
            ))}
          </select>

          {/* Language Selector */}
          <select
            className="select-dropdown"
            value={selectedLanguage}
            onChange={handleLanguageChange}
          >
            <option value="auto">✨ Auto-Detect</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="java">Java</option>
            <option value="rust">
              Rust {userTier !== "premium" ? "🔒" : ""}
            </option>
          </select>
        </div>
      </div>

      <div className="editor-body">
        {/* Line Numbers */}
        <div className="line-numbers" ref={lineNumbersRef}>
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} style={{ height: "22px" }}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea Area */}
        <div className="editor-textarea-wrapper">
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
              return (
                <div
                  key={lineNum}
                  className={`line-heatmap-overlay ${intensity}`}
                  style={{ top: `${16 + (num - 1) * 22}px` }}
                  title={`Execution intensity: ${intensity}`}
                />
              );
            })
          )}

          <textarea
            ref={textareaRef}
            className="editor-textarea"
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

      <div className="card-footer">
        <div className="explanation-text" style={{ margin: 0, fontSize: "0.75rem" }}>
          {selectedTemplate === "custom" ? (
            <span className="legend-item" style={{ color: "var(--accent-yellow)" }}>
              <AlertCircle size={14} /> Custom analysis runs on Gemini AI
            </span>
          ) : (
            <span>Running template: <strong>{mockAlgorithms.find(a => a.id === selectedTemplate)?.name}</strong></span>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {/* Analyze Complexity (Free) */}
          <button
            className="btn-secondary"
            onClick={onAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Complexity"}
          </button>

          {/* Step-by-Step Simulator (Paid Gate) */}
          <button
            className="btn-primary"
            onClick={onSimulate}
            disabled={isAnalyzing}
          >
            <Play size={14} />
            <span>Simulate Step-by-Step</span>
            {userTier !== "premium" && <Lock size={12} style={{ marginLeft: "4px" }} />}
          </button>
        </div>
      </div>
    </div>
  );
}
