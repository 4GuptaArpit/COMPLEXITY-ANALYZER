import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const ICONS = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0" style={{ width: "16px", height: "16px" }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0" style={{ width: "16px", height: "16px" }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0" style={{ width: "16px", height: "16px" }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0" style={{ width: "16px", height: "16px" }}>
      <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
    </svg>
  ),
};

const STYLES = {
  success: "bg-[#0d2318] border-accent-green/40 text-accent-green",
  error:   "bg-[#2a0d0d] border-accent-red/40 text-accent-red",
  warning: "bg-[#2a1f00] border-accent-yellow/40 text-accent-yellow",
  info:    "bg-[#0d1a2a] border-primary/40 text-primary",
};

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-[360px] w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 p-3 px-4 rounded-xl border shadow-lg backdrop-blur-md pointer-events-auto text-sm font-medium leading-snug ${STYLES[t.type] || STYLES.info}`}
          style={{
            animation: "fadeInUp 0.25s ease-out",
            display: "flex",
            alignItems: "center",
            border: "1px solid",
            borderRadius: "0.75rem",
            padding: "0.75rem 1rem",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)"
          }}
        >
          {ICONS[t.type] || ICONS.info}
          <span className="flex-1 opacity-90 text-white ml-2">{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            className="bg-transparent border-none cursor-pointer text-gray-400 hover:text-white transition-colors ml-2 mt-0.5 shrink-0"
            aria-label="Dismiss"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5" style={{ width: "14px", height: "14px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
