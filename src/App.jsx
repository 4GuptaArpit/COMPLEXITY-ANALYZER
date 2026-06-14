import React, { useState, useEffect } from "react";
import { BarChart2, Zap, Play, Coins, User, LogIn, Award, Database, ShieldAlert, Sun, Moon } from "lucide-react";
import Header from "./components/Header";
import AdSidebar from "./components/AdSidebar";
import EditorPanel from "./components/EditorPanel";
import ChartViewer from "./components/ChartViewer";
import OptimizerPanel from "./components/OptimizerPanel";
import SimulatorPanel from "./components/SimulatorPanel";
import { mockAlgorithms } from "./mockData";
import { hasApiKey, analyzeCodeWithGemini } from "./geminiService";

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("BIGO_THEME") || "dark";
  });

  const [userTier, setUserTier] = useState(() => {
    return localStorage.getItem("BIGO_USER_TIER") || "anonymous";
  });
  const [tokens, setTokens] = useState(() => {
    const saved = localStorage.getItem("BIGO_TOKENS");
    return saved !== null ? parseInt(saved, 10) : 70;
  });
  const [userContact, setUserContact] = useState(() => {
    return localStorage.getItem("BIGO_USER_CONTACT") || null;
  });
  
  const [usersDb, setUsersDb] = useState(() => {
    const saved = localStorage.getItem("BIGO_USERS_DB");
    if (saved) return JSON.parse(saved);
    
    const defaults = [
      { contact: "alex.coder@gmail.com", tier: "free", tokens: 0, signup: "2026-06-12 14:32" },
      { contact: "+919988776655", tier: "premium", tokens: 70, signup: "2026-06-12 18:15" },
      { contact: "student_prep@edu.in", tier: "free", tokens: 0, signup: "2026-06-12 21:05" }
    ];
    localStorage.setItem("BIGO_USERS_DB", JSON.stringify(defaults));
    return defaults;
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("BIGO_HISTORY");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedTemplate, setSelectedTemplate] = useState("bubble_sort");
  const [selectedLanguage, setSelectedLanguage] = useState("auto");
  const [detectedLanguage, setDetectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [activeTab, setActiveTab] = useState("complexity");
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeSimLine, setActiveSimLine] = useState(null);
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
    timeComplexity: "O(N²)",
    spaceComplexity: "O(1)",
    explanation: "",
    optimizedCode: "",
    optimizationExplanation: "",
    heatmap: {},
    simulation: [],
    quiz: []
  });

  useEffect(() => {
    document.body.className = theme === "light" ? "light-theme" : "";
    localStorage.setItem("BIGO_THEME", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("BIGO_USER_TIER", userTier);
    localStorage.setItem("BIGO_TOKENS", tokens.toString());
    localStorage.setItem("BIGO_HISTORY", JSON.stringify(history));
    localStorage.setItem("BIGO_USERS_DB", JSON.stringify(usersDb));
    if (userContact) {
      localStorage.setItem("BIGO_USER_CONTACT", userContact);
    } else {
      localStorage.removeItem("BIGO_USER_CONTACT");
    }
  }, [userTier, tokens, userContact, history, usersDb]);

  useEffect(() => {
    const defaultAlgo = mockAlgorithms.find((a) => a.id === "bubble_sort");
    if (defaultAlgo) {
      setCode(defaultAlgo.code);
      setSelectedLanguage(defaultAlgo.language);
      setAnalysisResult({
        timeComplexity: defaultAlgo.timeComplexity,
        spaceComplexity: defaultAlgo.spaceComplexity,
        explanation: defaultAlgo.explanation,
        optimizedCode: defaultAlgo.optimizedCode,
        optimizationExplanation: defaultAlgo.optimizationExplanation,
        heatmap: defaultAlgo.heatmap,
        simulation: defaultAlgo.simulation,
        quiz: defaultAlgo.quiz
      });
    }
  }, []);

  useEffect(() => {
    if (activeTab === "simulator" && analysisResult?.simulation?.length > 0) {
      const step = analysisResult.simulation[activeStepIndex];
      if (step) {
        setActiveSimLine(step.line);
      }
    } else {
      setActiveSimLine(null);
    }
  }, [activeStepIndex, activeTab, analysisResult]);

  useEffect(() => {
    if (selectedLanguage === "auto" && code) {
      const detected = detectLanguage(code);
      setDetectedLanguage(detected);
    }
  }, [code, selectedLanguage]);

  const detectLanguage = (sourceCode) => {
    if (!sourceCode) return "javascript";
    const lower = sourceCode.toLowerCase();
    
    if (lower.includes("#include") || lower.includes("std::") || lower.includes("cout <<")) {
      return "cpp";
    }
    if (lower.includes("public class ") || lower.includes("system.out.print")) {
      return "java";
    }
    if (lower.includes("def ") || lower.includes("import ") || (lower.includes("print(") && !lower.includes("console.log"))) {
      if (lower.includes("elif ") || lower.includes("self.") || lower.includes("pass")) return "python";
    }
    if (lower.includes("fn ") || lower.includes("impl ") || lower.includes("let mut ")) {
      return "rust";
    }
    if (lower.includes("function ") || lower.includes("const ") || lower.includes("let ") || lower.includes("console.log")) {
      return "javascript";
    }
    
    if (/def\s+\w+\(/.test(sourceCode)) return "python";
    if (/#include\s+<\w+>/.test(sourceCode)) return "cpp";
    
    return "javascript";
  };

  const loadMockCustomAnalysis = () => {
    const codeLower = code.toLowerCase();
    let time = "O(1)";
    let space = "O(1)";
    let explanation = "This algorithm has constant time complexity because it runs in a single execution step without loops or recursion.";
    let optCode = code;
    let optExpl = "Your code is already running at optimal complexity! No further improvements were detected.";
    let heatmap = { 1: "low", 2: "low" };
    
    if (codeLower.includes("for") || codeLower.includes("while")) {
      const firstIndex = codeLower.indexOf("for");
      const secondIndex = codeLower.indexOf("for", firstIndex + 3);
      
      if (secondIndex !== -1 || codeLower.includes("nested") || codeLower.split("for").length > 2) {
        time = "O(N²)";
        space = "O(1)";
        explanation = "Detected nested loops. For an input of size N, the outer loop runs N times, and for each iteration, the inner loop runs up to N times, resulting in N * N = N² operations.";
        optCode = `// Optimized alternative (simulated)\nfunction optimizedAlgo() {\n  // Using a Hash Map to reduce search time to O(N)\n  const map = new Map();\n  // ...\n}`;
        optExpl = "We can optimize nested loops (O(N²)) by using a Hash Map to store previously visited elements. This allows us to perform lookups in O(1) time instead of nesting loops, reducing total runtime to O(N).";
        heatmap = { 1: "low", 2: "medium", 3: "high", 4: "high" };
      } else {
        time = "O(N)";
        space = "O(1)";
        explanation = "Detected a single loop that iterates over the input elements. The execution time grows linearly with the size of the input (N).";
        heatmap = { 1: "low", 2: "high", 3: "low" };
      }
    } else if (codeLower.includes("recurse") || codeLower.includes("fib") || codeLower.split("function").length > 2) {
      time = "O(2^N)";
      space = "O(N)";
      explanation = "Detected multiple recursive calls. The algorithm branches out twice for each recursive depth level, leading to exponential O(2^N) time complexity and O(N) call stack space complexity.";
      optCode = `// Optimized alternative using memoization\nconst memo = {};\nfunction optimizedAlgo(n) {\n  if (n in memo) return memo[n];\n  // ...\n}`;
      optExpl = "By caching recursive sub-calls in a Memoization lookup table, we avoid redundant calculations, improving performance from O(2^N) down to O(N) linear time.";
      heatmap = { 1: "low", 2: "medium", 3: "high" };
    }

    const mockResult = {
      timeComplexity: time,
      spaceComplexity: space,
      explanation: explanation,
      optimizedCode: optCode,
      optimizationExplanation: optExpl,
      heatmap: heatmap,
      simulation: [
        { line: 1, vars: { status: "Init" }, explanation: "Initializing custom simulation" },
        { line: 2, vars: { status: "Running", i: 0 }, explanation: "Starting main execution loop" },
        { line: 3, vars: { status: "Computing", i: 1 }, explanation: "Processing elements... (AI trace fallback)" },
        { line: 4, vars: { status: "Finishing" }, explanation: "Formatting final outputs" },
        { line: 5, vars: { status: "Returned" }, explanation: "Simulation completed successfully!" }
      ],
      quiz: [
        {
          stepIndex: 2,
          question: "In this custom simulation, what does N represent?",
          options: ["The input size", "The number of local variables", "The compiler speed", "The execution time in milliseconds"],
          answer: "The input size"
        }
      ]
    };

    setAnalysisResult(mockResult);
    setActiveStepIndex(0);
    setActiveSimLine(null);
    
    if (userContact) {
      addToHistory(time, space, mockResult);
    }
  };

  const addToHistory = (timeComp, spaceComp, result) => {
    let name = "Custom Code";
    if (selectedTemplate !== "custom") {
      name = mockAlgorithms.find((a) => a.id === selectedTemplate)?.name || "Template";
    } else {
      const firstLine = code.trim().split("\n")[0];
      name = firstLine.replace(/[\/\/|#|/\*]/g, "").trim().substring(0, 20) || "Custom Code";
    }

    const newItem = {
      name: name,
      language: selectedLanguage === "auto" ? detectedLanguage : selectedLanguage,
      timeComplexity: timeComp,
      spaceComplexity: spaceComp,
      code: code,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      optimizedCode: result.optimizedCode,
      optimizationExplanation: result.optimizationExplanation,
      explanation: result.explanation,
      heatmap: result.heatmap,
      simulation: result.simulation,
      quiz: result.quiz
    };

    setHistory((prev) => [newItem, ...prev.slice(0, 19)]);
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
        setActiveSimLine(null);
        
        if (userContact) {
          addToHistory(algo.timeComplexity, algo.spaceComplexity, algo);
        }
      }
      return;
    }

    setIsAnalyzing(true);
    setActiveSimLine(null);
    
    const targetLang = selectedLanguage === "auto" ? detectedLanguage : selectedLanguage;

    if (hasApiKey()) {
      try {
        const res = await analyzeCodeWithGemini(code, targetLang);
        setAnalysisResult(res);
        setActiveStepIndex(0);
        
        if (userContact) {
          addToHistory(res.timeComplexity, res.spaceComplexity, res);
        }
        alert("Gemini AI Analysis complete!");
      } catch (err) {
        alert("Failed to analyze with Gemini: " + err.message + "\n\nGenerating mock local analysis instead.");
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

  const handleSimulateTrigger = () => {
    if (userTier !== "premium") {
      alert("Execution simulation is a Paid Feature. Choose a payment package to continue.");
      setShowCheckout(true);
      return;
    }

    const isCustom = selectedTemplate === "custom";
    if (isCustom) {
      if (tokens <= 0) {
        alert("You have run out of simulation tokens! Please purchase more tokens.");
        setShowCheckout(true);
        return;
      }
      setTokens((t) => {
        const newCount = t - 1;
        updateDbUserTokens(userContact, newCount);
        return newCount;
      });
    }

    setActiveTab("simulator");
    setActiveStepIndex(0);
  };

  const updateDbUserTier = (contact, tier, tokenBalance) => {
    setUsersDb((prev) =>
      prev.map((u) => (u.contact === contact ? { ...u, tier, tokens: tokenBalance } : u))
    );
  };

  const updateDbUserTokens = (contact, tokenCount) => {
    setUsersDb((prev) =>
      prev.map((u) => (u.contact === contact ? { ...u, tokens: tokenCount } : u))
    );
  };

  const handlePurchase = () => {
    if (!userContact) {
      alert("Please log in first before buying subscription or tokens!");
      setShowCheckout(false);
      setShowLogin(true);
      return;
    }

    if (checkoutOption === "subscription") {
      setUserTier("premium");
      const newTokens = tokens + 70;
      setTokens(newTokens);
      updateDbUserTier(userContact, "premium", newTokens);
      alert("Subscription activated! ₹40 deducted. Added 70 tokens.");
    } else {
      const newTokens = tokens + 10;
      setTokens(newTokens);
      updateDbUserTokens(userContact, newTokens);
      alert("Added 10 tokens! ₹10 deducted.");
    }
    setShowCheckout(false);
  };

  const handleSendOtp = () => {
    if (!contactInput.trim()) {
      alert("Please enter a valid email address or mobile number.");
      return;
    }
    
    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setLoginStep("otp");
    }, 1000);
  };

  const handleVerifyOtp = () => {
    if (!otpInput) {
      alert("Please enter the 4-digit verification code.");
      return;
    }

    setUserContact(contactInput);
    
    const existing = usersDb.find((u) => u.contact === contactInput);
    if (existing) {
      setUserTier(existing.tier);
      setTokens(existing.tokens);
    } else {
      const newUser = {
        contact: contactInput,
        tier: "free",
        tokens: 0,
        signup: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setUsersDb((prev) => [...prev, newUser]);
      setUserTier("free");
      setTokens(0);
    }

    setShowLogin(false);
    setLoginStep("input");
    setContactInput("");
    setOtpInput("");
    alert("Verification successful! Logged in as: " + contactInput);
  };

  const handleLogout = () => {
    setUserContact(null);
    setUserTier("anonymous");
    setTokens(70);
    setHistory([]);
    alert("Logged out successfully.");
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

  const handleAdminToggleTier = (contact) => {
    setUsersDb((prev) =>
      prev.map((u) => {
        if (u.contact === contact) {
          const nextTier = u.tier === "free" ? "premium" : "free";
          const nextTokens = nextTier === "premium" ? 70 : 0;
          
          if (contact === userContact) {
            setUserTier(nextTier);
            setTokens(nextTokens);
          }
          return { ...u, tier: nextTier, tokens: nextTokens };
        }
        return u;
      })
    );
  };

  const handleAdminAddTokens = (contact) => {
    setUsersDb((prev) =>
      prev.map((u) => {
        if (u.contact === contact) {
          const newCount = u.tokens + 10;
          if (contact === userContact) {
            setTokens(newCount);
          }
          return { ...u, tokens: newCount };
        }
        return u;
      })
    );
  };

  const handleAdminDelete = (contact) => {
    if (contact === userContact) {
      handleLogout();
    }
    setUsersDb((prev) => prev.filter((u) => u.contact !== contact));
  };

  return (
    <div className="grid grid-cols-[200px_1fr] min-h-screen gap-4 p-4 max-w-[1550px] mx-auto max-lg:grid-cols-1">
      {/* Left Sidebar Ad + History */}
      <AdSidebar
        history={history}
        onLoadHistory={handleLoadHistory}
        userTier={userTier}
      />

      {/* Main App Workspace */}
      <main className="flex flex-col gap-4 overflow-hidden">
        <Header
          userTier={userTier}
          setUserTier={setUserTier}
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
        />

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
          />

          {/* Analysis Tab Panel */}
          <div className="glass-panel flex flex-col min-h-[540px]">
            <div className="flex border-b border-border-color bg-white/1 rounded-t-xl">
              <button
                className={`flex-1 bg-transparent border-b-2 border-transparent text-text-muted cursor-pointer text-xs font-medium py-3 flex items-center justify-center gap-1.5 transition-all duration-200 hover:text-text-main ${
                  activeTab === "complexity" ? "text-primary border-primary font-semibold bg-primary/3" : ""
                }`}
                onClick={() => setActiveTab("complexity")}
              >
                <BarChart2 size={14} />
                <span>Complexity</span>
              </button>
              <button
                className={`flex-1 bg-transparent border-b-2 border-transparent text-text-muted cursor-pointer text-xs font-medium py-3 flex items-center justify-center gap-1.5 transition-all duration-200 hover:text-text-main ${
                  activeTab === "optimizer" ? "text-primary border-primary font-semibold bg-primary/3" : ""
                }`}
                onClick={() => setActiveTab("optimizer")}
              >
                <Zap size={14} />
                <span>AI Optimizer</span>
              </button>
              <button
                className={`flex-1 bg-transparent border-b-2 border-transparent text-text-muted cursor-pointer text-xs font-medium py-3 flex items-center justify-center gap-1.5 transition-all duration-200 hover:text-text-main ${
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
              <div className="p-4 flex flex-col flex-1">
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

                    <div className="text-text-muted text-xs leading-relaxed" style={{ whiteSpace: "pre-wrap" }}>
                      {analysisResult.explanation || "No analysis generated yet. Click 'Analyze Complexity'."}
                    </div>

                    <ChartViewer timeComplexity={analysisResult.timeComplexity} />
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
                    tokens={tokens}
                    setTokens={setTokens}
                    isCustomCode={selectedTemplate === "custom"}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Admin User Management Drawer */}
        <div className="mt-4 border-t border-border-color pt-4">
          <div className="flex justify-between items-center cursor-pointer p-2 px-3 bg-white/2 border border-border-color rounded-lg" onClick={() => setIsAdminOpen(!isAdminOpen)}>
            <div className="flex items-center gap-2 text-[13px] font-semibold text-text-main">
              <Database size={15} className="text-primary" />
              <span>Simulated Database: User Administration Table</span>
            </div>
            <div className="text-xs text-text-muted">
              {isAdminOpen ? "Collapse [-]" : "Expand User Management Table [+]"}
            </div>
          </div>

          {isAdminOpen && (
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
                      <td className="p-2 px-3 border-b border-border-color text-text-muted">{user.signup}</td>
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
        </div>
      </main>

      {/* OTP Authentication Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-bg-main border border-border-color rounded-xl w-full max-w-[440px] shadow-glass-shadow overflow-hidden text-left">
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
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-bg-main border border-border-color rounded-xl w-full max-w-[440px] shadow-glass-shadow overflow-hidden text-left">
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
