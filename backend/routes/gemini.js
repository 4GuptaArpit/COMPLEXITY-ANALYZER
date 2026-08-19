import express from "express";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load backend .env relative to this file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const router = express.Router();

// Dedicated rate limiter for AI generation routes to protect quota and backend resources
const geminiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many AI analysis requests from this IP. Please try again after a few minutes." },
});

router.use(geminiLimiter);

const sanitizeJsonResponse = (text) => {
  if (!text) return "";
  let clean = text.trim();
  clean = clean.replace(/^```(?:json)?\s*/i, "");
  clean = clean.replace(/\s*```$/i, "");
  return clean.trim();
};

/**
 * Resolves the dedicated API key based on the specific service type (analyze, convert, explain)
 * with robust fallbacks.
 */
const getApiKeyForService = (service = "analyze") => {
  // Always refresh .env in case it was modified
  dotenv.config({ path: path.resolve(__dirname, "../.env") });

  const envKeyMap = {
    analyze: [
      process.env.GEMINI_KEY_ANALYZE,
      process.env.VITE_GEMINI_KEY_ANALYZE,
      process.env.GEMINI_API_KEY,
      process.env.VITE_GEMINI_KEY,
    ],
    convert: [
      process.env.GEMINI_KEY_CONVERT,
      process.env.VITE_GEMINI_KEY_CONVERT,
      process.env.GEMINI_KEY_ANALYZE,
      process.env.GEMINI_API_KEY,
    ],
    explain: [
      process.env.GEMINI_KEY_EXPLAIN,
      process.env.VITE_GEMINI_KEY_EXPLAIN,
      process.env.GEMINI_KEY_ANALYZE,
      process.env.GEMINI_API_KEY,
    ],
  };

  const candidates = envKeyMap[service] || envKeyMap.analyze;
  for (const key of candidates) {
    if (key && typeof key === "string" && key.trim()) {
      return key.trim();
    }
  }

  // Fallback: Read directly from backend/.env file if process.env wasn't updated
  try {
    const backendEnvPath = path.resolve(__dirname, "../.env");
    if (fs.existsSync(backendEnvPath)) {
      const content = fs.readFileSync(backendEnvPath, "utf-8");
      const targetVar =
        service === "convert"
          ? "GEMINI_KEY_CONVERT"
          : service === "explain"
          ? "GEMINI_KEY_EXPLAIN"
          : "GEMINI_KEY_ANALYZE";

      const specificMatch = content.match(new RegExp(`${targetVar}\\s*=\\s*([^\\r\\n]+)`));
      if (specificMatch && specificMatch[1].trim()) {
        return specificMatch[1].trim();
      }

      const generalMatch = content.match(/GEMINI_API_KEY\s*=\s*([^\r\n]+)/);
      if (generalMatch && generalMatch[1].trim()) {
        return generalMatch[1].trim();
      }
    }
  } catch (_) {}

  // Fallback: Read directly from frontend/.env.local
  try {
    const frontendEnvPath = path.resolve(__dirname, "../../frontend/.env.local");
    if (fs.existsSync(frontendEnvPath)) {
      const content = fs.readFileSync(frontendEnvPath, "utf-8");
      const targetVar =
        service === "convert"
          ? "VITE_GEMINI_KEY_CONVERT"
          : service === "explain"
          ? "VITE_GEMINI_KEY_EXPLAIN"
          : "VITE_GEMINI_KEY_ANALYZE";

      const match = content.match(new RegExp(`${targetVar}\\s*=\\s*([^\\r\\n]+)`));
      if (match && match[1].trim()) {
        return match[1].trim();
      }
    }
  } catch (_) {}

  return null;
};

const CANDIDATE_MODELS = [
  "gemini-3.7-flash",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-flash-latest",
];

