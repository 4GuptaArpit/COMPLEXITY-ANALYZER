import { useState, useEffect } from "react";
import { BarChart2, Zap, Play, User, Database, Languages, Share2, HelpCircle } from "lucide-react";
import Header from "./components/Header";
import EditorPanel from "./components/EditorPanel";
import ChartViewer from "./components/ChartViewer";
import OptimizerPanel from "./components/OptimizerPanel";
import SimulatorPanel from "./components/SimulatorPanel";
import ConverterPanel from "./components/ConverterPanel";
import Footer from "./components/Footer";
import { analyzeCodeWithGemini, convertCodeWithGemini, explainCodeWithGemini } from "./geminiService";
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
    register,
    login,
    sendOtp,
    verifyOtp,
    updateProfile,
    logout,
    changePassword,
  } = useAuth();

  const userContact = user ? user.contact : null;

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("BIGO_THEME");
    return (saved === "desert" || saved === "rainy") ? saved : "desert";
  });


  useEffect(() => {
    localStorage.setItem("BIGO_THEME", theme);
  }, [theme]);

  const [usersDb, setUsersDb] = useState([]);
  const [history, setHistory] = useState([]);
  const [code, setCode] = useState(`// Write or paste your code here...\nfunction findMax(arr) {\n  let max = arr[0];\n  for (let i = 1; i < arr.length; i++) {\n    if (arr[i] > max) {\n      max = arr[i];\n    }\n  }\n  return max;\n}`);

  const [activeTab, setActiveTab] = useState("complexity");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Auth & Registration modal states
  const [showLogin, setShowLogin] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "signup" | "otp"
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [contactInput, setContactInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  const [isAdminOpen, setIsAdminOpen] = useState(false);


  const [analysisResult, setAnalysisResult] = useState({
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    explanation: "Linear scan through array of size N to find the maximum element.",
    optimizedCode: "",
    optimizationExplanation: "",
    heatmap: { "1": "low", "2": "low", "3": "medium", "4": "high", "5": "medium", "8": "low" },
    simulation: [
      { line: 2, vars: { max: "arr[0]" }, explanation: "Initialize max variable with first element." },
      { line: 3, vars: { i: "1", max: "arr[0]" }, explanation: "Start loop from index 1 to length - 1." },
    ],
    quiz: []
  });

  const [plainExplanation, setPlainExplanation] = useState("This algorithm iterates through every item in the list once to find the largest value.");
  const [isExplaining, setIsExplaining] = useState(false);

  const [convertedCode, setConvertedCode] = useState("");
  const [conversionExplanation, setConversionExplanation] = useState("");
  const [isConverting, setIsConverting] = useState(false);

  const [adminTab, setAdminTab] = useState("users");
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    setConvertedCode("");
    setConversionExplanation("");
  }, [code]);



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

  const [isSharing, setIsSharing] = useState(false);

  // Check URL query param ?share=ID or path /share/:id on page load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get("share") || window.location.pathname.split("/share/")[1];
    if (shareId) {
      client.get(`/share/${shareId}`)
        .then(({ data }) => {
          setCode(data.code);
          setSelectedLanguage(data.language);
          setSelectedTemplate("custom");
          setAnalysisResult({
            timeComplexity: data.timeComplexity,
            spaceComplexity: data.spaceComplexity,
            explanation: data.explanation,
            optimizedCode: data.optimizedCode,
            optimizationExplanation: data.optimizationExplanation,
            heatmap: data.heatmap || {},
            simulation: [],
            quiz: []
          });
          showToast("Loaded shared code analysis!", "success");
        })
        .catch(() => {
          showToast("Shared analysis link not found or expired.", "warning");
        });
    }
  }, []);

  const handleShareAnalysis = async () => {
    if (!code || !code.trim()) {
      showToast("Please enter code first before sharing.", "warning");
      return;
    }
    setIsSharing(true);
    try {
      const { data } = await client.post("/share", {
        code,
        language: detectedLanguage,
        timeComplexity: analysisResult.timeComplexity,
        spaceComplexity: analysisResult.spaceComplexity,
        explanation: analysisResult.explanation,
        optimizedCode: analysisResult.optimizedCode,
        optimizationExplanation: analysisResult.optimizationExplanation,
        heatmap: analysisResult.heatmap,
      });


      const fullShareUrl = `${window.location.origin}/?share=${data.shortId}`;
      await navigator.clipboard.writeText(fullShareUrl);
      showToast("Shareable analysis link copied to clipboard!", "success");
    } catch (err) {
      showToast("Failed to generate share link.", "error");
    } finally {
      setIsSharing(false);
    }
  };

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
  const detectedLanguage = code ? detectLanguage(code) : "javascript";


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
      if (userContact) {
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
    
    if (userContact) {
      addToHistory(time, space, mockResult);
    }
  };

  const addToHistory = async (timeComp, spaceComp, result, tokensUsed = 0) => {
    const firstLine = code.trim().split("\n")[0];
    const name = firstLine.replace(new RegExp("[/#*|]", "g"), "").trim().substring(0, 24) || "Algorithm Sandbox";

    const payload = {
      name,
      language: detectedLanguage,
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
      const maxLogs = 30;
      setHistory((prev) => [data, ...prev.slice(0, maxLogs - 1)]);
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
    setIsExplaining(true);
    
    const targetLang = detectLanguage(code);


    try {
      const res = await analyzeCodeWithGemini(code, targetLang);
      setAnalysisResult(res);
      setActiveStepIndex(0);
      
      if (userContact) {
        addToHistory(res.timeComplexity, res.spaceComplexity, res);
      }
      showToast("Gemini AI Analysis complete!", "success");

      explainCodeWithGemini(code, targetLang)
        .then((text) => setPlainExplanation(text))
        .catch(() => setPlainExplanation("Code logic summary unavailable."))
        .finally(() => setIsExplaining(false));

    } catch (err) {
      showToast("Failed to analyze code: " + err.message, "error");
      setIsExplaining(false);
    } finally {
      setIsAnalyzing(false);
    }
  };


  const handleConvert = async (targetLang) => {
    const sourceLang = detectLanguage(code);

    
    if (sourceLang === targetLang) {
      showToast(`The code is already in ${targetLang.toUpperCase()}! Please select a different target language.`, "warning");
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
      showToast("Failed to convert code: " + err.message, "error");
    } finally {
      setIsConverting(false);
    }
  };

  const handleSimulateTrigger = () => {
    if (!analysisResult.simulation || analysisResult.simulation.length === 0) {
      showToast("Please run 'Analyze Complexity' first before simulating.", "warning");
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

  const handlePasswordLogin = async (e) => {
    e?.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      showToast("Please enter both email and password.", "warning");
      return;
    }
    setIsSubmittingAuth(true);
    const success = await login(loginEmail.trim(), loginPassword);
    setIsSubmittingAuth(false);
    if (success) {
      setShowLogin(false);
      setLoginEmail("");
      setLoginPassword("");
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    if (!registerEmail.trim() || !registerPassword.trim()) {
      showToast("Please enter email and password.", "warning");
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      showToast("Passwords do not match.", "warning");
      return;
    }
    if (registerPassword.length < 6) {
      showToast("Password must be at least 6 characters.", "warning");
      return;
    }
    setIsSubmittingAuth(true);
    const success = await register(registerName.trim(), registerEmail.trim(), registerPassword);
    setIsSubmittingAuth(false);
    if (success) {
      setShowLogin(false);
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterConfirmPassword("");
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
      setAuthMode("otp-verify");
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
    <div className={`flex flex-col min-h-screen gap-4 p-4 max-w-[1550px] mx-auto w-full ${theme === "rainy" ? "rainy-theme" : "desert-theme"}`}>

      <Header
        user={user}
        theme={theme}

        setTheme={setTheme}
        userContact={userContact}
        onOpenLogin={() => {
          setAuthMode("login");
          setShowLogin(true);
        }}
        onLogout={handleLogout}
        history={history}
        onLoadHistory={handleLoadHistory}
        onDeleteHistory={handleDeleteHistory}
        onChangePassword={handleChangePassword}
        onUpdateProfile={updateProfile}
        usersDb={usersDb}
      />


      {/* Main Split Layout: Full width Editor/Tab */}
      <div className="grid gap-4 items-start grid-cols-1">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">

          {/* Editor Sandbox Panel */}
          <EditorPanel
            code={code}
            setCode={setCode}
            onAnalyze={handleAnalyze}
            onSimulate={handleSimulateTrigger}
            isAnalyzing={isAnalyzing}
            detectedLanguage={detectedLanguage}
          />



          {/* Analysis Tab Panel */}
          <div className="glass-panel flex flex-col h-[630px]">
            <div className="flex border-b border-border-color bg-white/1 rounded-t-xl">
              <button
                className={`flex-1 bg-transparent border-b-2 border-transparent text-text-muted cursor-pointer text-[13px] font-medium py-3 flex items-center justify-center gap-1.5 transition-all duration-200 hover:text-text-main ${
                  activeTab === "complexity" ? "text-primary border-primary font-semibold bg-primary/3" : ""
                }`}
                onClick={() => setActiveTab("complexity")}
              >
                <BarChart2 size={14} />
                <span>Complexity</span>
              </button>
              <button
                className={`flex-1 bg-transparent border-b-2 border-transparent text-text-muted cursor-pointer text-[13px] font-medium py-3 flex items-center justify-center gap-1.5 transition-all duration-200 hover:text-text-main ${
                  activeTab === "converter" ? "text-primary border-primary font-semibold bg-primary/3" : ""
                }`}
                onClick={() => setActiveTab("converter")}
              >
                <Languages size={14} />
                <span>Converter</span>
              </button>
              <button
                className={`flex-1 bg-transparent border-b-2 border-transparent text-text-muted cursor-pointer text-[13px] font-medium py-3 flex items-center justify-center gap-1.5 transition-all duration-200 hover:text-text-main ${
                  activeTab === "optimizer" ? "text-primary border-primary font-semibold bg-primary/3" : ""
                }`}
                onClick={() => setActiveTab("optimizer")}
              >
                <Zap size={14} />
                <span>AI Optimizer</span>
              </button>
              <button
                className={`flex-1 bg-transparent border-b-2 border-transparent text-text-muted cursor-pointer text-[13px] font-medium py-3 flex items-center justify-center gap-1.5 transition-all duration-200 hover:text-text-main ${
                  activeTab === "simulator" ? "text-primary border-primary font-semibold bg-primary/3" : ""
                }`}
                onClick={() => setActiveTab("simulator")}
              >
                <Play size={14} />
                <span>Simulator</span>
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

                      <div className="flex-1 bg-white/3 border border-secondary/20 rounded-lg p-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="bg-secondary/10 text-secondary rounded-lg p-1.5 flex">
                            <BarChart2 size={18} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-text-muted uppercase">Space Complexity</span>
                            <span className="text-base font-bold text-secondary font-mono">{analysisResult.spaceComplexity}</span>
                          </div>
                        </div>
                        <button
                          onClick={handleShareAnalysis}
                          disabled={isSharing}
                          className="bg-white/5 hover:bg-white/10 border border-border-color text-text-main px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-40"
                          title="Generate a public shareable link for this analysis"
                        >
                          <Share2 size={13} className="text-primary" />
                          <span>{isSharing ? "Sharing..." : "Share Link"}</span>
                        </button>
                      </div>
                    </div>


                    {/* Plain English "What does this code do?" Card */}
                    <div className="bg-white/3 border border-primary/20 rounded-lg p-3 flex flex-col gap-1.5 text-left">
                      <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider">
                        <HelpCircle size={14} />
                        <span>What does this code do? (Plain English)</span>
                      </div>
                      {isExplaining ? (
                        <div className="text-xs text-text-muted animate-pulse">Summarizing code logic into plain English...</div>
                      ) : (
                        <p className="text-xs text-text-main leading-relaxed m-0">{plainExplanation}</p>
                      )}
                    </div>

                    <div className="text-text-muted text-[13.5px] leading-relaxed">
                      {analysisResult.explanation ? parseMarkdown(analysisResult.explanation) : "No analysis generated yet. Click 'Analyze Complexity'."}
                    </div>

                    <ChartViewer timeComplexity={analysisResult.timeComplexity} />
                  </div>
                )}


                {activeTab === "optimizer" && (
                  <OptimizerPanel
                    originalCode={code}
                    optimizedCode={analysisResult.optimizedCode}
                    explanation={analysisResult.optimizationExplanation}
                    timeComplexity={analysisResult.timeComplexity}
                    spaceComplexity={analysisResult.spaceComplexity}
                  />
                )}

                {activeTab === "simulator" && (
                  <SimulatorPanel
                    simulationSteps={analysisResult.simulation}
                    quizzes={analysisResult.quiz}
                    activeStepIndex={activeStepIndex}
                    setActiveStepIndex={setActiveStepIndex}
                    isCustomCode={true}
                  />
                )}

                {activeTab === "converter" && (
                  <ConverterPanel
                    originalCode={code}
                    convertedCode={convertedCode}
                    explanation={conversionExplanation}
                    isConverting={isConverting}
                    onConvert={handleConvert}
                  />
                )}

              </div>
            )}
          </div>

        </div>
      </div>
    </div>




        {/* Collapsible Admin User Management Drawer */}
        {(user?.isAdmin || (typeof window !== "undefined" && window.location.search.includes("admin=true"))) && (
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



      {/* Complete Integrated Auth Modal (Log In, Sign Up, Quick OTP) */}
      {showLogin && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowLogin(false)}
        >
          <div 
            className="bg-bg-main border border-border-color rounded-xl w-full max-w-[440px] shadow-glass-shadow overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3 px-4 border-b border-border-color flex justify-between items-center bg-white/2">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-text-main">
                <User size={18} className="text-primary" />
                <span>Account Authentication</span>
              </h3>
              <button className="bg-transparent border-none text-text-muted cursor-pointer hover:text-text-main text-sm" onClick={() => setShowLogin(false)}>
                ✕
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-border-color bg-black/10">
              <button
                className={`flex-1 py-2.5 text-xs font-semibold cursor-pointer border-b-2 transition-all ${
                  authMode === "login" ? "text-primary border-primary bg-primary/5" : "text-text-muted border-transparent hover:text-text-main"
                }`}
                onClick={() => setAuthMode("login")}
              >
                🔑 Log In
              </button>
              <button
                className={`flex-1 py-2.5 text-xs font-semibold cursor-pointer border-b-2 transition-all ${
                  authMode === "signup" ? "text-primary border-primary bg-primary/5" : "text-text-muted border-transparent hover:text-text-main"
                }`}
                onClick={() => setAuthMode("signup")}
              >
                ✨ Sign Up
              </button>
              <button
                className={`flex-1 py-2.5 text-xs font-semibold cursor-pointer border-b-2 transition-all ${
                  authMode === "otp" || authMode === "otp-verify" ? "text-primary border-primary bg-primary/5" : "text-text-muted border-transparent hover:text-text-main"
                }`}
                onClick={() => setAuthMode("otp")}
              >
                ⚡ Quick OTP
              </button>
            </div>
            
            <div className="p-5">
              {/* TAB 1: LOGIN */}
              {authMode === "login" && (
                <form onSubmit={handlePasswordLogin} className="flex flex-col gap-3">
                  <p className="text-text-muted text-xs leading-relaxed mb-1">
                    Log in with your email address and password.
                  </p>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      required
                      className="bg-black/20 border border-border-color rounded-md p-2 text-text-main outline-none text-xs focus:border-primary"
                      placeholder="e.g. dev@bigo.ai"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Password</label>
                    <input
                      type="password"
                      required
                      className="bg-black/20 border border-border-color rounded-md p-2 text-text-main outline-none text-xs focus:border-primary"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <button
                      type="button"
                      className="text-[11px] text-primary hover:underline bg-transparent border-none cursor-pointer p-0"
                      onClick={() => setAuthMode("otp")}
                    >
                      Forgot password? Use OTP
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmittingAuth}
                      className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-40 shadow-md shadow-primary/25 border-none"
                    >
                      {isSubmittingAuth ? "Logging In..." : "Log In"}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: SIGN UP */}
              {authMode === "signup" && (
                <form onSubmit={handleRegister} className="flex flex-col gap-3">
                  <p className="text-text-muted text-xs leading-relaxed mb-1">
                    Create a free account to unlock profile management & saved history logs.
                  </p>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      className="bg-black/20 border border-border-color rounded-md p-2 text-text-main outline-none text-xs focus:border-primary"
                      placeholder="e.g. Alex Rivera"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      required
                      className="bg-black/20 border border-border-color rounded-md p-2 text-text-main outline-none text-xs focus:border-primary"
                      placeholder="e.g. alex@example.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Password</label>
                      <input
                        type="password"
                        required
                        className="bg-black/20 border border-border-color rounded-md p-2 text-text-main outline-none text-xs focus:border-primary"
                        placeholder="Min 6 chars"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Confirm</label>
                      <input
                        type="password"
                        required
                        className="bg-black/20 border border-border-color rounded-md p-2 text-text-main outline-none text-xs focus:border-primary"
                        placeholder="Re-enter password"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      type="submit"
                      disabled={isSubmittingAuth}
                      className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-40 shadow-md shadow-primary/25 border-none"
                    >
                      {isSubmittingAuth ? "Creating Account..." : "Create Account"}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: QUICK EMAIL OTP */}
              {authMode === "otp" && (
                <div className="flex flex-col gap-3">
                  <p className="text-text-muted text-xs leading-relaxed mb-1">
                    Passwordless instant login. Enter your email address to receive a 4-digit verification code.
                  </p>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Email Address</label>
                    <input
                      type="text"
                      className="bg-black/20 border border-border-color rounded-md p-2 text-text-main outline-none text-xs focus:border-primary"
                      placeholder="e.g. dev@bigo.ai"
                      value={contactInput}
                      onChange={(e) => setContactInput(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-40 border-none shadow-md shadow-primary/25"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                    >
                      {isSendingOtp ? "Sending OTP..." : "Send OTP Code"}
                    </button>
                  </div>
                </div>
              )}

              {/* OTP VERIFY STEP */}
              {authMode === "otp-verify" && (
                <div className="flex flex-col gap-3">
                  <p className="text-text-muted text-xs leading-relaxed mb-1">
                    OTP sent to <strong>{contactInput}</strong>! Enter the 4-digit code to log in.
                  </p>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-accent-yellow uppercase tracking-wider">4-Digit Verification Code</label>
                    <input
                      type="text"
                      maxLength="4"
                      className="bg-black/20 border border-border-color rounded-md p-2 text-text-main outline-none text-base text-center tracking-[8px] font-mono focus:border-primary"
                      placeholder="e.g. 8492"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <button
                      className="text-xs text-text-muted hover:text-text-main bg-transparent border-none cursor-pointer p-0"
                      onClick={() => setAuthMode("otp")}
                    >
                      ← Back
                    </button>
                    <button
                      className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer border-none shadow-md shadow-primary/25"
                      onClick={handleVerifyOtp}
                    >
                      Verify & Log In
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


