import React, { useState } from "react";
import { Languages, Copy, Check, Lock, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

export default function ConverterPanel({
  userTier,
  originalCode,
  convertedCode,
  explanation,
  isConverting,
  onConvert,
  onSignUp
}) {
  const [targetLanguage, setTargetLanguage] = useState("python");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (convertedCode) {
      navigator.clipboard.writeText(convertedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConvertClick = () => {
    if (!originalCode || !originalCode.trim()) {
      alert("Please enter some code in the Sandbox editor first!");
      return;
    }
    onConvert(targetLanguage);
  };



  return (
    <div className="flex flex-col mt-2.5 gap-4 flex-1">
      {/* Configuration Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-white/3 border border-border-color rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Languages size={16} className="text-primary animate-pulse" />
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Target Language:
          </span>
          <select
            className="bg-white/5 dark:bg-black/3 border border-border-color text-text-main p-1 px-2.5 rounded-md text-[13px] outline-none cursor-pointer focus:border-primary"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            disabled={isConverting}
          >
            <option value="javascript" className="bg-[#171c26] text-[#f3f4f6]">JavaScript</option>
            <option value="python" className="bg-[#171c26] text-[#f3f4f6]">Python</option>
            <option value="cpp" className="bg-[#171c26] text-[#f3f4f6]">C++</option>
            <option value="java" className="bg-[#171c26] text-[#f3f4f6]">Java</option>
            <option value="rust" className="bg-[#171c26] text-[#f3f4f6]">Rust</option>
          </select>
        </div>

        <button
          className="btn-primary py-1.5 px-4 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40"
          onClick={handleConvertClick}
          disabled={isConverting}
        >
          {isConverting ? (
            <>
              <RefreshCw size={13} className="animate-spin" />
              <span>Translating...</span>
            </>
          ) : (
            <>
              <Languages size={13} />
              <span>Convert Code</span>
            </>
          )}
        </button>
      </div>

      {isConverting ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 gap-3 min-h-[300px]">
          <div className="spinner"></div>
          <span className="text-xs text-text-muted animate-pulse">
            AI is mapping and converting code syntax...
          </span>
        </div>
      ) : convertedCode ? (
        <div className="flex flex-col gap-4 flex-1">
          {/* Converted Output Box */}
          <div className="flex flex-col flex-1">
            <div className="flex justify-between items-center bg-[#0d1117]/5 dark:bg-black/20 border-b border-border-color p-2 px-3 rounded-t-lg bg-white/2">
              <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
                {targetLanguage} Translated Code
              </span>
              <button
                className="bg-transparent border-none text-text-muted hover:text-text-main flex items-center gap-1 text-[11px] cursor-pointer"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-accent-green" />
                    <span className="text-accent-green font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Translated code view */}
            <div className="bg-[#0b0e14] border-x border-b border-border-color rounded-b-lg p-3.5 max-h-[300px] overflow-y-auto font-mono text-[12.5px] leading-relaxed text-gray-200 whitespace-pre">
              <code>{convertedCode}</code>
            </div>
          </div>

          {/* Explanation Notes */}
          <div className="flex flex-col gap-2">
            <h4 className="text-[12.5px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} className="text-primary" /> Key Translation Notes
            </h4>
            <div className="text-text-muted text-[13.5px] leading-relaxed bg-white/2 border border-border-color rounded-lg p-3 whitespace-pre-wrap">
              {explanation}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[300px] bg-white/1 border border-dashed border-border-color rounded-xl">
          <Languages size={32} className="text-primary/20 mb-2" />
          <h4 className="text-xs font-semibold text-text-main mb-1">Ready for Translation</h4>
          <p className="text-[11px] text-text-muted max-w-[280px] leading-relaxed">
            Select your target programming language above and click "Convert Code" to view the translation.
          </p>
        </div>
      )}
    </div>
  );
}
