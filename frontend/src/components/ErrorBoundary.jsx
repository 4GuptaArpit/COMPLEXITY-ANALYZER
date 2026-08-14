import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="bg-[#121827] border border-red-500/20 rounded-2xl p-8 max-w-[480px] w-full shadow-2xl flex flex-col items-center gap-4">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-400">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Application Error Encountered</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              BigO.ai encountered an unexpected runtime state. Your saved data is safe. Please click reload to restore execution.
            </p>

            {this.state.error?.message && (
              <div className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-left font-mono text-[11px] text-red-300 max-h-[120px] overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="mt-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 cursor-pointer hover:brightness-110 transition-all shadow-lg shadow-indigo-500/25"
            >
              <RefreshCw size={14} />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
