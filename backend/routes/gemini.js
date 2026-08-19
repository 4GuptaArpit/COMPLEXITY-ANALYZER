import express from "express";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load backend .env relative to this file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const router = express.Router();

// Dedicated rate limiter for AI generation routes
const geminiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60, // Increased to 60 req/15m for smooth interactions
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many AI analysis requests from this IP. Please try again after a few minutes." },
});

router.use(geminiLimiter);

// ─── HIGH-SPEED IN-MEMORY LRU RESPONSE CACHE ────────────────────────────────────
class MemoryLRUCache {
  constructor(maxSize = 250, ttlMs = 30 * 60 * 1000) {
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
    this.cache = new Map();
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    // Refresh LRU recency
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttlMs,
    });
  }
}

const responseCache = new MemoryLRUCache(250, 30 * 60 * 1000);

const getCacheKey = (service, lang, code, targetLang = "") => {
  const normCode = code.replace(/\r\n/g, "\n").trim();
  const raw = `${service}:${lang}:${targetLang}:${normCode}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
};

const extractAndParseJson = (raw) => {
  if (!raw || typeof raw !== "string") {
    throw new Error("Empty response received from AI service.");
  }

  let text = raw.trim();

  // 1. Strip markdown code fences (```json ... ``` or ``` ...)
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  // 2. Extract outermost JSON object if surrounded by preamble/postamble
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.substring(firstBrace, lastBrace + 1);
  }

  // 3. Try standard JSON parse
  try {
    return JSON.parse(text);
  } catch (initialErr) {
    // 4. Auto-repair for common LLM JSON syntax quirks (unescaped newlines or slight truncation)
    try {
      const repaired = text.replace(/([^\\])\n/g, "$1\\n");
      return JSON.parse(repaired);
    } catch (_) {}

    try {
      let balance = 0;
      let inString = false;
      let escaped = false;
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"' && !escaped) inString = !inString;
        if (!inString) {
          if (char === "{" || char === "[") balance++;
          else if (char === "}" || char === "]") balance--;
        }
        escaped = char === "\\" && !escaped;
      }

      let fixed = text;
      if (inString) fixed += '"';
      while (balance > 0) {
        fixed += "}";
        balance--;
      }
      return JSON.parse(fixed);
    } catch (_) {
      throw new Error(`AI response JSON could not be formatted: ${initialErr.message}`);
    }
  }
};

const sanitizeJsonResponse = (text) => {
  if (!text) return "";
  let clean = text.trim();
  clean = clean.replace(/^```(?:json)?\s*/i, "");
  clean = clean.replace(/\s*```$/i, "");
  return clean.trim();
};

/**
 * Resolves the dedicated API key based on the specific service type.
 */
const getApiKeyForService = (service = "analyze") => {
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

  // Fallback: Read directly from backend/.env file
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

  // Fallback: Read from frontend/.env.local
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

// Supported Gemini models with automatic cascading fallback
const CANDIDATE_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-flash-latest",
];

// Tuned generation configuration for fast, near-greedy token sampling
const GENERATION_CONFIG = {
  temperature: 0.1,
  topP: 0.95,
  maxOutputTokens: 4096,
  responseMimeType: "application/json",
  thinkingConfig: {
    thinkingLevel: "LOW",
  },
};

/**
 * Non-streaming call — waits for full response then returns parsed JSON.
 */
