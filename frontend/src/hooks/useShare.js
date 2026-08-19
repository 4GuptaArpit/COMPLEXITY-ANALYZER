import { useState } from "react";
import client from "../api/client";
import { useToast } from "../context/ToastContext";

export function useShare() {
  const { showToast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const shareAnalysis = async ({ code, language, analysisResult }) => {
    if (!code || !code.trim()) {
      showToast("Please enter code first before sharing.", "warning");
      return null;
    }

    if (!analysisResult?.timeComplexity) {
      showToast("Please run 'Analyze Complexity' before sharing — the snapshot requires complexity data.", "warning");
      return null;
    }

    setIsSharing(true);
    try {
      const { data } = await client.post("/share", {
        code,
        language: language || "javascript",
        timeComplexity: analysisResult.timeComplexity,
        spaceComplexity: analysisResult.spaceComplexity,
        explanation: analysisResult.explanation,
        optimizedCode: analysisResult.optimizedCode,
        optimizationExplanation: analysisResult.optimizationExplanation,
        heatmap: analysisResult.heatmap,
      });

      const fullShareUrl = `${window.location.origin}/share/${data.shortId}`;
      await navigator.clipboard.writeText(fullShareUrl);
      showToast("Shareable snapshot link copied to clipboard!", "success");
      return data.shortId;
    } catch (err) {
      console.error("Share error:", err);
      showToast(err.response?.data?.error || "Failed to generate share link.", "error");
      return null;
    } finally {
      setIsSharing(false);
    }
  };

  return {
    isSharing,
    shareAnalysis,
  };
}
