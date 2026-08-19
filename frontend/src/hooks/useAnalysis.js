import { useState, useEffect, useMemo } from "react";
import { analyzeCodeWithGemini, convertCodeWithGemini, explainCodeWithGemini } from "../geminiService";
import { detectLanguage } from "../utils/langDetector";
import { parseStaticComplexity } from "../utils/staticComplexityParser";
import { useToast } from "../context/ToastContext";
import client from "../api/client";

export function useAnalysis(user, onHistorySaved) {
  const { showToast } = useToast();

  const [code, setCode] = useState(
    `// Write or paste your code here...\nfunction findMax(arr) {\n  let max = arr[0];\n  for (let i = 1; i < arr.length; i++) {\n    if (arr[i] > max) {\n      max = arr[i];\n    }\n  }\n  return max;\n}`
  );

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const [analysisResult, setAnalysisResult] = useState({
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    explanation: "Linear scan through array of size N to find the maximum element.",
    optimizedCode: "",
    optimizationExplanation: "",
    heatmap: { 1: "low", 2: "low", 3: "medium", 4: "high", 5: "medium", 8: "low" },
    simulation: [
      { line: 2, vars: { max: "arr[0]" }, explanation: "Initialize max variable with first element." },
      { line: 3, vars: { i: "1", max: "arr[0]" }, explanation: "Start loop from index 1 to length - 1." },
    ],
    quiz: [],
  });

  const [plainExplanation, setPlainExplanation] = useState(
    "This algorithm iterates through every item in the list once to find the largest value."
  );

  const [convertedCode, setConvertedCode] = useState("");
  const [conversionExplanation, setConversionExplanation] = useState("");

  const detectedLanguage = code ? detectLanguage(code) : "javascript";

  // Real-time, instant heuristic static analysis without API calls
  const staticAnalysis = useMemo(() => {
    return parseStaticComplexity(code, detectedLanguage);
  }, [code, detectedLanguage]);

  useEffect(() => {
    setConvertedCode("");
    setConversionExplanation("");
  }, [code]);

  const saveToHistory = async (result) => {
    if (!user) return;
    const firstLine = code.trim().split("\n")[0];
    const name = firstLine.replace(new RegExp("[/#*|]", "g"), "").trim().substring(0, 28) || "Algorithm Sandbox";

    const payload = {
      name,
      language: detectedLanguage,
      timeComplexity: result.timeComplexity,
      spaceComplexity: result.spaceComplexity,
      code,
      optimizedCode: result.optimizedCode,
      optimizationExplanation: result.optimizationExplanation,
      explanation: result.explanation,
      heatmap: result.heatmap,
      simulation: result.simulation,
      quiz: result.quiz,
    };

    try {
      const { data } = await client.post("/history", payload);
      if (onHistorySaved) {
        onHistorySaved(data);
      }
    } catch (err) {
      console.error("Failed to save history log", err);
    }
  };

  const handleAnalyze = async () => {
    if (!code || !code.trim()) {
      showToast("Please write or paste code to analyze.", "warning");
      return;
    }

    setIsAnalyzing(true);
    const targetLang = detectLanguage(code);

    try {
      const res = await analyzeCodeWithGemini(code, targetLang);
      setAnalysisResult(res);
      await saveToHistory(res);
      showToast("Deep AI Complexity Analysis complete!", "success");

      explainCodeWithGemini(code, targetLang)
        .then((text) => setPlainExplanation(text))
        .catch(() => setPlainExplanation("Code logic summary unavailable."));
    } catch (err) {
      showToast("Analysis error: " + err.message, "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConvert = async (targetLang) => {
    const sourceLang = detectLanguage(code);

    if (sourceLang === targetLang) {
      showToast(`Code is already in ${targetLang.toUpperCase()}. Select another language.`, "warning");
      return;
    }

    setIsConverting(true);
    setConvertedCode("");
    setConversionExplanation("");

    try {
      const res = await convertCodeWithGemini(code, sourceLang, targetLang);
      setConvertedCode(res.convertedCode);
      setConversionExplanation(res.explanation);
      showToast("Code conversion complete!", "success");
    } catch (err) {
      showToast("Conversion failed: " + err.message, "error");
    } finally {
      setIsConverting(false);
    }
  };

  return {
    code,
    setCode,
    detectedLanguage,
    analysisResult,
    setAnalysisResult,
    plainExplanation,
    convertedCode,
    conversionExplanation,
    staticAnalysis,
    isAnalyzing,
    isConverting,
    handleAnalyze,
    handleConvert,
  };
}