const callGemini = async (prompt, systemInstruction = "", service = "analyze") => {
  const apiKey = getApiKeyForService(service);
  if (!apiKey) {
    throw new Error(
      `GEMINI_KEY_${service.toUpperCase()} is not configured in backend/.env. Please configure your API key.`
    );
  }

  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    let attempt = 0;
    const maxRetries = 2;

    while (attempt < maxRetries) {
      try {
        const bodyPayload = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: GENERATION_CONFIG,
        };

        if (systemInstruction) {
          bodyPayload.systemInstruction = {
            parts: [{ text: systemInstruction }],
          };
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Connection": "keep-alive",
            },
            body: JSON.stringify(bodyPayload),
          }
        );

        if (response.status === 503 || response.status === 429) {
          attempt++;
          if (attempt >= maxRetries) break;
          await new Promise((r) => setTimeout(r, 400 + Math.random() * 300));
          continue;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const msg = errorData.error?.message || `Upstream AI service error (${response.status})`;
          if (response.status >= 500 || msg.toLowerCase().includes("demand") || msg.toLowerCase().includes("overloaded")) {
            lastError = new Error(msg);
            break;
          }
          throw new Error(msg);
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) throw new Error("Empty response received from Gemini API.");

        return extractAndParseJson(responseText);
      } catch (err) {
        lastError = err;
        attempt++;
        if (attempt >= maxRetries) break;
        await new Promise((r) => setTimeout(r, 400 + Math.random() * 250));
      }
    }
  }

  throw lastError || new Error("All AI models are temporarily unavailable. Please try again in a moment.");
};

/**
 * Streaming call — forwards Server-Sent Events (SSE) chunks from Gemini to the client.
 */
const callGeminiStream = async (prompt, systemInstruction = "", service, res, cacheKey = null) => {
  const apiKey = getApiKeyForService(service);
  if (!apiKey) {
    res.write(`data: ${JSON.stringify({ error: "API key not configured." })}\n\n`);
    res.end();
    return;
  }

  for (const model of CANDIDATE_MODELS) {
    try {
      const bodyPayload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: GENERATION_CONFIG,
      };

      if (systemInstruction) {
        bodyPayload.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Connection": "keep-alive",
          },
          body: JSON.stringify(bodyPayload),
        }
      );

      if (response.status === 429 || response.status === 503) continue;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error?.message || `Upstream error (${response.status})`;
        if (response.status >= 500 || msg.toLowerCase().includes("overloaded")) continue;
        res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
        res.end();
        return;
      }

      let buffer = "";
      const decoder = new TextDecoder();

      for await (const chunk of response.body) {
        const text = decoder.decode(chunk, { stream: true });
        for (const line of text.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const jsonStr = line.slice(5).trim();
          if (!jsonStr || jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const part = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (part) {
              buffer += part;
              res.write(`data: ${JSON.stringify({ chunk: part })}\n\n`);
            }
          } catch (_) {}
        }
      }

      // Attempt resilient server-side JSON parse
      let parsedData = null;
      if (buffer) {
        try {
          parsedData = extractAndParseJson(buffer);
          if (cacheKey && parsedData) {
            responseCache.set(cacheKey, parsedData);
          }
        } catch (parseErr) {
          console.warn("Server-side stream JSON parse warning:", parseErr.message);
        }
      }

      // Final event contains both pre-parsed data object AND raw buffer
      res.write(`data: ${JSON.stringify({ done: true, data: parsedData, raw: buffer })}\n\n`);
      res.end();
      return;
    } catch (err) {
      console.error(`Stream error on model ${model}:`, err.message);
      continue;
    }
  }

  res.write(`data: ${JSON.stringify({ error: "All AI models are temporarily unavailable." })}\n\n`);
  res.end();
};

// ─── PROMPTS ──────────────────────────────────────────────────────────────────

const ANALYZE_SYSTEM = `You are a Principal Performance Engineer at BigO.ai. Perform rigorous asymptotic Time and Space complexity analysis. Output strictly valid JSON matching the schema. Use readable Unicode for math (O(N^2), <=, >=, ∑). Never use LaTeX ($).`;

