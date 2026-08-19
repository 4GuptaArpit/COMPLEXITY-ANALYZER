import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, Sparkles } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg-dark text-text-main flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md bg-card-bg border border-border-color rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
        <div className="p-3 rounded-2xl bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black font-mono tracking-tight text-text-main">404</h1>
        <h2 className="text-base font-bold text-text-main">Page Not Found</h2>
        <p className="text-xs text-text-muted leading-relaxed">
          The complexity analysis page or route you are looking for does not exist or may have been moved.
        </p>
        <Link
          to="/"
          className="mt-3 px-5 py-2.5 bg-accent-primary hover:bg-accent-primary/90 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to BigO.ai Workspace
        </Link>
      </div>
    </div>
  );
}
