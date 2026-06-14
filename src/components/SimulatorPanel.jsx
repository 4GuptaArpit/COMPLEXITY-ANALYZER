import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, Lock, HelpCircle, Check, X, Coins } from "lucide-react";

export default function SimulatorPanel({
  userTier,
  simulationSteps,
  quizzes,
  activeStepIndex,
  setActiveStepIndex,
  onOpenCheckout,
  tokens,
  setTokens,
  isCustomCode
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [changedVars, setChangedVars] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizStatus, setQuizStatus] = useState(""); // "correct" or "incorrect"
  const playIntervalRef = useRef(null);

  const totalSteps = simulationSteps ? simulationSteps.length : 0;
  const currentStep = simulationSteps ? simulationSteps[activeStepIndex] : null;

  // Track variable changes between steps to highlight them
  useEffect(() => {
    if (!simulationSteps || activeStepIndex === 0) {
      setChangedVars({});
      return;
    }

    const prevStep = simulationSteps[activeStepIndex - 1];
    const currStep = simulationSteps[activeStepIndex];
    
    if (prevStep && currStep) {
      const changes = {};
      Object.keys(currStep.vars || {}).forEach((key) => {
        if (prevStep.vars[key] !== currStep.vars[key]) {
          changes[key] = true;
        }
      });
      setChangedVars(changes);
      
      // Clear changed highlight after animation duration
      const timer = setTimeout(() => setChangedVars({}), 1000);
      return () => clearTimeout(timer);
    }
  }, [activeStepIndex, simulationSteps]);

  // Handle Play/Pause
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setActiveStepIndex((prev) => {
          // Check if next step is a quiz step before proceeding
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
      }, 1500); // 1.5 second steps
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, totalSteps, quizzes]);

  // Stop playing if we reach the end
  useEffect(() => {
    if (activeStepIndex >= totalSteps - 1) {
      setIsPlaying(false);
    }
  }, [activeStepIndex, totalSteps]);

  // Check if current step has an active quiz
  const activeQuiz = quizzes?.find((q) => q.stepIndex === activeStepIndex);

  // Reset quiz states when moving to a different step
  useEffect(() => {
    setSelectedAnswer(null);
    setQuizAnswered(false);
    setQuizStatus("");
  }, [activeStepIndex]);

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

  // Paid Premium Lock
  if (userTier !== "premium") {
    return (
      <div className="lock-overlay" style={{ marginTop: "10px" }}>
        <div className="lock-icon">
          <Lock size={28} />
        </div>
        <h3 className="lock-title">Unlock Step-by-Step Simulation</h3>
        <p className="lock-desc">
          Watch code execute line-by-line in real-time, view local variable states, analyze the call stack, and practice visual dry-runs with active quizzes.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "260px" }}>
          <button className="btn-primary" onClick={onOpenCheckout} style={{ justifyContent: "center" }}>
            <Coins size={16} />
            <span>Unlock Premium (₹40/mo)</span>
          </button>
          <button className="btn-secondary" onClick={onOpenCheckout} style={{ justifyContent: "center" }}>
            <span>Buy 10 Tokens (₹10)</span>
          </button>
        </div>
        <p className="option-desc" style={{ marginTop: "12px", fontSize: "0.7rem", color: "var(--text-dark)" }}>
          * Free templates simulation. Custom code simulations cost 1 token.
        </p>
      </div>
    );
  }

  if (!simulationSteps || totalSteps === 0) {
    return (
      <div className="lock-overlay" style={{ background: "rgba(0,0,0,0.1)", border: "1px dashed rgba(255,255,255,0.08)", marginTop: "10px" }}>
        <HelpCircle size={24} color="var(--text-muted)" style={{ marginBottom: "8px" }} />
        <h4 style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Ready to Simulate</h4>
        <p className="lock-desc" style={{ fontSize: "0.75rem", margin: "4px 0 0 0" }}>
          Click "Simulate Step-by-Step" on the sandbox editor to load the execution steps here.
        </p>
      </div>
    );
  }

  return (
    <div className="tab-content" style={{ padding: 0, marginTop: "10px" }}>
      {/* Simulation Tracker / Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <span className="option-desc">Simulation Console</span>
        {isCustomCode && (
          <span className="token-pill" style={{ padding: "3px 8px", fontSize: "0.7rem", margin: 0 }}>
            Active Simulation Token Used
          </span>
        )}
      </div>

      {/* Simulator Controls */}
      <div className="sim-controls">
        <button className="sim-btn" onClick={handleReset} title="Rewind">
          <RotateCcw size={14} />
        </button>

        <button className="sim-btn" onClick={handlePrev} disabled={activeStepIndex === 0} title="Previous Step">
          <ChevronLeft size={14} />
        </button>

        <span className="sim-progress-indicator">
          Step {activeStepIndex + 1} / {totalSteps}
        </span>

        {/* Play / Pause - disabled if there's an active quiz the user hasn't solved */}
        <button
          className="sim-btn"
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={activeStepIndex === totalSteps - 1 || (activeQuiz && !quizAnswered)}
          title={isPlaying ? "Pause" : "Play Auto"}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>

        <button
          className="sim-btn"
          onClick={handleNext}
          disabled={activeStepIndex === totalSteps - 1 || (activeQuiz && !quizAnswered)}
          title="Next Step"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Step Explanation */}
      {currentStep && (
        <div className="sim-step-explanation">
          {currentStep.explanation}
        </div>
      )}

      {/* Variable Watcher */}
      <div className="variables-section">
        <h4 className="section-label">Variable Monitor</h4>
        <div style={{ border: "1px solid var(--border-color)", borderRadius: "6px", overflow: "hidden" }}>
          <table className="table-glass">
            <thead>
              <tr>
                <th>Variable</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {currentStep && Object.entries(currentStep.vars || {}).map(([name, value]) => (
                <tr key={name}>
                  <td style={{ color: "var(--secondary)" }}>{name}</td>
                  <td className={changedVars[name] ? "var-changed" : ""}>
                    {typeof value === "object" ? JSON.stringify(value) : String(value)}
                  </td>
                </tr>
              ))}
              {(!currentStep || Object.keys(currentStep.vars || {}).length === 0) && (
                <tr>
                  <td colSpan="2" style={{ color: "var(--text-dark)", textAlign: "center" }}>
                    No active variables in scope
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Dry Run Quiz (Paid user exclusive interactive element) */}
      {activeQuiz && (
        <div className="quiz-card">
          <div className="quiz-question">
            <HelpCircle size={16} color="var(--accent-purple)" style={{ marginTop: "2px", flexShrink: 0 }} />
            <div>
              <strong>Dry-Run Quiz:</strong> {activeQuiz.question}
            </div>
          </div>
          <div className="quiz-options">
            {activeQuiz.options.map((opt) => {
              const isSelected = selectedAnswer === opt;
              const isAnswerCorrect = opt === activeQuiz.answer;
              
              let btnClass = "";
              if (quizAnswered) {
                if (isAnswerCorrect) btnClass = "correct";
                else if (isSelected) btnClass = "wrong";
              }

              return (
                <button
                  key={opt}
                  className={`quiz-opt-btn ${btnClass}`}
                  onClick={() => handleQuizAnswer(opt)}
                  disabled={quizAnswered}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {quizAnswered && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px", fontSize: "0.8rem" }}>
              {quizStatus === "correct" ? (
                <>
                  <Check size={16} color="var(--accent-green)" />
                  <span style={{ color: "var(--accent-green)", fontWeight: 600 }}>Correct!</span>
                  <span style={{ color: "var(--text-muted)" }}>You can now resume the simulation.</span>
                </>
              ) : (
                <>
                  <X size={16} color="var(--accent-red)" />
                  <span style={{ color: "var(--accent-red)", fontWeight: 600 }}>Incorrect.</span>
                  <span style={{ color: "var(--text-muted)" }}>Correct answer: <strong>{activeQuiz.answer}</strong></span>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