const ANALYZE_PROMPT = (code, lang) => `
Analyze this ${lang} code:
\`\`\`${lang}
${code}
\`\`\`

Return a SINGLE valid JSON object with these exact keys:
{
  "timeComplexity": "Big-O notation e.g. O(N), O(N^2), O(N log N)",
  "spaceComplexity": "Big-O notation e.g. O(1), O(N)",
  "plainExplanation": "A 2-3 sentence intuitive plain-English summary of what this code does and its logic in simple terms.",
  "explanation": "Structured Markdown:\\n### ⏱️ Time Complexity Derivation\\n- **Loop/Recursion Analysis**: Each loop/call iteration count.\\n- **Mathematical Form**: Recurrence relation or summation (e.g. T(N) = N*(N-1)/2 = O(N^2)).\\n- **Dominant Term**: Dropped lower-order terms.\\n- **Best vs Worst Case**: Branching and early exits.\\n\\n### 💾 Space Complexity Breakdown\\n- **Auxiliary Space**: Allocations and memory footprint.\\n- **Call Stack Depth**: Max recursion depth.\\n- **Total Space Verdict**: Final auxiliary space boundary.\\n\\n### ⚡ Critical Bottlenecks\\n- Dominant line(s) or operations.",
  "optimizedCode": "Optimized idiomatic version in ${lang}, or same code if already optimal.",
  "optimizationExplanation": "Specific algorithmic technique used to optimize (e.g. Two Pointers, DP, HashMap, Binary Search).",
  "heatmap": { "1": "low", "2": "high" },
  "simulation": [
    { "line": 1, "vars": { "varName": "value" }, "explanation": "Step description." }
  ],
  "quiz": [
    { "stepIndex": 1, "question": "Question?", "options": ["A","B","C","D"], "answer": "A" }
  ]
}

Provide 4-6 concise simulation steps matching 1-indexed input lines. Return ONLY valid JSON.
`;

const CONVERT_SYSTEM = `You are an expert polyglot software engineering assistant. Convert source code between programming languages to be clean, idiomatic, and performant. Output strictly valid JSON.`;

const CONVERT_PROMPT = (code, src, tgt) => `
Convert this code from ${src} to ${tgt}:
\`\`\`${src}
${code}
\`\`\`

Return a SINGLE valid JSON object:
{
  "convertedCode": "Full translated source code in ${tgt} with helpful comments.",
  "explanation": "Structured Markdown:\\n### 🔄 Language Translation Breakdown\\n- **Syntax & Paradigm Shifts**: How loops, types, memory, and data structures map from ${src} to ${tgt}.\\n- **Idiomatic Optimizations**: Modern ${tgt} standard library features utilized.\\n- **Performance Characteristics**: Memory layout and runtime characteristics in ${tgt}."
}

Return ONLY valid JSON.
`;

// ─── ENDPOINTS ────────────────────────────────────────────────────────────────

// POST /api/gemini/analyze — with instant in-memory LRU cache check
router.post("/analyze", async (req, res) => {
  const { code, language } = req.body;
  if (!code || typeof code !== "string" || !code.trim())
    return res.status(400).json({ error: "Code content is required for analysis." });
  if (code.length > 50000)
    return res.status(400).json({ error: "Code exceeds maximum supported length (50,000 characters)." });

  const lang = (language && typeof language === "string") ? language.trim() : "javascript";
  const cacheKey = getCacheKey("analyze", lang, code);

  const cached = responseCache.get(cacheKey);
  if (cached) {
    res.setHeader("X-Cache", "HIT");
    return res.status(200).json(cached);
  }

  try {
    const result = await callGemini(ANALYZE_PROMPT(code, lang), ANALYZE_SYSTEM, "analyze");
    responseCache.set(cacheKey, result);
    res.setHeader("X-Cache", "MISS");
    res.status(200).json(result);
  } catch (error) {
    console.error("Gemini Analysis Error:", error.message);
    res.status(500).json({ error: error.message || "Failed to analyze code with AI." });
  }
});

