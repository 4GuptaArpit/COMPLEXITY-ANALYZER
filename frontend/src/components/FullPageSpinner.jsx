import { Zap } from "lucide-react";

export default function FullPageSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-dark/95 backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent-primary to-accent-secondary animate-spin opacity-40 blur-sm"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-card-bg border border-border-color flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-accent-primary animate-pulse" />
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-col items-center gap-1">
        <span className="text-base font-bold text-text-main tracking-wide">BigO.ai</span>
        <span className="text-xs text-text-muted">Loading environment & workspace...</span>
      </div>
    </div>
  );
}
