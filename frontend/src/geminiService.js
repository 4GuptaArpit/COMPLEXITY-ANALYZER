// Service to communicate securely with the backend Gemini proxy for code complexity analysis, translation, and explanations.
import client from "./api/client";

export const analyzeCodeWithGemini = async (code, language) => {
  if (!code || !code.trim()) {
    throw new Error("Please provide code to analyze.");
  }

  try {
    const { data } = await client.post("/gemini/analyze", {
      code,
      language,
    });
    return data;
  } catch (error) {
    console.error("Analysis API Error:", error);
    const message = error.response?.data?.error || error.message || "Failed to analyze code with AI.";
    throw new Error(message);
  }
};

export const convertCodeWithGemini = async (code, sourceLanguage, targetLanguage) => {
  if (!code || !code.trim()) {
    throw new Error("Please provide code to convert.");
  }

  try {
    const { data } = await client.post("/gemini/convert", {
      code,
      sourceLanguage,
      targetLanguage,
    });
    return data;
  } catch (error) {
    console.error("Conversion API Error:", error);
    const message = error.response?.data?.error || error.message || "Failed to convert code with AI.";
    throw new Error(message);
  }
};

export const explainCodeWithGemini = async (code, language) => {
  if (!code || !code.trim()) {
    return "Code logic summary unavailable.";
  }

  try {
    const { data } = await client.post("/gemini/explain", {
      code,
      language,
    });
    return data.plainExplanation || "Code logic summary unavailable.";
  } catch (error) {
    console.error("Explain Code API Error:", error);
    return "Code logic summary unavailable.";
  }
};
