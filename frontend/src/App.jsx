import { useState, useEffect } from "react";
import { BarChart2, Zap, Play, Languages, Share2, Gauge } from "lucide-react";
import Header from "./components/Header";
import EditorPanel from "./components/EditorPanel";
import ChartViewer from "./components/ChartViewer";
import BenchmarkPanel from "./components/BenchmarkPanel";
import OptimizerPanel from "./components/OptimizerPanel";
import SimulatorPanel from "./components/SimulatorPanel";
import ConverterPanel from "./components/ConverterPanel";
import AuthModal from "./components/AuthModal";
import AdminPanel from "./components/AdminPanel";
import Footer from "./components/Footer";
import FullPageSpinner from "./components/FullPageSpinner";
import { useAuth } from "./context/AuthContext";
import { useToast } from "./context/ToastContext";
import { useAnalysis } from "./hooks/useAnalysis";
import { useShare } from "./hooks/useShare";
import client from "./api/client";

export default function App() {
  const { user, loading, logout, changePassword, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("BIGO_THEME");
    return saved === "desert" || saved === "rainy" ? saved : "desert";
  });

  const [activeTab, setActiveTab] = useState("complexity");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Sync theme to localStorage
  useEffect(() => {
    localStorage.setItem("BIGO_THEME", theme);
    document.body.className = theme === "rainy" ? "rainy-theme" : "";
  }, [theme]);

  // Load history from API for authenticated user
  const fetchHistory = async () => {
    if (!user) {
      setHistory([]);
      return;
    }
    try {
      const { data } = await client.get("/history");
      setHistory(data || []);
    } catch (err) {
      console.error("Failed to load user history", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const onHistorySaved = (newRecord) => {
    setHistory((prev) => [newRecord, ...prev.slice(0, 49)]);
  };

  const {
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
  } = useAnalysis(user, onHistorySaved);

  const { isSharing, shareAnalysis } = useShare();

  const handleShareClick = async () => {
    await shareAnalysis({
      code,
      language: detectedLanguage,
      analysisResult,
    });
  };

  const handleLoadHistory = (item) => {
    setCode(item.code);
    setAnalysisResult({
      timeComplexity: item.timeComplexity,
      spaceComplexity: item.spaceComplexity,
      explanation: item.explanation || "",
      optimizedCode: item.optimizedCode || "",
      optimizationExplanation: item.optimizationExplanation || "",
      heatmap: item.heatmap || {},
      simulation: item.simulation || [],
      quiz: item.quiz || [],
    });
    setActiveTab("complexity");
    showToast(`Loaded "${item.name || "Custom Code"}" from history!`, "success");
  };

  const handleDeleteHistory = async (id) => {
    try {
      await client.delete(`/history/${id}`);
      setHistory((prev) => prev.filter((item) => item._id !== id));
      showToast("History log removed successfully.", "success");
    } catch (err) {
      console.error("Failed to delete history log", err);
      showToast("Failed to delete history record.", "error");
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

  const activeExecutingLine =
    activeTab === "simulator"
      ? analysisResult.simulation?.[activeStepIndex]?.line || null
      : null;

  if (loading) {
    return <FullPageSpinner />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-dark text-text-main font-sans selection:bg-accent-primary/30 selection:text-text-main p-3 sm:p-5 max-w-[1550px] mx-auto w-full">
      {/* Header */}
      <Header
        user={user}
        theme={theme}
        setTheme={setTheme}
        userContact={user?.contact}
        onOpenLogin={() => setShowAuthModal(true)}
        onLogout={logout}
        history={history}
        onLoadHistory={handleLoadHistory}
        onDeleteHistory={handleDeleteHistory}
        onChangePassword={changePassword}
        onUpdateProfile={updateProfile}
        onOpenAdmin={() => setShowAdminPanel(true)}
      />

      {/* Main Grid Workspace */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4 flex-1 items-start">
        {/* Left Column: Code Editor */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <EditorPanel
            code={code}
            setCode={setCode}
            onAnalyze={handleAnalyze}
            onSimulate={handleSimulateTrigger}
            isAnalyzing={isAnalyzing}
            detectedLanguage={detectedLanguage}
            activeExecutingLine={activeExecutingLine}
          />
        </div>

        {/* Right Column: Dynamic Analysis Panels */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Action Tabs Bar */}
          <div className="glass-panel p-2 flex flex-wrap items-center justify-between gap-2 rounded-xl">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                className={`tab-btn flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg transition-all ${
                  activeTab === "complexity" ? "bg-accent-primary text-white shadow-sm" : "hover:bg-card-bg text-text-muted"
                }`}
                onClick={() => setActiveTab("complexity")}
              >
                <BarChart2 size={15} />
                <span>Complexity</span>
              </button>

              <button
                className={`tab-btn flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg transition-all ${
                  activeTab === "benchmark" ? "bg-accent-primary text-white shadow-sm" : "hover:bg-card-bg text-text-muted"
                }`}
                onClick={() => setActiveTab("benchmark")}
              >
                <Gauge size={15} />
                <span>Scale Benchmark</span>
              </button>

              <button
                className={`tab-btn flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg transition-all ${
                  activeTab === "optimizer" ? "bg-accent-primary text-white shadow-sm" : "hover:bg-card-bg text-text-muted"
                }`}
                onClick={() => setActiveTab("optimizer")}
              >
                <Zap size={15} />
                <span>AI Optimizer</span>
              </button>

              <button
                className={`tab-btn flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg transition-all ${
                  activeTab === "simulator" ? "bg-accent-primary text-white shadow-sm" : "hover:bg-card-bg text-text-muted"
                }`}
                onClick={() => setActiveTab("simulator")}
              >
                <Play size={15} />
                <span>Simulator Trace</span>
              </button>

              <button
                className={`tab-btn flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg transition-all ${
                  activeTab === "converter" ? "bg-accent-primary text-white shadow-sm" : "hover:bg-card-bg text-text-muted"
                }`}
                onClick={() => setActiveTab("converter")}
              >
                <Languages size={15} />
                <span>Polyglot Translator</span>
              </button>
            </div>

            {/* Share Snapshot Button */}
            <button
              onClick={handleShareClick}
              disabled={isSharing}
              className="p-1.5 px-3 rounded-lg bg-bg-dark/80 hover:bg-card-bg border border-border-color hover:border-accent-primary text-text-muted hover:text-text-main text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
              title="Generate shareable link snapshot"
            >
              <Share2 size={13} className={isSharing ? "animate-spin" : ""} />
              <span>{isSharing ? "Sharing..." : "Share"}</span>
            </button>
          </div>

          {/* Active Tab View */}
          <div className="glass-panel p-5 rounded-xl min-h-[560px] flex flex-col">
            {activeTab === "complexity" && (
              <ChartViewer
                timeComplexity={analysisResult.timeComplexity}
                spaceComplexity={analysisResult.spaceComplexity}
                explanation={analysisResult.explanation}
                plainExplanation={plainExplanation}
                staticAnalysis={staticAnalysis}
              />
            )}

            {activeTab === "benchmark" && (
              <BenchmarkPanel timeComplexity={analysisResult.timeComplexity} />
            )}

            {activeTab === "optimizer" && (
              <OptimizerPanel
                originalCode={code}
                optimizedCode={analysisResult.optimizedCode}
                explanation={analysisResult.optimizationExplanation}
                timeComplexity={analysisResult.timeComplexity}
                spaceComplexity={analysisResult.spaceComplexity}
                language={detectedLanguage}
              />
            )}

            {activeTab === "simulator" && (
              <SimulatorPanel
                simulationSteps={analysisResult.simulation}
                quizzes={analysisResult.quiz}
                activeStepIndex={activeStepIndex}
                setActiveStepIndex={setActiveStepIndex}
                code={code}
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
        </div>
      </main>

      {/* Footer */}
      <Footer onFeedbackSubmitted={fetchHistory} />

      {/* Modals */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      {user?.isAdmin && (
        <AdminPanel isOpen={showAdminPanel} onClose={() => setShowAdminPanel(false)} />
      )}
    </div>
  );
}
