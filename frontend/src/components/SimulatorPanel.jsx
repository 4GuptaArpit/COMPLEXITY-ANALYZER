import { useState, useEffect, useRef } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, Lock, HelpCircle, Check, X, Coins } from "lucide-react";

export default function SimulatorPanel({
  simulationSteps,
  quizzes,
  activeStepIndex,
  setActiveStepIndex,
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

  // Render-time state adjustment on step change (replaces synchronous useEffect calls)
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

  // Track variable changes between steps to highlight them
  useEffect(() => {
    if (!simulationSteps || activeStepIndex === 0) {
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
      
      const updateTimer = setTimeout(() => {
        setChangedVars(changes);
      }, 0);
      
      // Clear changed highlight after animation duration
      const clearTimer = setTimeout(() => setChangedVars({}), 1000);
      
      return () => {
        clearTimeout(updateTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [activeStepIndex, simulationSteps]);

  // Handle Play/Pause
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
      }, 1500);
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
      <div className="flex flex-col items-center justify-center p-8 text-center flex-1 bg-black/10 rounded-lg border border-dashed border-border-color mt-2.5">
        <HelpCircle size={24} className="text-text-muted mb-2" />
        <h4 className="text-sm font-semibold text-text-muted">Ready to Simulate</h4>
        <p className="text-xs text-text-dark max-w-[300px] mt-1 leading-relaxed">
          Click "Simulate Step-by-Step" on the sandbox editor to load the execution steps here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col mt-2.5">
      {/* Simulation Tracker / Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Simulation Console</span>
        {isCustomCode && (
          <span className="flex items-center gap-1 bg-accent-yellow/10 border border-accent-yellow/20 text-accent-yellow text-[10px] font-semibold px-2 py-0.5 rounded-full">
            Active Simulation Token Used
          </span>
        )}
      </div>

      {/* Simulator Controls */}
      <div className="flex items-center justify-center gap-2 mb-3 bg-white/1 border border-border-color p-1.5 rounded-lg">
        <button className="bg-white/4 border border-border-color text-text-main p-1 px-2.5 rounded-md cursor-pointer text-xs transition-all duration-200 hover:bg-gray-500/15" onClick={handleReset} title="Rewind">
          <RotateCcw size={14} />
        </button>

        <button className="bg-white/4 border border-border-color text-text-main p-1 px-2.5 rounded-md cursor-pointer text-xs transition-all duration-200 hover:bg-gray-500/15 disabled:opacity-40 disabled:cursor-not-allowed" onClick={handlePrev} disabled={activeStepIndex === 0} title="Previous Step">
          <ChevronLeft size={14} />
        </button>

        <span className="text-xs font-semibold text-text-muted min-w-[80px] text-center">
          Step {activeStepIndex + 1} / {totalSteps}
        </span>

        <button
          className="bg-white/4 border border-border-color text-text-main p-1 px-2.5 rounded-md cursor-pointer text-xs transition-all duration-200 hover:bg-gray-500/15 disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={activeStepIndex === totalSteps - 1 || (activeQuiz && !quizAnswered)}
          title={isPlaying ? "Pause" : "Play Auto"}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>

        <button
          className="bg-white/4 border border-border-color text-text-main p-1 px-2.5 rounded-md cursor-pointer text-xs transition-all duration-200 hover:bg-gray-500/15 disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={handleNext}
          disabled={activeStepIndex === totalSteps - 1 || (activeQuiz && !quizAnswered)}
          title="Next Step"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Step Explanation */}
      {currentStep && (
        <div className="bg-primary/5 border border-primary/15 rounded-lg p-3 text-xs text-text-main leading-relaxed mb-3 border-l-2 border-l-primary">
          {currentStep.explanation}
        </div>
      )}

      {/* Variables Monitor */}
      <div className="flex flex-col gap-2 mb-3">
        <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Variable Monitor</h4>
        <div className="border border-border-color rounded-md overflow-hidden bg-black/5">
          <table className="w-full border-collapse text-xs text-left">
            <thead>
              <tr>
                <th className="p-2 px-3 border-b border-border-color font-semibold text-text-muted bg-white/2">Variable</th>
                <th className="p-2 px-3 border-b border-border-color font-semibold text-text-muted bg-white/2">Value</th>
              </tr>
            </thead>
            <tbody>
              {currentStep && Object.entries(currentStep.vars || {}).map(([name, value]) => (
                <tr key={name} className="hover:bg-white/2">
                  <td className="p-2 px-3 border-b border-border-color font-mono text-secondary">{name}</td>
                  <td className={`p-2 px-3 border-b border-border-color font-mono ${changedVars[name] ? "var-changed" : ""}`}>
                    {typeof value === "object" ? JSON.stringify(value) : String(value)}
                  </td>
                </tr>
              ))}
              {(!currentStep || Object.keys(currentStep.vars || {}).length === 0) && (
                <tr>
                  <td colSpan="2" className="p-4 border-b border-border-color text-center text-text-dark">
                    No active variables in scope
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Dry Run Quiz */}
      {activeQuiz && (
        <div className="bg-accent-purple/5 border border-accent-purple/20 rounded-lg p-4 mt-2.5">
          <div className="text-xs font-semibold mb-3 text-text-main flex items-start gap-2">
            <HelpCircle size={16} className="text-accent-purple shrink-0 mt-0.5" />
            <div>
              <strong>Dry-Run Quiz:</strong> {activeQuiz.question}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {activeQuiz.options.map((opt) => {
              const isSelected = selectedAnswer === opt;
              const isAnswerCorrect = opt === activeQuiz.answer;
              
              let btnClass = "";
              if (quizAnswered) {
                if (isAnswerCorrect) btnClass = "bg-accent-green/15 border-accent-green text-accent-green font-semibold";
                else if (isSelected) btnClass = "bg-accent-red/15 border-accent-red text-accent-red";
              }

              return (
                <button
                  key={opt}
                  className={`bg-white/3 border border-border-color rounded-md p-2 text-xs text-text-muted text-left cursor-pointer transition-all duration-200 hover:bg-white/8 hover:text-text-main disabled:cursor-not-allowed ${btnClass}`}
                  onClick={() => handleQuizAnswer(opt)}
                  disabled={quizAnswered}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {quizAnswered && (
            <div className="flex items-center gap-2 mt-3 text-xs">
              {quizStatus === "correct" ? (
                <>
                  <Check size={16} className="text-accent-green" />
                  <span className="text-accent-green font-bold">Correct!</span>
                  <span className="text-text-muted">You can now resume the simulation.</span>
                </>
              ) : (
                <>
                  <X size={16} className="text-accent-red" />
                  <span className="text-accent-red font-bold">Incorrect.</span>
                  <span className="text-text-muted">Correct answer: <strong>{activeQuiz.answer}</strong></span>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
