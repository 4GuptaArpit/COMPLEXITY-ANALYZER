import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Sparkles, ArrowLeft, Copy, Check, TrendingUp, Code2, Clock } from "lucide-react";
import client from "../api/client";
import { parseMarkdown } from "../utils/markdownParser";
import { useToast } from "../context/ToastContext";
import BenchmarkPanel from "../components/BenchmarkPanel";

export default function SharePage() {
  const { id } = useParams();
  const { showToast } = useToast();

  const [shareData, setShareData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSharedSnapshot = async () => {
      try {
        const { data } = await client.get(`/share/${id}`);
        setShareData(data);
      } catch (err) {
        console.error("Failed to load share snapshot", err);
        setError("This shared complexity snapshot could not be found or has expired (links expire after 30 days).");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedSnapshot();
  }, [id]);

  const handleCopyCode = () => {
    if (!shareData?.code) return;
    navigator.clipboard.writeText(shareData.code);
    setCopied(true);
    showToast("Code copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-bg-dark text-text-main">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-accent-primary animate-spin" />
          <span className="text-sm font-semibold">Retrieving shared algorithm snapshot...</span>
        </div>
      </div>
    );
  }

  if (error || !shareData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-bg-dark text-text-main text-center">
        <div className="max-w-md bg-card-bg border border-border-color rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
          <div className="p-3 rounded-xl bg-red-500/10 text-red-400">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-text-main">Snapshot Unavailable</h2>
          <p className="text-xs text-text-muted leading-relaxed">{error}</p>
          <Link
            to="/"
            className="mt-2 px-5 py-2.5 bg-accent-primary hover:bg-accent-primary/90 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Open BigO.ai Workspace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark text-text-main p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-5xl flex flex-col gap-6">
        {/* Top Navbar */}
        <div className="flex items-center justify-between border-b border-border-color pb-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-accent-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to BigO.ai Workspace
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-mono">Shared Snapshot</span>
            <span className="px-2 py-0.5 rounded bg-accent-primary/10 text-accent-primary font-mono text-[11px] font-bold uppercase">
              {shareData.language}
            </span>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-card-bg border border-border-color rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-accent-primary" />
              Algorithm Complexity Snapshot
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Shared analysis snapshot created with BigO.ai
            </p>
          </div>

          {/* Complexity Badges */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-accent-primary/10 border border-accent-primary/30 flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-accent-primary tracking-wider">Time</span>
              <span className="text-lg font-mono font-black text-text-main">{shareData.timeComplexity}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Space</span>
              <span className="text-lg font-mono font-black text-text-main">{shareData.spaceComplexity}</span>
            </div>
          </div>
        </div>

        {/* Code & Explanation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Viewer */}
          <div className="bg-card-bg border border-border-color rounded-2xl p-5 shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-border-color pb-3">
              <span className="text-xs font-bold text-text-main flex items-center gap-2">
                <Code2 className="w-4 h-4 text-accent-primary" />
                Source Implementation ({shareData.language.toUpperCase()})
              </span>
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 rounded-lg bg-bg-dark border border-border-color text-xs font-semibold text-text-muted hover:text-text-main hover:border-accent-primary transition-all flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Code"}
              </button>
            </div>
            <pre className="p-4 bg-bg-dark/90 rounded-xl overflow-x-auto text-xs font-mono text-text-main leading-relaxed border border-border-color max-h-[380px]">
              <code>{shareData.code}</code>
            </pre>
          </div>

          {/* Explanation Viewer */}
          <div className="bg-card-bg border border-border-color rounded-2xl p-5 shadow-lg flex flex-col gap-3">
            <span className="text-xs font-bold text-text-main flex items-center gap-2 border-b border-border-color pb-3">
              <TrendingUp className="w-4 h-4 text-accent-primary" />
              Asymptotic Breakdown & Explanation
            </span>
            <div className="text-xs text-text-muted leading-relaxed overflow-y-auto max-h-[380px] p-2 bg-bg-dark/40 rounded-xl border border-border-color">
              {parseMarkdown(shareData.explanation || "No explanation provided for this snapshot.")}
            </div>
          </div>
        </div>

        {/* Interactive Scalability Benchmark Simulator */}
        <BenchmarkPanel timeComplexity={shareData.timeComplexity} />
      </div>
    </div>
  );
}