const callGemini = async (prompt, service = "analyze") => {
  const apiKey = getApiKeyForService(service);
  if (!apiKey) {
    throw new Error(
      `GEMINI_KEY_${service.toUpperCase()} is not configured in backend/.env. Please configure your API key.`
    );
  }

  let lastError = null;

  // Try each model in the fallback cascade
  for (const model of CANDIDATE_MODELS) {
    let attempt = 0;
    const maxRetries = 2;

    while (attempt < maxRetries) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
              generationConfig: {
                responseMimeType: "application/json",
              },
            }),
          }
        );

        // High demand (503) or Rate Limit (429) on this specific model -> cascade to next model
        if (response.status === 503 || response.status === 429) {
          attempt++;
          if (attempt >= maxRetries) {
            // Move to next candidate model
            break;
          }
          const delay = 500 + Math.random() * 400;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const msg = errorData.error?.message || `Upstream AI service error (${response.status})`;
          // If model is overloaded or unavailable, break out to try next candidate model
          if (response.status >= 500 || msg.toLowerCase().includes("demand") || msg.toLowerCase().includes("overloaded")) {
            lastError = new Error(msg);
            break;
          }
          throw new Error(msg);
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) {
          throw new Error("Empty response received from Gemini API.");
        }

        const cleanText = sanitizeJsonResponse(responseText);
        return JSON.parse(cleanText);
      } catch (err) {
        lastError = err;
        attempt++;
        if (attempt >= maxRetries) {
          break;
        }
        const delay = 500 + Math.random() * 300;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // If all candidate models in the cascade failed, throw the last error
  throw lastError || new Error("All AI models are temporarily unavailable. Please try again in a moment.");
};

// POST /api/gemini/analyze — Dedicated key: GEMINI_KEY_ANALYZE
router.post("/analyze", async (req, res) => {
  const { code, language } = req.body;

  if (!code || typeof code !== "string" || !code.trim()) {
    return res.status(400).json({ error: "Code content is required for analysis." });
  }

  if (code.length > 50000) {
    return res.status(400).json({ error: "Code exceeds maximum supported length (50,000 characters)." });
  }

  const lang = (language && typeof language === "string") ? language.trim() : "javascript";

  const prompt = `
You are an elite Computer Science algorithm professor and Principal Performance Engineer for BigO.ai.
Perform a rigorous, deeply educational asymptotic Time and Space complexity analysis of the following ${lang} code.

Code to analyze:
\`\`\`${lang}
${code}
\`\`\`

You must return a SINGLE JSON object (no markdown surrounding ticks). The JSON object must contain the following keys exactly:
{
  "timeComplexity": "Big-O notation, e.g., O(N), O(N^2), O(N log N), O(2^N), O(log N)",
  "spaceComplexity": "Big-O notation, e.g., O(1), O(N), O(N^2), O(log N)",
  "explanation": "A comprehensive, beautifully formatted Markdown analysis. Structure it with clear markdown headings and bullet points:
### ⏱️ Time Complexity Derivation
- **Loop/Recursion Analysis**: Explain each loop/recursive call, how many iterations it runs relative to input N, and how inner steps multiply or add together.
- **Mathematical Form**: Show the mathematical summation or recurrence relation (e.g., T(N) = N * (N - 1) / 2 = O(N^2)).
- **Dominant Term**: Explain why lower-order terms and constants are dropped.
- **Best vs. Average vs. Worst Case**: Detail if and when early exits, sorted inputs, or worst-case branching affect the runtime.

### 💾 Space Complexity Breakdown
- **Auxiliary Space**: Detail every array, matrix, hash table, or buffer allocated and its exact memory footprint.
- **Call Stack Depth**: If recursive, specify the maximum recursion stack frame depth (e.g. O(N) or O(log N)).
- **Total Space Verdict**: Explicitly confirm the final auxiliary space boundary.

### ⚡ Critical Bottlenecks
- Pinpoint the exact line(s) or operations that dominate execution time and memory consumption.

IMPORTANT FORMATTING RULES:
- Write ALL mathematical expressions in clean, readable text/Unicode (e.g. O(N^2), Θ(N^2), T(N) = N * (N - 1) / 2 = O(N^2), ≤, ≥, ∑).
- Do NOT use LaTeX math formatting, dollar sign delimiters ($ or $$), or LaTeX commands (no \\frac, \\sum, \\cdot, \\le, \\ge, etc.).
- Use clean Markdown with standard bolding and bullet points.",
  "optimizedCode": "An optimized, clean, idiomatic version of the code in ${lang}, or the same code if already theoretically optimal.",
  "optimizationExplanation": "Detailed explanation of what specific algorithmic technique, data structure, or mathematical property reduces time or space complexity (e.g., Two Pointers, Dynamic Programming with 1D rolling array, HashMap for O(1) lookups, Binary Search).",
  "heatmap": {
    "1": "low or medium or high (corresponding to frequency of line execution)",
    "2": "low or medium or high"
  },
  "simulation": [
    {
      "line": 1, 
      "vars": { "var1Name": "var1ValueAsStr", "var2Name": "var2ValueAsStr" }, 
      "explanation": "Brief description of the step."
    }
  ],
  "quiz": [
    {
      "stepIndex": 1,
      "question": "A dry-run question about variable states at this step.",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A"
    }
  ]
}

Provide 4-6 concise key execution simulation steps for the trace. Ensure line numbers match 1-indexed lines of the input code.

Return ONLY valid JSON.
`;

  try {
    const result = await callGemini(prompt, "analyze");
    res.status(200).json(result);
  } catch (error) {
    console.error("Gemini Analysis Error:", error.message);
    res.status(500).json({ error: error.message || "Failed to analyze code with AI." });
  }
});

