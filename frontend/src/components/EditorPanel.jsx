import { useMemo } from "react";
import { Play, Sparkles } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { rust } from "@codemirror/lang-rust";
import { oneDark } from "@codemirror/theme-one-dark";

export default function EditorPanel({
  code,
  setCode,
  onAnalyze,
  onSimulate,
  isAnalyzing,
  detectedLanguage
}) {
  const activeLang = detectedLanguage || "javascript";

  const extensions = useMemo(() => {
    switch (activeLang) {
      case "python": return [python()];
      case "cpp":
      case "c": return [cpp()];
      case "java": return [java()];
      case "rust": return [rust()];
      case "javascript":
      default: return [javascript()];
    }
  }, [activeLang]);

  return (
    <div className="glass-panel flex flex-col h-[630px]">
      <div className="border-b border-border-color p-3 px-4 flex justify-between items-center">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles size={18} className="text-primary" />
          <span>Algorithm Sandbox</span>
        </h3>
        
        <div className="flex gap-2 items-center">
          {/* Display detected language badge */}
          <span className="bg-secondary/15 border border-secondary/25 text-secondary text-[11px] font-semibold px-2.5 py-1 rounded-md animate-pulse uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span>Language: {activeLang === "cpp" ? "C++" : activeLang}</span>
          </span>
        </div>
      </div>

      {/* CodeMirror Syntax Highlighting Editor */}
      <div className="relative flex-1 bg-[#282c34] rounded-b-xl font-mono overflow-hidden text-left text-[14px]">
        <CodeMirror
          value={code}
          height="520px"
          theme={oneDark}
          extensions={extensions}
          onChange={(value) => setCode(value)}
          placeholder="// Paste or write code here..."
          className="h-full overflow-auto text-left font-mono"
        />
      </div>

      <div className="border-t border-border-color p-3 px-4 flex justify-between items-center">
        <div className="text-text-muted text-[11px] leading-relaxed m-0 flex items-center gap-1.5">
          <Sparkles size={14} className="text-primary animate-pulse" />
          <span>Paste any code snippet — language is auto-detected instantly</span>
        </div>

        <div className="flex gap-2">
          {/* Analyze Complexity */}
          <button
            className="bg-white/5 dark:bg-black/3 border border-border-color text-text-main px-3.5 py-2 rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-500/15 transition-all duration-200 disabled:opacity-40"
            onClick={onAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Complexity"}
          </button>

          {/* Step-by-Step Simulator */}
          <button
            className="bg-gradient-to-r from-primary to-secondary border-none text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.01] hover:brightness-110 shadow-md shadow-primary/35 disabled:opacity-40"
            onClick={onSimulate}
            disabled={isAnalyzing}
          >
            <Play size={14} />
            <span>Simulate Step-by-Step</span>
          </button>
        </div>
      </div>
    </div>
  );
}
