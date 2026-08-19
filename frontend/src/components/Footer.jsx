import { useState } from "react";
import { Info, Send, Shield, FileText, X, CheckCircle2, UserCheck, Mail } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import client from "../api/client";

export default function Footer({ onFeedbackSubmitted }) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [legalModal, setLegalModal] = useState(null); // 'privacy' | 'terms' | 'contact' | null

  // Prevent background page from moving/scrolling when legal/contact modal is active
  useBodyScrollLock(!!legalModal);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast("Please fill in all feedback fields.", "warning");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showToast("Please enter a valid email address.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      await client.post("/feedback", {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });

      setName("");
      setEmail("");
      setMessage("");
      showToast("Thank you for your feedback! It has been logged.", "success");

      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
    } catch (err) {
      console.error("Feedback submit error:", err);
      const errMsg = err.response?.data?.error || "Failed to submit feedback. Please try again.";
      showToast(errMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <footer className="mt-8 border-t border-border-color pt-6 pb-8 flex flex-col gap-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left Side: Brand, Platform, Legal Links */}
          <div className="flex flex-col gap-4 text-left">
            <div>
              <h3 className="text-[15px] font-bold text-text-main">BigO.ai</h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-[380px]">
                The professional developer tool for time & space complexity calculations, code conversions, and interactive visual debugging.
              </p>
            </div>

            {/* Platform & Navigation Links */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Platform & Support
              </span>
              <div className="flex flex-wrap gap-4 items-center text-xs text-text-muted">
                <button
                  onClick={() => setLegalModal("contact")}
                  className="hover:text-accent-primary underline transition-colors cursor-pointer bg-transparent border-none p-0 flex items-center gap-1.5 text-xs text-text-muted text-left"
                >
                  <Info size={13} className="text-accent-primary" />
                  <span>Contact Info</span>
                </button>
                <button
                  onClick={() => setLegalModal("privacy")}
                  className="hover:text-accent-primary underline transition-colors cursor-pointer bg-transparent border-none p-0 text-xs text-text-muted text-left"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => setLegalModal("terms")}
                  className="hover:text-accent-primary underline transition-colors cursor-pointer bg-transparent border-none p-0 text-xs text-text-muted text-left"
                >
                  Terms of Service
                </button>
              </div>
              <p className="text-[10px] text-text-muted/80 mt-1">
                © {new Date().getFullYear()} BigO.ai. All rights reserved. Free developer tool for Big-O algorithm analysis & simulation.
              </p>
            </div>
          </div>

          {/* Right Side: Feedback Form */}
          <div className="p-4.5 border border-border-color rounded-2xl bg-card-bg/60 shadow-lg text-left flex flex-col gap-3">
            <div>
              <h4 className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5 text-accent-primary">
                <Info size={13} /> Send Feedback
              </h4>
              <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                Have feature suggestions or bug reports? Let us know directly below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  className="bg-bg-dark/80 border border-border-color rounded-xl p-2 px-3 text-text-main outline-none text-xs focus:border-accent-primary placeholder:text-text-muted/50 transition-colors"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  required
                />
                <input
                  type="email"
                  className="bg-bg-dark/80 border border-border-color rounded-xl p-2 px-3 text-text-main outline-none text-xs focus:border-accent-primary placeholder:text-text-muted/50 transition-colors"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={150}
                  required
                />
              </div>
              <textarea
                className="bg-bg-dark/80 border border-border-color rounded-xl p-2 px-3 text-text-main outline-none text-xs focus:border-accent-primary h-[70px] resize-none placeholder:text-text-muted/50 transition-colors"
                placeholder="Your feedback message (suggestions, bugs, algorithm support requests)..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={2000}
                required
              />
              <div className="flex justify-end items-center mt-0.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-xl bg-accent-primary hover:bg-accent-primary/90 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Send size={12} />
                  <span>{isSubmitting ? "Submitting..." : "Submit Feedback"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </footer>

      {/* Info & Legal Modal (Contact, Privacy, Terms) */}
      {legalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-bg-dark border border-border-color rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-hidden text-left">
            <div className="flex items-center justify-between border-b border-border-color pb-3">
              <div className="flex items-center gap-2">
                {legalModal === "privacy" && <Shield className="w-5 h-5 text-accent-primary" />}
                {legalModal === "terms" && <FileText className="w-5 h-5 text-accent-primary" />}
                {legalModal === "contact" && <UserCheck className="w-5 h-5 text-accent-primary" />}
                <h3 className="text-base font-bold text-text-main">
                  {legalModal === "privacy" && "Privacy Policy"}
                  {legalModal === "terms" && "Terms of Service"}
                  {legalModal === "contact" && "Developer & Contact Details"}
                </h3>
              </div>
              <button
                onClick={() => setLegalModal(null)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-card-bg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto text-xs text-text-muted leading-relaxed flex flex-col gap-3 pr-1">
              {legalModal === "contact" && (
                <>
                  <div className="p-4 rounded-xl bg-card-bg/80 border border-border-color flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text-main text-sm">Arpit Gupta</span>
                      <span className="text-accent-primary font-medium text-xs">
                        Creator & Lead Developer — BigO.ai
                      </span>
                    </div>

                    <a
                      href="mailto:2004arpitgupta@gmail.com"
                      className="flex items-center gap-2 text-xs font-mono text-accent-primary hover:underline bg-accent-primary/10 border border-accent-primary/20 p-2 rounded-lg w-fit transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>2004arpitgupta@gmail.com</span>
                    </a>

                    <p className="text-text-muted mt-1 leading-relaxed">
                      BigO.ai is an intelligent complexity analysis, optimization comparison, and execution simulation workbench engineered for developers, educators, and software engineering interview preparation.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-card-bg/50 border border-border-color flex flex-col gap-1.5">
                    <span className="font-bold text-text-main">Feature Inquiries & Bug Reports</span>
                    <p>
                      You can reach out directly via email at <a href="mailto:2004arpitgupta@gmail.com" className="text-accent-primary underline">2004arpitgupta@gmail.com</a> or use the <strong>Send Feedback</strong> form in the footer to submit issues directly to the development backlog.
                    </p>
                  </div>
                </>
              )}

              {legalModal === "privacy" && (
                <>
                  <p className="font-semibold text-text-main">
                    Effective Date: {new Date().getFullYear()}
                  </p>
                  <p>
                    At <strong>BigO.ai</strong>, we respect developer privacy and data security. This privacy policy outlines how our platform operates:
                  </p>
                  <div className="p-3 rounded-xl bg-card-bg/80 border border-border-color flex flex-col gap-2">
                    <span className="font-bold text-text-main flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 1. Code Privacy & IP Protection
                    </span>
                    <p>
                      Your source code is submitted exclusively for ephemeral complexity analysis, translation, and step simulation. We <strong>do not sell, train open public models on, or publicly expose</strong> your proprietary algorithms without your explicit request to generate a share link.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-card-bg/80 border border-border-color flex flex-col gap-2">
                    <span className="font-bold text-text-main flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 2. Authentication & History Storage
                    </span>
                    <p>
                      Account passwords are encrypted using salted <strong>bcrypt (12 rounds)</strong>. If you are signed in, analysis logs are securely associated with your user ID and can be deleted at any time from your history panel.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-card-bg/80 border border-border-color flex flex-col gap-2">
                    <span className="font-bold text-text-main flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 3. Shared Snapshots
                    </span>
                    <p>
                      When you generate a shareable link via the Share button, an immutable snapshot is stored with a 30-day time-to-live (TTL) expiration index.
                    </p>
                  </div>
                </>
              )}

              {legalModal === "terms" && (
                <>
                  <p className="font-semibold text-text-main">
                    Effective Date: {new Date().getFullYear()}
                  </p>
                  <p>
                    By using <strong>BigO.ai</strong>, you agree to the following terms and guidelines:
                  </p>
                  <div className="p-3 rounded-xl bg-card-bg/80 border border-border-color flex flex-col gap-2">
                    <span className="font-bold text-text-main">1. Permitted Use</span>
                    <p>
                      BigO.ai is provided as an interactive software engineering aid for asymptotic time and space complexity evaluation, optimization comparisons, and execution simulation.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-card-bg/80 border border-border-color flex flex-col gap-2">
                    <span className="font-bold text-text-main">2. Asymptotic Heuristics & AI Disclaimers</span>
                    <p>
                      Complexity classifications are derived from static structural parsing and state-of-the-art LLM heuristics. Execution estimates are calibrated against a standard single-core theoretical compute budget (10⁸ operations/sec).
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-card-bg/80 border border-border-color flex flex-col gap-2">
                    <span className="font-bold text-text-main">3. Fair Use & Rate Limits</span>
                    <p>
                      Automated scraping or abusive request floods are restricted by automated IP rate limiters to protect shared server availability.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end border-t border-border-color pt-3">
              <button
                onClick={() => setLegalModal(null)}
                className="px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white text-xs font-semibold transition-all shadow-md cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
