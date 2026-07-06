import { useState, useEffect } from "react";
import { BarChart2, Zap, Play, Coins, User, Database, Languages } from "lucide-react";
import Header from "./components/Header";
import EditorPanel from "./components/EditorPanel";
import ChartViewer from "./components/ChartViewer";
import OptimizerPanel from "./components/OptimizerPanel";
import SimulatorPanel from "./components/SimulatorPanel";
import ConverterPanel from "./components/ConverterPanel";
import FeatureComparison from "./components/FeatureComparison";
import Footer from "./components/Footer";
import { mockAlgorithms } from "./mockData";
import { mockTranslations } from "./mockConverterData";
import {
  mergeSortMockAnalysis,
  binarySearchRecursiveMockAnalysis,
  fibonacciMemoizedMockAnalysis,
  twoSumOptimizedMockAnalysis
} from "./mockCustomData";
import { hasApiKey, analyzeCodeWithGemini, convertCodeWithGemini } from "./geminiService";
import { parseMarkdown } from "./utils/markdownParser";
import { detectLanguage } from "./utils/langDetector";
import { useToast } from "./context/ToastContext";
import { useAuth } from "./context/AuthContext";
import client from "./api/client";

export default function App() {
  const { showToast } = useToast();
  const {
    user,
    token,
    sendOtp,
    verifyOtp,
    socialLogin,
    logout,
    changePassword,
    purchase,
    handleDemoSetTier: demoSetTier,
    deductSimToken
  } = useAuth();

  const userTier = user ? user.tier : "anonymous";
  const tokens = user ? user.tokens : 0;
  const userContact = user ? user.contact : null;

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("BIGO_THEME") || "dark";
  });

  const [usersDb, setUsersDb] = useState([]);
  const [history, setHistory] = useState([]);

  const defaultAlgo = mockAlgorithms.find((a) => a.id === "bubble_sort") || {};

  const [selectedTemplate, setSelectedTemplate] = useState("bubble_sort");
  const [selectedLanguage, setSelectedLanguage] = useState(defaultAlgo.language || "auto");
  const [code, setCode] = useState(defaultAlgo.code || "");
  const [activeTab, setActiveTab] = useState("complexity");
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutOption, setCheckoutOption] = useState("subscription");

  const [showLogin, setShowLogin] = useState(false);
  const [loginStep, setLoginStep] = useState("input");
  const [contactInput, setContactInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const [analysisResult, setAnalysisResult] = useState({
    timeComplexity: defaultAlgo.timeComplexity || "O(N²)",
    spaceComplexity: defaultAlgo.spaceComplexity || "O(1)",
    explanation: defaultAlgo.explanation || "",
    optimizedCode: defaultAlgo.optimizedCode || "",
    optimizationExplanation: defaultAlgo.optimizationExplanation || "",
    heatmap: defaultAlgo.heatmap || {},
    simulation: defaultAlgo.simulation || [],
    quiz: defaultAlgo.quiz || []
  });

  const [convertedCode, setConvertedCode] = useState("");
  const [conversionExplanation, setConversionExplanation] = useState("");
  const [isConverting, setIsConverting] = useState(false);

  const [adminTab, setAdminTab] = useState("users");
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    setConvertedCode("");
    setConversionExplanation("");
  }, [code, selectedLanguage, selectedTemplate]);

  // Load history from API backend when user context becomes available
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user || user.tier === "anonymous") {
        setHistory([]);
        return;
      }
      try {
        const { data } = await client.get("/history");
        setHistory(data);
      } catch (err) {
        console.error("Failed to fetch history logs", err);
      }
    };
    fetchHistory();
  }, [user]);

  // Load admin dashboard statistics and tables when opened
  useEffect(() => {
    const fetchAdminData = async () => {
      if (!isAdminOpen || !user?.isAdmin) return;
      try {
        const usersRes = await client.get("/users");
        setUsersDb(usersRes.data);
        
        const fbRes = await client.get("/feedback");
        setFeedbacks(fbRes.data);
      } catch (err) {
        console.error("Failed to load admin dashboard data", err);
      }
    };
    fetchAdminData();
  }, [isAdminOpen, user]);

  // Derived state calculations
  const detectedLanguage = (selectedLanguage === "auto" && code)
    ? detectLanguage(code)
    : selectedLanguage;

  const activeSimLine = (activeTab === "simulator" && analysisResult?.simulation?.length > 0)
    ? (analysisResult.simulation[activeStepIndex]?.line || null)
    : null;

  const refreshFeedback = async () => {
    if (!user?.isAdmin) return;
    try {
      const { data } = await client.get("/feedback");
      setFeedbacks(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminDeleteFeedback = async (id) => {
    try {
      await client.delete(`/feedback/${id}`);
      setFeedbacks((prev) => prev.filter((f) => f._id !== id));
      showToast("Feedback deleted successfully", "success");
    } catch (err) {
      showToast("Failed to delete feedback", "error");
    }
  };

  useEffect(() => {
    document.body.className = theme === "light" ? "light-theme" : "";
    localStorage.setItem("BIGO_THEME", theme);
  }, [theme]);


  const loadMockCustomAnalysis = () => {
    // 1. Check if the pasted code matches any optimized or standard algorithm signature
    let matchedAlgo = null;

    if (code.includes("mergeSort") || code.includes("function merge(")) {
      matchedAlgo = mergeSortMockAnalysis;
    } else if (code.includes("binarySearchRecursive")) {
      matchedAlgo = binarySearchRecursiveMockAnalysis;
    } else if (code.includes("fibonacciMemoized") || code.includes("n in memo")) {
      matchedAlgo = fibonacciMemoizedMockAnalysis;
    } else if (code.includes("twoSumOptimized") || (code.includes("new Map()") && code.includes("complement"))) {
      matchedAlgo = twoSumOptimizedMockAnalysis;
    } else if (code.includes("bubbleSort")) {
      matchedAlgo = mockAlgorithms.find(a => a.id === "bubble_sort");
    } else if (code.includes("binarySearch")) {
      matchedAlgo = mockAlgorithms.find(a => a.id === "binary_search");
    } else if (code.includes("fibonacci")) {
      matchedAlgo = mockAlgorithms.find(a => a.id === "recursive_fibonacci");
    } else if (code.includes("twoSum")) {
      matchedAlgo = mockAlgorithms.find(a => a.id === "two_sum");
    }

    if (matchedAlgo) {
      setAnalysisResult({
        timeComplexity: matchedAlgo.timeComplexity,
        spaceComplexity: matchedAlgo.spaceComplexity,
        explanation: matchedAlgo.explanation,
        optimizedCode: matchedAlgo.optimizedCode,
        optimizationExplanation: matchedAlgo.optimizationExplanation,
        heatmap: matchedAlgo.heatmap,
        simulation: matchedAlgo.simulation,
        quiz: matchedAlgo.quiz
      });
      setActiveStepIndex(0);
      if (userContact && userTier !== "anonymous") {
        addToHistory(matchedAlgo.timeComplexity, matchedAlgo.spaceComplexity, matchedAlgo);
      }
      return;
    }
    // 2. Default regex-based offline analyzer for arbitrary custom code
    const codeLower = code.toLowerCase();
    const lines = code.split("\n");
    const lineCount = lines.length;

    // ── Time Complexity Detection ────────────────────────────────────────
    let time = "O(1)";
    let timeExplanationLines = [];
    let heatmap = {};

    const hasFor = codeLower.includes("for");
    const hasWhile = codeLower.includes("while");
    const hasLoop = hasFor || hasWhile;
    const forCount = (codeLower.match(/\bfor\b/g) || []).length;
    const whileCount = (codeLower.match(/\bwhile\b/g) || []).length;
    const totalLoops = forCount + whileCount;

    // Binary search patterns: mid, left/right/lo/hi halving
    const hasBinarySearchPattern = (
      (codeLower.includes("mid") && (codeLower.includes("left") || codeLower.includes("lo")) && (codeLower.includes("right") || codeLower.includes("hi"))) ||
      codeLower.includes("math.log") || codeLower.includes(">> 1")
    );

    // Sorting detection
    const hasSortCall = /\.sort\s*\(|arrays\.sort|collections\.sort|std::sort|\.sorted\(/.test(codeLower);

    // Recursion detection
    const functionNames = [...code.matchAll(/(?:function|def|fn|void|int|string|bool)\s+(\w+)\s*\(/gi)].map(m => m[1]);
    const hasRecursion = functionNames.some(name => {
      const regex = new RegExp(`\\b${name}\\s*\\(`, "g");
      return (code.match(regex) || []).length > 1;
    });
    const hasMemo = codeLower.includes("memo") || codeLower.includes("dp[") || codeLower.includes("cache");

    if (hasBinarySearchPattern && hasLoop && !hasSortCall) {
      time = "O(log N)";
      timeExplanationLines = [
        "Detected a binary search pattern: the search space is **halved on each iteration** using `mid`, `left`/`right` (or `lo`/`hi`) pointers.",
        "- **Operations:** At each step the range `[left, right]` is cut in half.",
        "- **Result:** At most log₂(N) iterations are needed, giving **O(log N)** time."
      ];
    } else if (hasSortCall && totalLoops <= 1) {
      time = "O(N log N)";
      timeExplanationLines = [
        "Detected a built-in sort call (e.g. `Arrays.sort`, `.sort()`, `std::sort`). Most library sort implementations use Timsort or Introsort.",
        "- **Operations:** Sorting N elements takes N·log₂(N) comparisons.",
        "- **Result:** Dominant operation is the sort → **O(N log N)**."
      ];
    } else if (hasRecursion && !hasMemo) {
      time = "O(2^N)";
      timeExplanationLines = [
        "Detected multiple recursive calls without memoization. Each call branches into two (or more) sub-calls, creating an exponential call tree.",
        "- **Operations:** The number of sub-problems doubles at each level → O(2^N).",
        "- **Stack Space:** Recursion depth can reach N levels."
      ];
    } else if (hasRecursion && hasMemo) {
      time = "O(N)";
      timeExplanationLines = [
        "Detected recursion **with memoization/DP table**. Each unique sub-problem is solved only once and cached, converting exponential recursion to linear.",
        "- **Operations:** Each of the N unique sub-problems is solved exactly once → O(N).",
        "- **Space:** The cache/DP table itself uses O(N) auxiliary space."
      ];
    } else if (totalLoops >= 2 && hasLoop) {
      // Detect if loops are nested
      const isNested = /for\s*\([^)]*\)[^{]*\{[^}]*for\s*\(|while\s*\([^)]*\)[^{]*\{[^}]*for\s*\(/s.test(code) ||
        (code.indexOf("for", code.indexOf("for") + 3) !== -1 && code.indexOf("for", code.indexOf("for") + 3) < code.indexOf("}", code.indexOf("for")));
      if (isNested || totalLoops >= 3) {
        time = "O(N²)";
        timeExplanationLines = [
          "Detected **nested loops** in your algorithm. The outer loop runs N times; for each outer iteration, the inner loop also runs up to N times.",
          "- **Operations:** N × N = N² total iterations.",
          "- **Bottleneck:** Becomes very slow for inputs above N = 10,000."
        ];
      } else {
        time = "O(N)";
        timeExplanationLines = [
          "Detected multiple sequential (non-nested) loops. Each loop processes the N-element input once.",
          "- **Operations:** 2N or 3N operations → still **O(N)** (constants are dropped in Big-O).",
          "- **Scaling:** Execution time grows linearly with input size."
        ];
      }
    } else if (hasLoop) {
      time = "O(N)";
      timeExplanationLines = [
        "Detected a single loop that iterates over the input elements.",
        "- **Operations:** Scales linearly — N iterations for N elements.",
        "- **Scaling:** Doubling the input size roughly doubles the execution time."
      ];
    } else {
      time = "O(1)";
      timeExplanationLines = [
        "No loops or recursion detected. The algorithm executes a fixed number of operations regardless of input size.",
        "- **Operations:** Constant — does not grow with N.",
        "- **Scaling:** Input size has zero impact on performance."
      ];
    }

    // ── Space Complexity Detection ───────────────────────────────────────
    let space = "O(1)";
    let spaceNote = "";

    const has2DArray = /\[\s*\]\s*\[\s*\]|int\s*\[\s*\]\s*\[\s*\]|new\s+int\s*\[\w+\]\s*\[\w+\]|dp\s*=\s*\[\s*\[/.test(code);
    const hasHashMap = /new\s+HashMap|new\s+Map\s*\(|new\s+HashSet|new\s+Set\s*\(|new\s+LinkedList|new\s+ArrayList|new\s+PriorityQueue|new\s+TreeMap|\{\s*\}/.test(code) &&
      !/(=\s*\{\s*\}$|=\s*\{\s*\}\s*;$)/.test(code);
    const hasNewArray = /new\s+int\s*\[|new\s+char\s*\[|new\s+double\s*\[|new\s+String\s*\[|new\s+Array\s*\(|new\s+boolean\s*\[|\[\s*\.\.\.|result\s*=\s*\[\]|output\s*=\s*\[\]/.test(code);
    const hasResultList = /result|output|ans(?:wer)?|ret(?:urn)?\s*=\s*\[|List<|ArrayList<|vector</.test(codeLower);

    if (has2DArray) {
      space = "O(N²)";
      spaceNote = "Detected a **2D array** (matrix). Storing an N×N matrix requires N² cells of memory.";
    } else if (hasHashMap || hasNewArray || hasResultList || (hasRecursion && hasMemo)) {
      space = "O(N)";
      if (hasHashMap) spaceNote = "Detected **hash map / set / list** allocation that grows with input size N.";
      else if (hasNewArray) spaceNote = "Detected an **array allocation** proportional to input size N.";
      else if (hasRecursion && hasMemo) spaceNote = "The **memoization table** stores results for all N unique sub-problems.";
      else spaceNote = "Detected a **result collection** (list/array/vector) that can grow up to size N.";
    } else if (hasRecursion && !hasMemo) {
      space = "O(N)";
      spaceNote = "Recursive calls consume **O(N) stack space** (call stack depth proportional to input size N).";
    }

    // ── Build Explanation ────────────────────────────────────────────────
    const explanation = [
      `### Time Complexity: ${time}`,
      ...timeExplanationLines,
      "",
      `### Space Complexity: ${space}`,
      spaceNote || (space === "O(1)" ? "No additional memory structures detected. The algorithm uses only a constant amount of auxiliary space." : ""),
    ].join("\n");

    // ── Build Heatmap ────────────────────────────────────────────────────
    lines.forEach((ln, i) => {
      const l = ln.toLowerCase().trim();
      if (l.includes("for") || l.includes("while")) heatmap[i + 1] = "high";
      else if (l.includes("if") || l.includes("return") || l.includes("map.put") || l.includes("map.get") || l.includes(".add(")) heatmap[i + 1] = "medium";
      else if (l.length > 2) heatmap[i + 1] = "low";
    });

    // ── Build Optimized Code Suggestion ─────────────────────────────────
    let optCode = code;
    let optExpl = "Your code appears to be running at a reasonable complexity for its structure. No automatic optimization was detected by the offline analyzer.";

    if (time === "O(N²)") {
      optCode = `// Optimization Suggestion: Replace nested loops with a Hash Map\n// Original time: O(N²) → Optimized: O(N)\n\n// Example pattern:\nconst seen = new Map();\nfor (const item of input) {\n  const complement = target - item;\n  if (seen.has(complement)) return [seen.get(complement), item];\n  seen.set(item, index);\n}`;
      optExpl = "Nested loops (O(N²)) can often be replaced with a **Hash Map** for O(1) lookups. This brings total time down from O(N²) to O(N) — a dramatic improvement for large inputs.";
    } else if (time === "O(2^N)") {
      optCode = `// Optimization Suggestion: Add memoization to remove redundant calls\n// Original time: O(2^N) → Optimized: O(N)\n\nconst memo = new Map();\nfunction solve(n) {\n  if (memo.has(n)) return memo.get(n);\n  // ... recursive logic ...\n  const result = solve(n - 1) + solve(n - 2);\n  memo.set(n, result);\n  return result;\n}`;
      optExpl = "Exponential recursion (O(2^N)) can be optimized to O(N) by **memoizing** previously computed results. Each unique sub-problem is solved exactly once instead of recomputed exponentially.";
    }

    // ── Build Simulation ─────────────────────────────────────────────────
    const simulation = [];
    const firstLoopLine = lines.findIndex(l => /\bfor\b|\bwhile\b/.test(l)) + 1;

    simulation.push({
      line: 1,
      vars: { step: "init", n: "input.length" },
      explanation: "Program starts. Variables and data structures are initialized."
    });
    if (firstLoopLine > 1) {
      simulation.push({
        line: Math.max(firstLoopLine - 1, 1),
        vars: { status: "setup" },
        explanation: "Declarations and setup before the main loop."
      });
    }
    if (firstLoopLine > 0) {
      simulation.push({
        line: firstLoopLine,
        vars: { i: "0", status: "loop_start" },
        explanation: "Loop begins. Iterator starts at 0 and will run until the end of the input."
      });
      simulation.push({
        line: firstLoopLine + 1,
        vars: { i: "1", status: "iterating" },
        explanation: "Processing element at index i=1. Core logic executes."
      });
      simulation.push({
        line: firstLoopLine + 1,
        vars: { i: "2", status: "iterating" },
        explanation: "Next iteration. i=2. The pattern repeats N times total."
      });
    }
    simulation.push({
      line: lineCount,
      vars: { status: "done", result: "computed" },
      explanation: "Loop/recursion completes. Result is returned or stored."
    });

    const mockResult = {
      timeComplexity: time,
      spaceComplexity: space,
      explanation,
      optimizedCode: optCode,
      optimizationExplanation: optExpl,
      heatmap,
      simulation,
      quiz: [
        {
          stepIndex: 2,
          question: `This algorithm has ${time} time complexity. What does N represent?`,
          options: ["The size of the input (e.g. array length)", "The number of CPU cores", "The memory in megabytes", "The number of functions defined"],
          answer: "The size of the input (e.g. array length)"
        },
        {
          stepIndex: 3,
          question: `The space complexity is ${space}. Why?`,
          options: [
            space === "O(1)" ? "No extra memory structures are allocated" : spaceNote.replace(/\*\*/g, "").slice(0, 60),
            "Because the code has many comments",
            "Because the input is always sorted",
            "Because of the return statement"
          ],
          answer: space === "O(1)" ? "No extra memory structures are allocated" : spaceNote.replace(/\*\*/g, "").slice(0, 60)
        }
      ]
    };


    setAnalysisResult(mockResult);
    setActiveStepIndex(0);
    
    if (userContact && userTier !== "anonymous") {
      addToHistory(time, space, mockResult);
    }
  };

  const addToHistory = async (timeComp, spaceComp, result, tokensUsed = 0) => {
    let name;
    if (selectedTemplate !== "custom") {
      name = mockAlgorithms.find((a) => a.id === selectedTemplate)?.name || "Template";
    } else {
      const firstLine = code.trim().split("\n")[0];
      name = firstLine.replace(new RegExp("[/#*|]", "g"), "").trim().substring(0, 20) || "Custom Code";
    }

    const payload = {
      name,
      language: selectedLanguage === "auto" ? detectedLanguage : selectedLanguage,
      timeComplexity: timeComp,
      spaceComplexity: spaceComp,
      code,
      optimizedCode: result.optimizedCode,
      optimizationExplanation: result.optimizationExplanation,
      explanation: result.explanation,
      heatmap: result.heatmap,
      simulation: result.simulation,
      quiz: result.quiz,
      tokensUsed
    };

    try {
      const { data } = await client.post("/history", payload);
      const maxLogs = userTier === "premium" ? 30 : 20;
      setHistory((prev) => [data, ...prev.slice(0, maxLogs - 1)]);
    } catch (err) {
      console.error("Failed to save history log", err);
    }
  };

  const handleAnalyze = async () => {
    if (selectedTemplate !== "custom") {
      const algo = mockAlgorithms.find((a) => a.id === selectedTemplate);
      if (algo) {
        setAnalysisResult({
          timeComplexity: algo.timeComplexity,
          spaceComplexity: algo.spaceComplexity,
          explanation: algo.explanation,
          optimizedCode: algo.optimizedCode,
          optimizationExplanation: algo.optimizationExplanation,
          heatmap: algo.heatmap,
          simulation: algo.simulation,
          quiz: algo.quiz
        });
        setActiveStepIndex(0);
        
        if (userContact && userTier !== "anonymous") {
          addToHistory(algo.timeComplexity, algo.spaceComplexity, algo);
        }
      }
      return;
    }

    setIsAnalyzing(true);
    
    const targetLang = selectedLanguage === "auto" ? detectedLanguage : selectedLanguage;

    if (hasApiKey()) {
      try {
        const res = await analyzeCodeWithGemini(code, targetLang);
        setAnalysisResult(res);
        setActiveStepIndex(0);
        
        if (userContact && userTier !== "anonymous") {
          addToHistory(res.timeComplexity, res.spaceComplexity, res);
        }
        showToast("Gemini AI Analysis complete!", "success");
      } catch (err) {
        showToast("Failed to analyze with Gemini: " + err.message + "\n\nGenerating mock local analysis instead.", "warning");
        loadMockCustomAnalysis();
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      setTimeout(() => {
        loadMockCustomAnalysis();
        setIsAnalyzing(false);
      }, 1200);
    }
  };

  const handleConvert = async (targetLang) => {
    const sourceLang = selectedLanguage === "auto" ? detectedLanguage : selectedLanguage;
    
    if (sourceLang === targetLang) {
      showToast(`The code is already in ${targetLang.toUpperCase()}! Please select a different target language.`, "warning");
      return;
    }

    setIsConverting(true);
    setConvertedCode("");
    setConversionExplanation("");

    if (hasApiKey()) {
      try {
        const res = await convertCodeWithGemini(code, sourceLang, targetLang);
        setConvertedCode(res.convertedCode);
        setConversionExplanation(res.explanation);
      } catch (err) {
        showToast("Failed to convert with Gemini: " + err.message + "\n\nUsing mock local converter fallback.", "warning");
        loadMockTranslation(sourceLang, targetLang);
      } finally {
        setIsConverting(false);
      }
    } else {
      setTimeout(() => {
        loadMockTranslation(sourceLang, targetLang);
        setIsConverting(false);
      }, 1200);
    }
  };

  const translateCodeBasic = (sourceCode, src, dest) => {
    let lines = sourceCode.split("\n");
    let translatedLines = [];
    let explanation = `Translated code from ${src.toUpperCase()} to ${dest.toUpperCase()} using BigO.ai's offline rule-based converter. (Connect a Gemini API Key in Settings for full semantic, AI-powered translation).`;

    for (let line of lines) {
      let tLine = line;

      // ── Translate Loops ──────────────────────────────────────────────────
      if (dest === "python") {
        tLine = tLine.replace(/for\s*\(\s*(?:let|int|var)\s+(\w+)\s*=\s*0\s*;\s*\1\s*<\s*([^;]+)\s*;\s*\1\s*\+\+\s*\)\s*\{?/, "for $1 in range($2):");
        tLine = tLine.replace(/for\s*\(\s*(?:let|int|var)\s+(\w+)\s*=\s*([^;]+)\s*;\s*\1\s*<\s*([^;]+)\s*;\s*\1\s*\+\+\s*\)\s*\{?/, "for $1 in range($2, $3):");
      } else if (dest === "rust") {
        tLine = tLine.replace(/for\s*\(\s*(?:let|int|var)\s+(\w+)\s*=\s*0\s*;\s*\1\s*<\s*([^;]+)\s*;\s*\1\s*\+\+\s*\)\s*\{?/, "for $1 in 0..$2 {");
        tLine = tLine.replace(/for\s*\(\s*(?:let|int|var)\s+(\w+)\s*=\s*([^;]+)\s*;\s*\1\s*<\s*([^;]+)\s*;\s*\1\s*\+\+\s*\)\s*\{?/, "for $1 in $2..$3 {");
      } else if (dest === "javascript" || dest === "java" || dest === "cpp") {
        const type = dest === "javascript" ? "let" : "int";
        tLine = tLine.replace(/for\s+(\w+)\s+in\s+range\s*\(\s*([^,)]+)\s*\)\s*:/, `for (${type} $1 = 0; $1 < $2; $1++) {`);
        tLine = tLine.replace(/for\s+(\w+)\s+in\s+range\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)\s*:/, `for (${type} $1 = $2; $1 < $3; $1++) {`);
      }

      // ── Translate Prints ─────────────────────────────────────────────────
      if (dest === "python") {
        tLine = tLine.replace(/console\.log\s*\(([^)]+)\)/, "print($1)");
        tLine = tLine.replace(/System\.out\.println\s*\(([^)]+)\)/, "print($1)");
        tLine = tLine.replace(/std::cout\s*<<\s*([^<]+)\s*<<\s*std::endl;?/, "print($1)");
        tLine = tLine.replace(/println!\s*\(([^)]+)\)/, "print($1)");
      } else if (dest === "javascript") {
        tLine = tLine.replace(/print\s*\(([^)]+)\)/, "console.log($1)");
        tLine = tLine.replace(/System\.out\.println\s*\(([^)]+)\)/, "console.log($1)");
        tLine = tLine.replace(/std::cout\s*<<\s*([^<]+)\s*<<\s*std::endl;?/, "console.log($1)");
        tLine = tLine.replace(/println!\s*\(([^)]+)\)/, "console.log($1)");
      } else if (dest === "java") {
        tLine = tLine.replace(/console\.log\s*\(([^)]+)\)/, "System.out.println($1)");
        tLine = tLine.replace(/print\s*\(([^)]+)\)/, "System.out.println($1)");
        tLine = tLine.replace(/std::cout\s*<<\s*([^<]+)\s*<<\s*std::endl;?/, "System.out.println($1)");
        tLine = tLine.replace(/println!\s*\(([^)]+)\)/, "System.out.println($1)");
      } else if (dest === "cpp") {
        tLine = tLine.replace(/console\.log\s*\(([^)]+)\)/, "std::cout << $1 << std::endl;");
        tLine = tLine.replace(/print\s*\(([^)]+)\)/, "std::cout << $1 << std::endl;");
        tLine = tLine.replace(/System\.out\.println\s*\(([^)]+)\)/, "std::cout << $1 << std::endl;");
        tLine = tLine.replace(/println!\s*\(([^)]+)\)/, "std::cout << $1 << std::endl;");
      } else if (dest === "rust") {
        tLine = tLine.replace(/console\.log\s*\(([^)]+)\)/, "println!($1)");
        tLine = tLine.replace(/print\s*\(([^)]+)\)/, "println!($1)");
        tLine = tLine.replace(/System\.out\.println\s*\(([^)]+)\)/, "println!($1)");
        tLine = tLine.replace(/std::cout\s*<<\s*([^<]+)\s*<<\s*std::endl;?/, "println!($1)");
      }

      // ── Translate Variables/Constants ───────────────────────────────────
      if (dest === "python") {
        tLine = tLine.replace(/(?:let|const|var|int|double|float|String|boolean)\s+(\w+)\s*=\s*([^;]+);?/, "$1 = $2");
      } else if (dest === "rust") {
        tLine = tLine.replace(/(?:let|const|var|int|double|float|String|boolean)\s+(\w+)\s*=\s*([^;]+);?/, "let mut $1 = $2;");
      } else if (dest === "javascript") {
        tLine = tLine.replace(/(?:int|double|float|String|boolean)\s+(\w+)\s*=\s*([^;]+);?/, "let $1 = $2;");
      } else if (dest === "java" || dest === "cpp") {
        tLine = tLine.replace(/(?:let|const|var)\s+(\w+)\s*=\s*(\d+);?/, "int $1 = $2;");
        tLine = tLine.replace(/(?:let|const|var)\s+(\w+)\s*=\s*["']([^"']*)["'];?/, "String $1 = \"$2\";");
      }

      // ── Translate Functions ──────────────────────────────────────────────
      if (dest === "python") {
        tLine = tLine.replace(/function\s+(\w+)\s*\(([^)]*)\)\s*\{?/, "def $1($2):");
        tLine = tLine.replace(/const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*\{?/, "def $1($2):");
        tLine = tLine.replace(/public\s+(?:static\s+)?(?:\w+)\s+(\w+)\s*\(([^)]*)\)\s*\{?/, "def $1($2):");
        tLine = tLine.replace(/fn\s+(\w+)\s*\(([^)]*)\)\s*(?:->\s*\w+)?\s*\{?/, "def $1($2):");
      } else if (dest === "rust") {
        tLine = tLine.replace(/function\s+(\w+)\s*\(([^)]*)\)\s*\{?/, "fn $1($2) {");
        tLine = tLine.replace(/def\s+(\w+)\s*\(([^)]*)\)\s*:/, "fn $1($2) {");
      } else if (dest === "javascript") {
        tLine = tLine.replace(/def\s+(\w+)\s*\(([^)]*)\)\s*:/, "function $1($2) {");
        tLine = tLine.replace(/fn\s+(\w+)\s*\(([^)]*)\)\s*(?:->\s*\w+)?\s*\{?/, "function $1($2) {");
      } else if (dest === "java" || dest === "cpp") {
        tLine = tLine.replace(/def\s+(\w+)\s*\(([^)]*)\)\s*:/, "void $1($2) {");
        tLine = tLine.replace(/function\s+(\w+)\s*\(([^)]*)\)\s*\{?/, "void $1($2) {");
        tLine = tLine.replace(/fn\s+(\w+)\s*\(([^)]*)\)\s*(?:->\s*\w+)?\s*\{?/, "void $1($2) {");
      }

      if (dest === "python") {
        tLine = tLine.replace(/\}\s*$/, "");
      }

      translatedLines.push(tLine);
    }

    let codeStr = translatedLines.join("\n");
    if (dest === "python") {
      codeStr = codeStr.replace(/\n\s*\n/g, "\n");
    }

    return { code: codeStr, explanation };
  };

  const loadMockTranslation = (sourceLang, targetLang) => {
    if (selectedTemplate === "custom") {
      const basic = translateCodeBasic(code, sourceLang, targetLang);
      setConvertedCode(basic.code);
      setConversionExplanation(basic.explanation);
      return;
    }

    // Load from mockTranslations data
    const algoTranslations = mockTranslations[selectedTemplate];
    if (algoTranslations && algoTranslations[targetLang]) {
      setConvertedCode(algoTranslations[targetLang].convertedCode);
      setConversionExplanation(algoTranslations[targetLang].explanation);
    } else {
      setConvertedCode(`// Mock Translation fallback for template: ${selectedTemplate} to ${targetLang}\n// To perform this conversion, please connect a Gemini API Key in the Settings.`);
      setConversionExplanation("This template does not have a pre-defined offline mapping for the selected target language. Save a Gemini API Key in the settings for dynamic translation.");
    }
  };


  const handleSimulateTrigger = () => {
    if (userTier !== "premium") {
      showToast("Execution simulation is a Paid Feature. Choose a payment package to continue.", "info");
      setShowCheckout(true);
      return;
    }

    const isCustom = selectedTemplate === "custom";
    if (isCustom) {
      if (!analysisResult.simulation || analysisResult.simulation.length === 0) {
        showToast("Please run 'Analyze Complexity' first before simulating.", "warning");
        return;
      }
      if (tokens <= 0) {
        showToast("You have run out of simulation tokens! Please purchase more tokens.", "warning");
        setShowCheckout(true);
        return;
      }
      
      // Deduct simulation token asynchronously from backend
      deductSimToken().then((success) => {
        if (success) {
          // If we have history logs, mark the first one as tokensUsed = 1
          if (history.length > 0) {
            const firstLog = history[0];
            if (firstLog && firstLog._id) {
              client.patch(`/history/${firstLog._id}/tokensUsed`).catch(err => {
                console.error("Failed to persist tokensUsed in history:", err);
              });
            }
            setHistory((prev) => {
              if (prev.length > 0) {
                const updated = [...prev];
                updated[0] = { ...updated[0], tokensUsed: 1 };
                return updated;
              }
              return prev;
            });
          }
          setActiveTab("simulator");
          setActiveStepIndex(0);
        }
      });
      return;
    }

    setActiveTab("simulator");
    setActiveStepIndex(0);
  };

  const handlePurchase = async () => {
    if (!userContact) {
      showToast("Please log in first before buying subscription or tokens!", "warning");
      setShowCheckout(false);
      setShowLogin(true);
      return;
    }

    const success = await purchase(checkoutOption);
    if (success) {
      setShowCheckout(false);
    }
  };

  const handleSendOtp = async () => {
    if (!contactInput.trim()) {
      showToast("Please enter a valid email address or mobile number.", "warning");
      return;
    }
    
    setIsSendingOtp(true);
    const success = await sendOtp(contactInput.trim());
    setIsSendingOtp(false);
    if (success) {
      setLoginStep("otp");
    }
  };

  const handleSocialLogin = async (provider) => {
    setIsSendingOtp(true);
    const success = await socialLogin(provider);
    setIsSendingOtp(false);
    if (success) {
      setShowLogin(false);
      setContactInput("");
      setOtpInput("");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput || otpInput.length < 4) {
      showToast("Please enter the 4-digit verification code.", "warning");
      return;
    }

    const success = await verifyOtp(contactInput.trim(), otpInput.trim());
    if (success) {
      setShowLogin(false);
      setLoginStep("input");
      setContactInput("");
      setOtpInput("");
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleChangePassword = async (contact, currentPassword, newPassword) => {
    return await changePassword(currentPassword, newPassword);
  };

  const handleDemoSetTier = (tier) => {
    demoSetTier(tier);
  };


  const handleLoadHistory = (item) => {
    setCode(item.code);
    setSelectedLanguage(item.language);
    setSelectedTemplate("custom");
    setAnalysisResult({
      timeComplexity: item.timeComplexity,
      spaceComplexity: item.spaceComplexity,
      explanation: item.explanation,
      optimizedCode: item.optimizedCode,
      optimizationExplanation: item.optimizationExplanation,
      heatmap: item.heatmap,
      simulation: item.simulation,
      quiz: item.quiz
    });
    setActiveStepIndex(0);
    setActiveTab("complexity");
  };

  const handleDeleteHistory = async (idx) => {
    const item = history[idx];
    if (item && item._id) {
      try {
        await client.delete(`/history/${item._id}`);
        setHistory((prev) => prev.filter((_, i) => i !== idx));
        showToast("History log deleted successfully", "success");
      } catch (err) {
        showToast("Failed to delete history log", "error");
      }
    } else {
      setHistory((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleAdminToggleTier = async (contact) => {
    const target = usersDb.find(u => u.contact === contact);
    if (!target) return;
    try {
      const { data } = await client.patch(`/users/${target._id}/tier`);
      setUsersDb((prev) => prev.map((u) => u._id === target._id ? { ...u, tier: data.user.tier, tokens: data.user.tokens } : u));
      showToast(data.message, "success");
    } catch (err) {
      showToast("Failed to toggle tier", "error");
    }
  };

  const handleAdminAddTokens = async (contact) => {
    const target = usersDb.find(u => u.contact === contact);
    if (!target) return;
    try {
      const { data } = await client.patch(`/users/${target._id}/tokens`);
      setUsersDb((prev) => prev.map((u) => u._id === target._id ? { ...u, tokens: data.user.tokens } : u));
      showToast(data.message, "success");
    } catch (err) {
      showToast("Failed to add tokens", "error");
    }
  };

  const handleAdminDelete = async (contact) => {
    const target = usersDb.find(u => u.contact === contact);
    if (!target) return;
    try {
      await client.delete(`/users/${target._id}`);
      setUsersDb((prev) => prev.filter((u) => u._id !== target._id));
      showToast("User deleted successfully", "success");
      if (contact === userContact) {
        logout();
      }
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to delete user", "error");
    }
  };

  return (
    <div className="flex flex-col min-h-screen gap-4 p-4 max-w-[1550px] mx-auto w-full">
      <Header
        userTier={userTier}
        setUserTier={handleDemoSetTier}
        tokens={tokens}
        onOpenCheckout={() => setShowCheckout(true)}
        theme={theme}
        setTheme={setTheme}
        userContact={userContact}
        onOpenLogin={() => {
          setLoginStep("input");
          setShowLogin(true);
        }}
        onLogout={handleLogout}
        history={history}
        onLoadHistory={handleLoadHistory}
        onDeleteHistory={handleDeleteHistory}
        onChangePassword={handleChangePassword}
        usersDb={usersDb}
      />

      {/* Main Split Layout: Full width Editor/Tab/Comparison */}
      <div className="grid gap-4 items-start grid-cols-1">
        {/* Left Column: Sandbox tools + Feature Matrix */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">


          {/* Editor Sandbox Panel */}
          <EditorPanel
            code={code}
            setCode={setCode}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            userTier={userTier}
            onAnalyze={handleAnalyze}
            onSimulate={handleSimulateTrigger}
            isAnalyzing={isAnalyzing}
            activeSimLine={activeSimLine}
            heatmapData={analysisResult.heatmap}
            showHeatmap={userTier !== "anonymous"}
            detectedLanguage={detectedLanguage}
            hasApiKey={hasApiKey()}
          />

          {/* Analysis Tab Panel */}
          <div className="glass-panel flex flex-col h-[630px]">
            <div className="flex border-b border-border-color bg-white/1 rounded-t-xl">
              <button
                className={`flex-1 bg-transparent border-b-2 border-transparent text-text-muted cursor-pointer text-[13px] font-medium py-3 flex items-center justify-center gap-1.5 transition-all duration-200 hover:text-text-main relative ${
                  activeTab === "complexity" ? "text-primary border-primary font-semibold bg-primary/3" : ""
                }`}
                onClick={() => setActiveTab("complexity")}
              >
                <BarChart2 size={14} />
                <span>Complexity</span>
                <span className="absolute top-1 right-2 text-[7.5px] font-bold tracking-wider uppercase opacity-65 text-text-dark">
                  Free
                </span>
              </button>
              <button
                className={`flex-1 bg-transparent border-b-2 border-transparent text-text-muted cursor-pointer text-[13px] font-medium py-3 flex items-center justify-center gap-1.5 transition-all duration-200 hover:text-text-main relative ${
                  activeTab === "converter" ? "text-primary border-primary font-semibold bg-primary/3" : ""
                }`}
                onClick={() => setActiveTab("converter")}
              >
                <Languages size={14} />
                <span>Converter</span>
                <span className="absolute top-1 right-2 text-[7.5px] font-bold tracking-wider uppercase opacity-65 text-text-dark">
                  Free
                </span>
              </button>
              <button
                className={`flex-1 bg-transparent border-b-2 border-transparent text-text-muted cursor-pointer text-[13px] font-medium py-3 flex items-center justify-center gap-1.5 transition-all duration-200 hover:text-text-main relative ${
                  activeTab === "optimizer" ? "text-primary border-primary font-semibold bg-primary/3" : ""
                }`}
                onClick={() => setActiveTab("optimizer")}
              >
                <Zap size={14} />
                <span>AI Optimizer</span>
                <span className="absolute top-1 right-2 text-[7.5px] font-bold tracking-wider uppercase opacity-75 text-primary animate-pulse">
                  Sign-In
                </span>
              </button>
              <button
                className={`flex-1 bg-transparent border-b-2 border-transparent text-text-muted cursor-pointer text-[13px] font-medium py-3 flex items-center justify-center gap-1.5 transition-all duration-200 hover:text-text-main relative ${
                  activeTab === "simulator" ? "text-primary border-primary font-semibold bg-primary/3" : ""
                }`}
                onClick={() => setActiveTab("simulator")}
              >
                <Play size={14} />
                <span>Simulator</span>
                <span className="absolute top-1 right-2 text-[7.5px] font-bold tracking-wider uppercase opacity-85 text-accent-purple dark:text-accent-purple/90">
                  Pro
                </span>
              </button>
            </div>

            {isAnalyzing ? (
              <div className="loader-container">
                <div className="spinner"></div>
                <div className="loader-text">AI is compiling & simulating your algorithm...</div>
              </div>
            ) : (
              <div className="p-4 flex flex-col flex-1 overflow-y-auto">
                {activeTab === "complexity" && (
                  <div className="flex flex-col gap-4 mt-2.5">
                    <div className="flex gap-3 mb-1">
                      <div className="flex-1 bg-white/3 border border-primary/20 rounded-lg p-2.5 flex items-center gap-2.5">
                        <div className="bg-primary/10 text-primary rounded-lg p-1.5 flex">
                          <BarChart2 size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-text-muted uppercase">Time Complexity</span>
                          <span className="text-base font-bold text-primary font-mono">{analysisResult.timeComplexity}</span>
                        </div>
                      </div>

                      <div className="flex-1 bg-white/3 border border-secondary/20 rounded-lg p-2.5 flex items-center gap-2.5">
                        <div className="bg-secondary/10 text-secondary rounded-lg p-1.5 flex">
                          <BarChart2 size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-text-muted uppercase">Space Complexity</span>
                          <span className="text-base font-bold text-secondary font-mono">{analysisResult.spaceComplexity}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-text-muted text-[13.5px] leading-relaxed">
                      {analysisResult.explanation ? parseMarkdown(analysisResult.explanation) : "No analysis generated yet. Click 'Analyze Complexity'."}
                    </div>

                    <ChartViewer timeComplexity={analysisResult.timeComplexity} />
                    {/* Feature comparison matrix moved to bottom of page */}
                  </div>

                )}

                {activeTab === "optimizer" && (
                  <OptimizerPanel
                    userTier={userTier}
                    originalCode={code}
                    optimizedCode={analysisResult.optimizedCode}
                    explanation={analysisResult.optimizationExplanation}
                    timeComplexity={analysisResult.timeComplexity}
                    spaceComplexity={analysisResult.spaceComplexity}
                    onSignUp={() => {
                      setLoginStep("input");
                      setShowLogin(true);
                    }}
                  />
                )}

                {activeTab === "simulator" && (
                  <SimulatorPanel
                    userTier={userTier}
                    simulationSteps={analysisResult.simulation}
                    quizzes={analysisResult.quiz}
                    activeStepIndex={activeStepIndex}
                    setActiveStepIndex={setActiveStepIndex}
                    onOpenCheckout={() => setShowCheckout(true)}
                    isCustomCode={selectedTemplate === "custom"}
                  />
                )}

                {activeTab === "converter" && (
                  <ConverterPanel
                    userTier={userTier}
                    originalCode={code}
                    convertedCode={convertedCode}
                    explanation={conversionExplanation}
                    isConverting={isConverting}
                    onConvert={handleConvert}
                    onSignUp={() => {
                      setLoginStep("input");
                      setShowLogin(true);
                    }}
                  />
                )}
              </div>
            )}
          </div>

        </div>

        {/* Feature Comparison Matrix - aligned to left column width */}
        <FeatureComparison userTier={userTier} />
      </div>
    </div>



        {/* Collapsible Admin User Management Drawer */}
        {window.location.search.includes("admin=true") && (
          <div className="mt-4 border-t border-border-color pt-4">
            <div className="flex justify-between items-center p-2 px-3 bg-white/2 border border-border-color rounded-lg">
              <div className="flex items-center gap-4 text-[13px] font-semibold text-text-main">
                <div 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setIsAdminOpen(!isAdminOpen)}
                >
                  <Database size={15} className="text-primary" />
                  <span>Simulated Database Dashboard</span>
                </div>
                {isAdminOpen && (
                  <div className="flex gap-2 border-l border-border-color pl-4">
                    <button
                      className={`px-2.5 py-1 rounded text-[11px] cursor-pointer font-medium border-none ${
                        adminTab === "users" ? "bg-primary text-white" : "text-text-muted hover:text-text-main bg-white/5"
                      }`}
                      onClick={() => setAdminTab("users")}
                    >
                      Users Directory
                    </button>
                    <button
                      className={`px-2.5 py-1 rounded text-[11px] cursor-pointer font-medium relative border-none ${
                        adminTab === "feedback" ? "bg-primary text-white" : "text-text-muted hover:text-text-main bg-white/5"
                      }`}
                      onClick={() => setAdminTab("feedback")}
                    >
                      Feedback Inbox
                      {feedbacks.length > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-accent-red text-white text-[8px] px-1 py-0.2 rounded-full font-bold">
                          {feedbacks.length}
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>
              <div className="text-xs text-text-muted cursor-pointer" onClick={() => setIsAdminOpen(!isAdminOpen)}>
                {isAdminOpen ? "Collapse [-]" : "Expand Dashboard [+]"}
              </div>
            </div>

            {isAdminOpen && adminTab === "users" && (
              <div className="overflow-x-auto mt-3 border border-border-color rounded-lg glass-panel">
                <table className="w-full border-collapse text-xs text-left">
                  <thead>
                    <tr className="bg-white/3 border-b border-border-color">
                      <th className="text-text-muted font-semibold p-2 px-3">Email / Mobile</th>
                      <th className="text-text-muted font-semibold p-2 px-3">Account Tier</th>
                      <th className="text-text-muted font-semibold p-2 px-3">Tokens Balance</th>
                      <th className="text-text-muted font-semibold p-2 px-3">Signup Time</th>
                      <th className="text-text-muted font-semibold p-2 px-3">Admin Controls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersDb.map((user) => (
                      <tr key={user.contact} className="hover:bg-white/2" style={user.contact === userContact ? { background: "rgba(99, 102, 241, 0.08)" } : {}}>
                        <td className="p-2 px-3 border-b border-border-color font-semibold">
                          {user.contact} {user.contact === userContact ? " (You)" : ""}
                        </td>
                        <td className="p-2 px-3 border-b border-border-color">
                          <span
                            className="bg-gradient-to-r from-primary to-secondary text-[9px] font-semibold px-2 py-0.5 rounded text-white uppercase tracking-wider"
                            style={user.tier === "premium" ? {} : { background: "var(--color-text-dark)" }}
                          >
                            {user.tier.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-2 px-3 border-b border-border-color font-mono font-semibold">{user.tokens} Tokens</td>
                        <td className="p-2 px-3 border-b border-border-color text-text-muted">{user.signup || (user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "")}</td>
                        <td className="p-2 px-3 border-b border-border-color">
                          <button
                            className="bg-primary text-white p-1 px-2 rounded cursor-pointer text-[10px] font-medium mr-1 border-none"
                            onClick={() => handleAdminToggleTier(user.contact)}
                          >
                            Toggle Tier
                          </button>
                          <button
                            className="bg-primary text-white p-1 px-2 rounded cursor-pointer text-[10px] font-medium mr-1 border-none"
                            onClick={() => handleAdminAddTokens(user.contact)}
                          >
                            +10 Tokens
                          </button>
                          <button
                            className="bg-accent-red text-white p-1 px-2 rounded cursor-pointer text-[10px] font-medium border-none"
                            onClick={() => handleAdminDelete(user.contact)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {usersDb.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-4 border-b border-border-color text-center text-text-dark">
                          No records in user table. Create an account to register!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {isAdminOpen && adminTab === "feedback" && (
              <div className="overflow-x-auto mt-3 border border-border-color rounded-lg glass-panel">
                <table className="w-full border-collapse text-xs text-left">
                  <thead>
                    <tr className="bg-white/3 border-b border-border-color">
                      <th className="text-text-muted font-semibold p-2 px-3">Name</th>
                      <th className="text-text-muted font-semibold p-2 px-3">Email</th>
                      <th className="text-text-muted font-semibold p-2 px-3">Feedback Message</th>
                      <th className="text-text-muted font-semibold p-2 px-3">Submitted At</th>
                      <th className="text-text-muted font-semibold p-2 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.map((fb) => (
                      <tr key={fb._id || fb.id} className="hover:bg-white/2">
                        <td className="p-2 px-3 border-b border-border-color font-semibold">
                          {fb.name}
                        </td>
                        <td className="p-2 px-3 border-b border-border-color">
                          {fb.email}
                        </td>
                        <td className="p-2 px-3 border-b border-border-color whitespace-pre-wrap max-w-[400px]">
                          {fb.message}
                        </td>
                        <td className="p-2 px-3 border-b border-border-color text-text-muted">
                          {fb.createdAt ? new Date(fb.createdAt).toLocaleString() : `${fb.date} ${fb.time}`}
                        </td>
                        <td className="p-2 px-3 border-b border-border-color">
                          <button
                            className="bg-accent-red text-white p-1 px-2 rounded cursor-pointer text-[10px] font-medium border-none"
                            onClick={() => handleAdminDeleteFeedback(fb._id || fb.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {feedbacks.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-4 border-b border-border-color text-center text-text-dark">
                          No feedback submissions found in database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <Footer onFeedbackSubmitted={refreshFeedback} />



      {/* OTP Authentication Modal */}
      {showLogin && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowLogin(false)}
        >
          <div 
            className="bg-bg-main border border-border-color rounded-xl w-full max-w-[440px] shadow-glass-shadow overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 px-4 border-b border-border-color flex justify-between items-center">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-text-main">
                <User size={18} className="text-primary" />
                <span>Verification Login Portal</span>
              </h3>
              <button className="bg-transparent border-none text-text-muted cursor-pointer hover:text-text-main" onClick={() => setShowLogin(false)}>
                ✕
              </button>
            </div>
            
            <div className="p-4">
              {loginStep === "input" ? (
                <>
                  <p className="text-text-muted text-xs leading-relaxed mb-3">
                    Enter your email address or mobile phone number. A 4-digit verification code will be simulated.
                  </p>
                  <div className="flex flex-col gap-1.5 mb-3">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Email or Phone Number</label>
                    <input
                      type="text"
                      className="bg-black/20 border border-border-color rounded-md p-2 text-text-main outline-none text-xs focus:border-primary"
                      placeholder="e.g. dev@bigo.ai or +919999988888"
                      value={contactInput}
                      onChange={(e) => setContactInput(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button className="bg-white/5 border border-border-color text-text-main px-3 py-2 rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-500/15" onClick={() => setShowLogin(false)}>
                      Cancel
                    </button>
                    <button className="bg-gradient-to-r from-primary to-secondary text-white px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-40" onClick={handleSendOtp} disabled={isSendingOtp}>
                      {isSendingOtp ? "Generating Code..." : "Send OTP"}
                    </button>
                  </div>

                  {/* OR Divider */}
                  <div className="flex items-center gap-2 my-4">
                    <span className="h-[1px] bg-border-color flex-1" />
                    <span className="text-[9px] text-text-dark uppercase font-bold tracking-wider">Or Connect With</span>
                    <span className="h-[1px] bg-border-color flex-1" />
                  </div>

                  {/* Social buttons */}
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleSocialLogin("Google")}
                      className="w-full bg-white/5 dark:bg-black/3 border border-border-color text-text-main px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer hover:bg-gray-500/15 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                      </svg>
                      <span>Sign in with Google</span>
                    </button>

                    <button 
                      onClick={() => handleSocialLogin("GitHub")}
                      className="w-full bg-white/5 dark:bg-black/3 border border-border-color text-text-main px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer hover:bg-gray-500/15 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
                      </svg>
                      <span>Sign in with GitHub</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-text-muted text-xs leading-relaxed mb-3">
                    OTP sent to <strong>{contactInput}</strong>! Enter the 4-digit verification code to log in.
                  </p>
                  <div className="flex flex-col gap-1.5 mb-3">
                    <label className="text-[10px] font-semibold text-accent-yellow uppercase tracking-wider">4-Digit Code</label>
                    <input
                      type="text"
                      maxLength="4"
                      className="bg-black/20 border border-border-color rounded-md p-2 text-text-main outline-none text-base text-center tracking-[8px] font-mono focus:border-primary"
                      placeholder="1234"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                  <p className="text-[11px] text-accent-green leading-relaxed">
                    💡 Pro-Tip: Enter <strong>1234</strong> (or any code) to simulate successful OTP verification!
                  </p>
                  <div className="flex justify-end gap-2 mt-4">
                    <button className="bg-white/5 border border-border-color text-text-main px-3 py-2 rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-500/15" onClick={() => setLoginStep("input")}>
                      Back
                    </button>
                    <button className="bg-gradient-to-r from-primary to-secondary text-white px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer" onClick={handleVerifyOtp}>
                      Verify & Log In
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowCheckout(false)}
        >
          <div 
            className="bg-bg-main border border-border-color rounded-xl w-full max-w-[440px] shadow-glass-shadow overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 px-4 border-b border-border-color flex justify-between items-center">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-text-main">
                <Coins size={18} className="text-accent-yellow" />
                <span>Unlock Advanced Features</span>
              </h3>
              <button className="bg-transparent border-none text-text-muted cursor-pointer hover:text-text-main" onClick={() => setShowCheckout(false)}>
                ✕
              </button>
            </div>
            
            <div className="p-4">
              <p className="text-text-muted text-xs leading-relaxed mb-4">
                Select a payment package to continue. Enjoy unrestricted access to step-by-step logic simulator.
              </p>

              <div className="flex flex-col gap-3">
                <div
                  className={`border border-border-color rounded-lg p-3 flex justify-between items-center cursor-pointer transition-all duration-200 ${
                    checkoutOption === "subscription" ? "border-primary bg-primary/5 shadow-sm shadow-primary/10" : "bg-white/1"
                  }`}
                  onClick={() => setCheckoutOption("subscription")}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-semibold text-text-main">1 Month Premium Access</span>
                    <span className="text-[11px] text-text-muted">Includes 70 custom simulation tokens + infinite template runs</span>
                  </div>
                  <span className="text-sm font-bold text-accent-yellow">₹40</span>
                </div>

                <div
                  className={`border border-border-color rounded-lg p-3 flex justify-between items-center cursor-pointer transition-all duration-200 ${
                    checkoutOption === "tokens" ? "border-primary bg-primary/5 shadow-sm shadow-primary/10" : "bg-white/1"
                  }`}
                  onClick={() => setCheckoutOption("tokens")}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-semibold text-text-main">Buy 10 Tokens Pack</span>
                    <span className="text-[11px] text-text-muted">Custom inputs simulation (₹1 per simulation)</span>
                  </div>
                  <span className="text-sm font-bold text-accent-yellow">₹10</span>
                </div>
              </div>
            </div>

            <div className="p-3 px-4 border-t border-border-color flex justify-end gap-2 bg-black/5">
              <button className="bg-white/5 border border-border-color text-text-main px-3 py-2 rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-500/15" onClick={() => setShowCheckout(false)}>
                Cancel
              </button>
              <button className="bg-gradient-to-r from-primary to-secondary text-white px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer" onClick={handlePurchase}>
                Proceed to Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