// POST /api/gemini/convert — Dedicated key: GEMINI_KEY_CONVERT
router.post("/convert", async (req, res) => {
  const { code, sourceLanguage, targetLanguage } = req.body;

  if (!code || typeof code !== "string" || !code.trim()) {
    return res.status(400).json({ error: "Code content is required for conversion." });
  }

  if (code.length > 50000) {
    return res.status(400).json({ error: "Code exceeds maximum supported length (50,000 characters)." });
  }

  if (!targetLanguage || typeof targetLanguage !== "string") {
    return res.status(400).json({ error: "Target language is required." });
  }

  const src = sourceLanguage || "javascript";
  const tgt = targetLanguage;

  const prompt = `
You are an expert polyglot software engineering assistant.
Convert the following code from ${src} to ${tgt}.
Optimize the translated code to be idiomatic, production-ready, and performant in ${tgt}.

Source Code (${src}):
\`\`\`${src}
${code}
\`\`\`

You must respond with a SINGLE JSON object with the following keys:
{
  "convertedCode": "The full source code of the translated version with clear comments.",
  "explanation": "A structured Markdown explanation covering:
### 🔄 Language Translation Breakdown
- **Syntax & Paradigm Shifts**: How loops, types, memory, and data structures map from ${src} to ${tgt}.
- **Idiomatic Optimizations**: Modern standard library utilities or language features utilized in ${tgt}.
- **Performance Characteristics**: Any changes in memory layout or execution model."
}

Return ONLY valid JSON.
`;

  try {
    const result = await callGemini(prompt, "convert");
    res.status(200).json(result);
  } catch (error) {
    console.error("Gemini Conversion Error:", error.message);
    res.status(500).json({ error: error.message || "Failed to convert code with AI." });
  }
});

// POST /api/gemini/explain — Dedicated key: GEMINI_KEY_EXPLAIN
router.post("/explain", async (req, res) => {
  const { code, language } = req.body;

  if (!code || typeof code !== "string" || !code.trim()) {
    return res.status(400).json({ error: "Code content is required." });
  }

  const lang = language || "javascript";

  const prompt = `
You are a world-class computer science teacher known for making complex algorithms intuitive and crystal clear.
Explain what the following ${lang} code DOES in plain, engaging English.

Code:
\`\`\`${lang}
${code}
\`\`\`

Return a SINGLE JSON object with key "plainExplanation" containing clean, structured Markdown:
**Core Purpose**: One clear sentence explaining what problem this algorithm solves.

**How It Works Step-by-Step**:
- Point 1: Intuitive explanation of step 1 without code jargon.
- Point 2: Intuitive explanation of step 2.
- Point 3: Intuitive explanation of step 3.

**Real-World Analogy**:
An intuitive real-life comparison (e.g. searching a dictionary, dividing a chocolate bar, sorting cards) that makes the logic click immediately.

FORMATTING RULES:
- Do NOT use multiple hash header symbols (like #####).
- Do NOT use LaTeX math ($).
- Keep text clean, bolded, and bulleted.

Return ONLY a JSON object: { "plainExplanation": "..." }
`;

  try {
    const result = await callGemini(prompt, "explain");
    res.status(200).json({ plainExplanation: result.plainExplanation || "Code logic summary unavailable." });
  } catch (error) {
    console.error("Gemini Explain Error:", error.message);
    res.status(500).json({ plainExplanation: "Code logic summary unavailable.", error: error.message });
  }
});

export default router;
