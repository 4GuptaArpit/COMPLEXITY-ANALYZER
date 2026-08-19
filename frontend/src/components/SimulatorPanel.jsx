import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  HelpCircle,
  Check,
  X,
  Code2,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";

export default function SimulatorPanel({
  simulationSteps,
  quizzes,
  activeStepIndex,
  setActiveStepIndex,
  code = "",
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [changedVars, setChangedVars] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizStatus, setQuizStatus] = useState(""); // "correct" or "incorrect"
  const playIntervalRef = useRef(null);

  const totalSteps = simulationSteps ? simulationSteps.length : 0;
  const currentStep = simulationSteps ? simulationSteps[activeStepIndex] : null;

  // Extract source line corresponding to 1-indexed line number
  const codeLines = (code || "").split("\n");
  const activeLineNumber = currentStep?.line || 1;
  const activeLineCode = codeLines[activeLineNumber - 1] || "";

  // Render-time state adjustment on step change
  const [prevActiveStepIndex, setPrevActiveStepIndex] = useState(activeStepIndex);
  if (activeStepIndex !== prevActiveStepIndex) {
    setPrevActiveStepIndex(activeStepIndex);
    setSelectedAnswer(null);
    setQuizAnswered(false);
    setQuizStatus("");
    if (activeStepIndex === 0) {
      setChangedVars({});
    }
  }

  if (activeStepIndex >= totalSteps - 1 && isPlaying) {
    setIsPlaying(false);
  }

  // Track variable changes between steps to highlight newly mutated variables
  useEffect(() => {
    if (!simulationSteps || activeStepIndex === 0) {
      return;
    }

    const prevStep = simulationSteps[activeStepIndex - 1];
    const currStep = simulationSteps[activeStepIndex];

    if (prevStep && currStep) {
      const changes = {};
      Object.keys(currStep.vars || {}).forEach((key) => {
        if (prevStep.vars?.[key] !== currStep.vars?.[key]) {
          changes[key] = true;
        }
      });

      const updateTimer = setTimeout(() => {
        setChangedVars(changes);
      }, 0);

      const clearTimer = setTimeout(() => setChangedVars({}), 1800);

      return () => {
        clearTimeout(updateTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [activeStepIndex, simulationSteps]);

  // Handle Auto Play / Pause
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setActiveStepIndex((prev) => {
          const nextIndex = prev + 1;
          const hasQuiz = quizzes?.some((q) => q.stepIndex === nextIndex);

          if (hasQuiz) {
            setIsPlaying(false);
            return nextIndex;
          }

          if (nextIndex >= totalSteps) {
            setIsPlaying(false);
            return prev;
          }
          return nextIndex;
        });
      }, 2000);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, totalSteps, quizzes, setActiveStepIndex]);

  const activeQuiz = quizzes?.find((q) => q.stepIndex === activeStepIndex);

  const handleNext = () => {
    if (activeStepIndex < totalSteps - 1) {
      setActiveStepIndex(activeStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(activeStepIndex - 1);
    }
  };

  const handleReset = () => {
    setActiveStepIndex(0);
    setIsPlaying(false);
  };

  const handleQuizAnswer = (option) => {
    if (quizAnswered) return;

    setSelectedAnswer(option);
    setQuizAnswered(true);

    if (option === activeQuiz.answer) {
      setQuizStatus("correct");
    } else {
      setQuizStatus("incorrect");
    }
  };

  if (!simulationSteps || totalSteps === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center flex-1 bg-black/10 rounded-2xl border border-dashed border-border-color mt-2.5">
        <div className="p-3.5 rounded-2xl bg-accent-primary/10 text-accent-primary border border-accent-primary/20 mb-3">
          <Activity size={28} />
        </div>
        <h4 className="text-sm font-bold text-text-main">Ready to Trace Execution</h4>
        <p className="text-xs text-text-muted max-w-[340px] mt-1 leading-relaxed">
          Click <strong className="text-accent-primary">"Simulate Step-by-Step"</strong> or <strong className="text-accent-primary">"Analyze Complexity"</strong> to generate the interactive variable dry-run timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Simulation Console Top Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-card-bg via-bg-dark/80 to-card-bg border border-border-color p-3 rounded-2xl shadow-sm">
        {/* Step Progress Info */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-main">
                Step {activeStepIndex + 1} of {totalSteps}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-primary/20 text-accent-primary font-mono font-bold">
                Line {activeLineNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1.5">
          <button
            className="p-1.5 px-2.5 rounded-lg bg-bg-dark hover:bg-card-bg border border-border-color text-text-muted hover:text-text-main transition-all text-xs"
            onClick={handleReset}
            title="Rewind to Step 1"
          >
            <RotateCcw size={13} />
          </button>

          <button
            className="p-1.5 px-2.5 rounded-lg bg-bg-dark hover:bg-card-bg border border-border-color text-text-muted hover:text-text-main transition-all text-xs disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={handlePrev}
            disabled={activeStepIndex === 0}
            title="Previous Step"
          >
            <ChevronLeft size={14} />
          </button>

          <button
            className={`p-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              isPlaying
                ? "bg-amber-500 text-black hover:bg-amber-400"
                : "bg-accent-primary text-white hover:bg-accent-primary/90"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={activeStepIndex === totalSteps - 1 || (activeQuiz && !quizAnswered)}
            title={isPlaying ? "Pause playback" : "Auto play simulation"}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </button>

          <button
            className="p-1.5 px-2.5 rounded-lg bg-bg-dark hover:bg-card-bg border border-border-color text-text-muted hover:text-text-main transition-all text-xs disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={handleNext}
            disabled={activeStepIndex === totalSteps - 1 || (activeQuiz && !quizAnswered)}
            title="Next Step"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Timeline Stepper Dots */}
      <div className="flex items-center gap-1.5 px-1 overflow-x-auto py-1">
        {simulationSteps.map((step, idx) => {
          const isCurrent = idx === activeStepIndex;
          const isPassed = idx < activeStepIndex;
          return (
            <button
              key={idx}
              onClick={() => setActiveStepIndex(idx)}
              className={`h-2 rounded-full transition-all flex-1 min-w-[14px] ${
                isCurrent
                  ? "bg-accent-primary shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.6)] h-2.5"
                  : isPassed
                  ? "bg-accent-primary/40 hover:bg-accent-primary/60"
                  : "bg-border-color/60 hover:bg-border-color"
              }`}
              title={`Jump to Step ${idx + 1} (Line ${step.line})`}
            />
          );
        })}
      </div>

      {/* Active Executing Code Snippet Banner */}
      <div className="border border-accent-primary/30 rounded-xl overflow-hidden bg-[#282c34] shadow-md flex flex-col">
        <div className="p-2 px-3.5 bg-black/40 border-b border-border-color flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-primary"></span>
            </span>
            <span className="text-[11px] font-bold text-accent-primary uppercase tracking-wider font-mono">
              ▶ Currently Executing Line {activeLineNumber}
            </span>
          </div>
          <span className="text-[10px] text-text-muted font-mono">
            {activeStepIndex + 1} / {totalSteps}
          </span>
        </div>

        <div className="p-3 px-4 text-xs font-mono text-text-main bg-accent-primary/5 flex items-center gap-3 overflow-x-auto">
          <span className="text-text-muted select-none font-bold text-[11px] min-w-[24px]">
            {activeLineNumber} |
          </span>
          <code className="text-emerald-400 font-semibold whitespace-pre">
            {activeLineCode.trim() || "// Execution scope transition"}
          </code>
        </div>
      </div>

      {/* Step Explanation Callout */}
      {currentStep && (
        <div className="p-3.5 rounded-xl bg-card-bg border border-border-color flex flex-col gap-1.5 shadow-sm border-l-4 border-l-accent-primary">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-accent-primary">
            <Sparkles size={13} />
            <span>Why This Step Executes</span>
          </div>
          <p className="text-xs text-text-main leading-relaxed">
            {currentStep.explanation}
          </p>
        </div>
      )}

      {/* Variable Scope & State Inspector */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Layers size={13} className="text-purple-400" /> Active Variable Monitor
          </h4>
          <span className="text-[10px] text-text-muted">
            {Object.keys(currentStep?.vars || {}).length} variable(s) in scope
          </span>
        </div>

        <div className="border border-border-color rounded-xl overflow-hidden bg-bg-dark/60 shadow-sm">
          <table className="w-full border-collapse text-xs text-left">
            <thead>
              <tr className="bg-bg-dark/90 text-text-muted border-b border-border-color">
                <th className="p-2.5 px-3.5 font-semibold text-[11px]">Variable</th>
                <th className="p-2.5 px-3.5 font-semibold text-[11px]">Current Memory State</th>
                <th className="p-2.5 px-3.5 font-semibold text-[11px] text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color/50">
              {currentStep &&
                Object.entries(currentStep.vars || {}).map(([name, value]) => {
                  const isMutated = changedVars[name];
                  return (
                    <tr
                      key={name}
                      className={`transition-colors ${
                        isMutated ? "bg-accent-primary/10" : "hover:bg-card-bg/40"
                      }`}
                    >
                      <td className="p-2.5 px-3.5 font-mono font-bold text-secondary">
                        {name}
                      </td>
                      <td className="p-2.5 px-3.5 font-mono text-text-main font-semibold">
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            isMutated
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "text-text-main"
                          }`}
                        >
                          {typeof value === "object" ? JSON.stringify(value) : String(value)}
                        </span>
                      </td>
                      <td className="p-2.5 px-3.5 text-right">
                        {isMutated ? (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                            MODIFIED
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-text-muted">
                            In Scope
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              {(!currentStep || Object.keys(currentStep.vars || {}).length === 0) && (
                <tr>
                  <td colSpan="3" className="p-6 text-center text-text-muted">
                    No variables in current scope.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Dry Run Quiz */}
      {activeQuiz && (
        <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-4 shadow-sm flex flex-col gap-3">
          <div className="text-xs font-semibold text-text-main flex items-start gap-2">
            <HelpCircle size={16} className="text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-purple-300">Dry-Run Checkpoint:</strong> {activeQuiz.question}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {activeQuiz.options.map((opt) => {
              const isSelected = selectedAnswer === opt;
              const isAnswerCorrect = opt === activeQuiz.answer;

              let btnClass = "";
              if (quizAnswered) {
                if (isAnswerCorrect)
                  btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-semibold";
                else if (isSelected)
                  btnClass = "bg-red-500/20 border-red-500 text-red-400";
              }

              return (
                <button
                  key={opt}
                  className={`bg-card-bg border border-border-color rounded-lg p-2.5 text-xs text-text-muted text-left cursor-pointer transition-all duration-200 hover:bg-white/5 hover:text-text-main disabled:cursor-not-allowed ${btnClass}`}
                  onClick={() => handleQuizAnswer(opt)}
                  disabled={quizAnswered}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {quizAnswered && (
            <div className="flex items-center gap-2 mt-1 text-xs">
              {quizStatus === "correct" ? (
                <>
                  <Check size={16} className="text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Correct!</span>
                  <span className="text-text-muted">You can resume stepping through the simulation.</span>
                </>
              ) : (
                <>
                  <X size={16} className="text-red-400" />
                  <span className="text-red-400 font-bold">Incorrect.</span>
                  <span className="text-text-muted">
                    Correct answer: <strong className="text-text-main">{activeQuiz.answer}</strong>
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
