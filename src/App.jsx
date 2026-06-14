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
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("BIGO_THEME") || "dark";
  });

  // User auth state
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
  
  // Users local database for table administration
  const [usersDb, setUsersDb] = useState(() => {
    const saved = localStorage.getItem("BIGO_USERS_DB");
    if (saved) return JSON.parse(saved);
    
    // Default initial mock database
    const defaults = [
      { contact: "alex.coder@gmail.com", tier: "free", tokens: 0, signup: "2026-06-12 14:32" },
      { contact: "+919988776655", tier: "premium", tokens: 70, signup: "2026-06-12 18:15" },
      { contact: "student_prep@edu.in", tier: "free", tokens: 0, signup: "2026-06-12 21:05" }
    ];
    localStorage.setItem("BIGO_USERS_DB", JSON.stringify(defaults));
    return defaults;
  });

  // History list state
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("BIGO_HISTORY");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedTemplate, setSelectedTemplate] = useState("bubble_sort");
  const [selectedLanguage, setSelectedLanguage] = useState("auto"); // Default is auto-detect
  const [detectedLanguage, setDetectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [activeTab, setActiveTab] = useState("complexity");
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeSimLine, setActiveSimLine] = useState(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutOption, setCheckoutOption] = useState("subscription");

  // Login Modal states
  const [showLogin, setShowLogin] = useState(false);
  const [loginStep, setLoginStep] = useState("input"); // 'input' | 'otp'
  const [contactInput, setContactInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Collapsible Admin drawer state
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

  // Sync theme class with body element
  useEffect(() => {
    document.body.className = theme === "light" ? "light-theme" : "";
    localStorage.setItem("BIGO_THEME", theme);
  }, [theme]);

  // Sync state changes back to localStorage
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

  // Load initial template on mount
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

  // Sync simulation highlights
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

  // Language auto-detection engine
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
    
    // Quick regex fallback checks
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
    
    // Add to history if logged in
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

    setHistory((prev) => [newItem, ...prev.slice(0, 19)]); // Limit to 20 history records
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
      // Deduct one token
      setTokens((t) => {
        const newCount = t - 1;
        // Update tokens inside usersDb table too
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

  // Login triggers
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

    // Login successful
    setUserContact(contactInput);
    
    // Check if user exists in database
    const existing = usersDb.find((u) => u.contact === contactInput);
    if (existing) {
      setUserTier(existing.tier);
      setTokens(existing.tokens);
    } else {
      // Create new user in users database
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

  // History load
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

  // Admin Dashboard Actions
  const handleAdminToggleTier = (contact) => {
    setUsersDb((prev) =>
      prev.map((u) => {
        if (u.contact === contact) {
          const nextTier = u.tier === "free" ? "premium" : "free";
          const nextTokens = nextTier === "premium" ? 70 : 0;
          
          // Update active states if this is the currently logged in user
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
    <div className="app-container">
      {/* Left Sidebar Ad + History */}
      <AdSidebar
        history={history}
        onLoadHistory={handleLoadHistory}
        userTier={userTier}
      />

      {/* Main App Workspace */}
      <main className="main-workspace">
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

        <div className="dashboard-grid">
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
          <div className="glass-panel" style={{ display: "flex", flexDirection: "column", minHeight: "540px" }}>
            <div className="tabs-header">
              <button
                className={`tab-btn ${activeTab === "complexity" ? "active" : ""}`}
                onClick={() => setActiveTab("complexity")}
              >
                <BarChart2 size={14} />
                <span>Complexity</span>
              </button>
              <button
                className={`tab-btn ${activeTab === "optimizer" ? "active" : ""}`}
                onClick={() => setActiveTab("optimizer")}
              >
                <Zap size={14} />
                <span>AI Optimizer</span>
              </button>
              <button
                className={`tab-btn ${activeTab === "simulator" ? "active" : ""}`}
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
              <div className="tab-content" style={{ display: "flex", flex: 1, flexDirection: "column" }}>
                {activeTab === "complexity" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "10px" }}>
                    <div className="badges-container">
                      <div className="badge-card time">
                        <div className="badge-icon">
                          <BarChart2 size={18} />
                        </div>
                        <div className="badge-info">
                          <span className="badge-label">Time Complexity</span>
                          <span className="badge-value">{analysisResult.timeComplexity}</span>
                        </div>
                      </div>

                      <div className="badge-card space">
                        <div className="badge-icon">
                          <BarChart2 size={18} />
                        </div>
                        <div className="badge-info">
                          <span className="badge-label">Space Complexity</span>
                          <span className="badge-value">{analysisResult.spaceComplexity}</span>
                        </div>
                      </div>
                    </div>

                    <div className="explanation-text" style={{ whiteSpace: "pre-wrap" }}>
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
        <div className="admin-drawer">
          <div className="admin-header" onClick={() => setIsAdminOpen(!isAdminOpen)}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", fontWeight: 600 }}>
              <Database size={15} color="var(--primary)" />
              <span>Simulated Database: User Administration Table</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {isAdminOpen ? "Collapse [-]" : "Expand User Management Table [+]"}
            </div>
          </div>

          {isAdminOpen && (
            <div className="admin-table-container glass-panel">
              <table className="table-admin">
                <thead>
                  <tr>
                    <th>Email / Mobile</th>
                    <th>Account Tier</th>
                    <th>Tokens Balance</th>
                    <th>Signup Time</th>
                    <th>Admin Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {usersDb.map((user) => (
                    <tr key={user.contact} style={user.contact === userContact ? { background: "rgba(99, 102, 241, 0.08)" } : {}}>
                      <td style={{ fontWeight: 600 }}>
                        {user.contact} {user.contact === userContact ? " (You)" : ""}
                      </td>
                      <td>
                        <span
                          className="logo-badge"
                          style={{
                            background: user.tier === "premium" ? "linear-gradient(135deg, var(--accent-purple), var(--primary))" : "var(--text-dark)",
                            padding: "2px 6px"
                          }}
                        >
                          {user.tier.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{user.tokens} Tokens</td>
                      <td style={{ color: "var(--text-muted)" }}>{user.signup}</td>
                      <td>
                        <button
                          className="admin-action-btn"
                          onClick={() => handleAdminToggleTier(user.contact)}
                        >
                          Toggle Tier
                        </button>
                        <button
                          className="admin-action-btn"
                          onClick={() => handleAdminAddTokens(user.contact)}
                        >
                          +10 Tokens
                        </button>
                        <button
                          className="admin-action-btn delete"
                          onClick={() => handleAdminDelete(user.contact)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {usersDb.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", color: "var(--text-dark)" }}>
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
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="card-title">
                <User size={18} color="var(--primary)" />
                <span>Verification Login Portal</span>
              </h3>
              <button className="close-btn" onClick={() => setShowLogin(false)}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              {loginStep === "input" ? (
                <>
                  <p className="explanation-text">
                    Enter your email address or mobile phone number. A 4-digit verification code will be simulated.
                  </p>
                  <div className="settings-input-group">
                    <label className="section-label">Email or Phone Number</label>
                    <input
                      type="text"
                      className="settings-input"
                      placeholder="e.g. dev@bigo.ai or +919999988888"
                      value={contactInput}
                      onChange={(e) => setContactInput(e.target.value)}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                    <button className="btn-secondary" onClick={() => setShowLogin(false)}>
                      Cancel
                    </button>
                    <button className="btn-primary" onClick={handleSendOtp} disabled={isSendingOtp}>
                      {isSendingOtp ? "Generating Code..." : "Send OTP"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="explanation-text">
                    OTP sent to <strong>{contactInput}</strong>! Enter the 4-digit verification code to log in.
                  </p>
                  <div className="settings-input-group">
                    <label className="section-label" style={{ color: "var(--accent-yellow)" }}>4-Digit Code</label>
                    <input
                      type="text"
                      maxLength="4"
                      className="settings-input"
                      style={{ textAlign: "center", fontSize: "1.2rem", letterSpacing: "8px", fontFamily: "var(--font-mono)" }}
                      placeholder="1234"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                  <p className="settings-help" style={{ color: "var(--accent-green)" }}>
                    💡 Pro-Tip: Enter <strong>1234</strong> (or any code) to simulate successful OTP verification!
                  </p>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                    <button className="btn-secondary" onClick={() => setLoginStep("input")}>
                      Back
                    </button>
                    <button className="btn-primary" onClick={handleVerifyOtp}>
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
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="card-title">
                <Coins size={18} color="var(--accent-yellow)" />
                <span>Unlock Advanced Features</span>
              </h3>
              <button className="close-btn" onClick={() => setShowCheckout(false)}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <p className="explanation-text" style={{ marginBottom: "20px" }}>
                Select a payment package to continue. Enjoy unrestricted access to step-by-step logic simulator.
              </p>

              <div className="checkout-cards">
                <div
                  className={`checkout-tier-option ${checkoutOption === "subscription" ? "selected" : ""}`}
                  onClick={() => setCheckoutOption("subscription")}
                >
                  <div className="option-details">
                    <span className="option-title">1 Month Premium Access</span>
                    <span className="option-desc">Includes 70 custom simulation tokens + infinite template runs</span>
                  </div>
                  <span className="option-price">₹40</span>
                </div>

                <div
                  className={`checkout-tier-option ${checkoutOption === "tokens" ? "selected" : ""}`}
                  onClick={() => setCheckoutOption("tokens")}
                >
                  <div className="option-details">
                    <span className="option-title">Buy 10 Tokens Pack</span>
                    <span className="option-desc">Custom inputs simulation (₹1 per simulation)</span>
                  </div>
                  <span className="option-price">₹10</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCheckout(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handlePurchase}>
                Proceed to Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