// POST /api/gemini/analyze-stream — SSE streaming with instant cache bypass
router.post("/analyze-stream", async (req, res) => {
  const { code, language } = req.body;
  if (!code || typeof code !== "string" || !code.trim())
    return res.status(400).json({ error: "Code content is required for analysis." });
  if (code.length > 50000)
    return res.status(400).json({ error: "Code exceeds maximum supported length (50,000 characters)." });

  const lang = (language && typeof language === "string") ? language.trim() : "javascript";
  const cacheKey = getCacheKey("analyze", lang, code);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const cached = responseCache.get(cacheKey);
  if (cached) {
    res.write(`data: ${JSON.stringify({ done: true, data: cached, raw: JSON.stringify(cached) })}\n\n`);
    res.end();
    return;
  }

  await callGeminiStream(ANALYZE_PROMPT(code, lang), ANALYZE_SYSTEM, "analyze", res, cacheKey);
});

// POST /api/gemini/convert-stream — SSE streaming with instant cache bypass
router.post("/convert-stream", async (req, res) => {
  const { code, sourceLanguage, targetLanguage } = req.body;
  if (!code || typeof code !== "string" || !code.trim())
    return res.status(400).json({ error: "Code content is required for conversion." });
  if (code.length > 50000)
    return res.status(400).json({ error: "Code exceeds maximum supported length (50,000 characters)." });
  if (!targetLanguage || typeof targetLanguage !== "string")
    return res.status(400).json({ error: "Target language is required." });

  const src = sourceLanguage || "javascript";
  const tgt = targetLanguage;
  const cacheKey = getCacheKey("convert", src, code, tgt);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const cached = responseCache.get(cacheKey);
  if (cached) {
    res.write(`data: ${JSON.stringify({ done: true, data: cached, raw: JSON.stringify(cached) })}\n\n`);
    res.end();
    return;
  }

  await callGeminiStream(CONVERT_PROMPT(code, src, tgt), CONVERT_SYSTEM, "convert", res, cacheKey);
});

// POST /api/gemini/convert — non-streaming convert with cache
router.post("/convert", async (req, res) => {
  const { code, sourceLanguage, targetLanguage } = req.body;
  if (!code || typeof code !== "string" || !code.trim())
    return res.status(400).json({ error: "Code content is required for conversion." });
  if (code.length > 50000)
    return res.status(400).json({ error: "Code exceeds maximum supported length (50,000 characters)." });
  if (!targetLanguage || typeof targetLanguage !== "string")
    return res.status(400).json({ error: "Target language is required." });

  const src = sourceLanguage || "javascript";
  const tgt = targetLanguage;
  const cacheKey = getCacheKey("convert", src, code, tgt);

  const cached = responseCache.get(cacheKey);
  if (cached) {
    res.setHeader("X-Cache", "HIT");
    return res.status(200).json(cached);
  }

  try {
    const result = await callGemini(CONVERT_PROMPT(code, src, tgt), CONVERT_SYSTEM, "convert");
    responseCache.set(cacheKey, result);
    res.setHeader("X-Cache", "MISS");
    res.status(200).json(result);
  } catch (error) {
    console.error("Gemini Conversion Error:", error.message);
    res.status(500).json({ error: error.message || "Failed to convert code with AI." });
  }
});

// POST /api/gemini/explain — backwards compatibility endpoint
router.post("/explain", async (req, res) => {
  const { code, language } = req.body;
  if (!code || typeof code !== "string" || !code.trim())
    return res.status(400).json({ error: "Code content is required." });

  const lang = language || "javascript";
  const cacheKey = getCacheKey("explain", lang, code);

  const cached = responseCache.get(cacheKey);
  if (cached) return res.status(200).json(cached);

  const prompt = `Explain what this ${lang} code DOES in 2-3 intuitive, plain English sentences for beginners:\n\`\`\`${lang}\n${code}\n\`\`\`\nReturn JSON: { "plainExplanation": "..." }`;
  try {
    const result = await callGemini(prompt, "You are a friendly CS teacher.", "explain");
    responseCache.set(cacheKey, result);
    res.status(200).json({ plainExplanation: result.plainExplanation || "Code logic summary unavailable." });
  } catch (error) {
    console.error("Gemini Explain Error:", error.message);
    res.status(500).json({ plainExplanation: "Code logic summary unavailable.", error: error.message });
  }
});

export default router;
