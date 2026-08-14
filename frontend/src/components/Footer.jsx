import { useState } from "react";
import { Mail, Info, Send } from "lucide-react";
import { useToast } from "../context/ToastContext";
import client from "../api/client";


export default function Footer({ onFeedbackSubmitted }) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast("Please fill in all fields.", "warning");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showToast("Please enter a valid email address.", "warning");
      return;
    }

    try {
      await client.post("/feedback", {
        name: name.trim(),
        email: email.trim(),
        message: message.trim()
      });

      setName("");
      setEmail("");
      setMessage("");
      setSuccess(true);
      showToast("Thank you for your feedback!", "success");
      setTimeout(() => setSuccess(false), 3000);

      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || "Failed to submit feedback. Please try again later.";
      showToast(errMsg, "error");
    }
  };


  return (
    <footer className="mt-8 border-t border-border-color pt-6 pb-8 flex flex-col gap-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Left Side: Socials, Contact, Legal Links */}
        <div className="flex flex-col gap-4 text-left">
          <div>
            <h3 className="text-[15px] font-bold text-text-main">BigO.ai</h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-[380px]">
              The professional developer tool for time/space complexity calculations, code conversions, and interactive visual debugging.
            </p>
          </div>

          {/* Socials & Contacts */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-dark">
              Connect & Support
            </span>
            <div className="flex flex-wrap gap-4 items-center">
              <a
                href="mailto:support@bigo.ai"
                className="flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors"
              >
                <Mail size={13} />
                <span>support@bigo.ai</span>
              </a>

              <a
                href="https://x.com/bigo_ai_ref"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>@bigo_ai</span>
              </a>

              <a
                href="https://github.com/bigo-ai"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub</span>
              </a>

              <div className="relative inline-block">
                <button
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="bg-transparent border-none p-0 flex items-center gap-1 text-xs text-text-muted hover:text-primary transition-colors cursor-pointer"
                >
                  <Info size={13} />
                  <span>Contact Info</span>
                </button>
                {showTooltip && (
                  <div className="absolute bottom-6 left-0 z-50 w-[220px] p-2.5 rounded-lg border border-border-color bg-bg-main shadow-lg text-[10px] text-text-muted leading-relaxed">
                    <p className="font-semibold text-text-main mb-1">Corporate Details</p>
                    <p>BigO.ai Technologies Pvt. Ltd.</p>
                    <p>12th Floor, Cyber Heights, Sector-62</p>
                    <p>Noida, UP - 201301, India</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Legal Compliance Links */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-dark">
              Platform & Privacy
            </span>
            <div className="flex flex-wrap gap-3.5 text-[10.5px] text-text-muted">
              <a href="#privacy" className="hover:text-primary underline transition-colors">Privacy Policy</a>
              <a href="#terms" className="hover:text-primary underline transition-colors">Terms of Service</a>
            </div>
            <p className="text-[9.5px] text-text-dark mt-1">
              © 2026 BigO.ai. All rights reserved. Free developer tool for Big-O algorithm analysis & simulation.
            </p>
          </div>
        </div>


        {/* Right Side: Frosted Glass Feedback Form */}
        <div className="glass-panel p-4 border border-border-color rounded-xl bg-white/2 text-left">
          <h4 className="text-[12.5px] font-semibold text-text-main uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Info size={13} className="text-primary" /> Send Feedback
          </h4>
          <p className="text-[10px] text-text-muted mb-3 leading-relaxed">
            Have feature suggestions or bug reports? Let us know directly below.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                className="bg-black/20 border border-border-color rounded-md p-1.5 px-2.5 text-text-main outline-none text-xs focus:border-primary placeholder:opacity-50"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="email"
                className="bg-black/20 border border-border-color rounded-md p-1.5 px-2.5 text-text-main outline-none text-xs focus:border-primary placeholder:opacity-50"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <textarea
              className="bg-black/20 border border-border-color rounded-md p-1.5 px-2.5 text-text-main outline-none text-xs focus:border-primary h-[65px] resize-none placeholder:opacity-50"
              placeholder="Your feedback message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
            <div className="flex justify-between items-center mt-1">
              {success ? (
                <span className="text-[10px] text-accent-green font-semibold">
                  ✓ Feedback submitted successfully!
                </span>
              ) : (
                <span />
              )}
              <button
                type="submit"
                className="btn-primary py-1 px-4 text-[11px] font-semibold flex items-center gap-1"
              >
                <Send size={11} />
                <span>Submit</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </footer>
  );
}
