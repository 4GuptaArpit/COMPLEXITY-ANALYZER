// Service to communicate securely with the backend Gemini proxy.
// Uses SSE streaming for analyze and convert for fast, progressive response times.
// Includes in-memory client-side session caching for instant re-runs (< 1ms).
// Includes resilient JSON parsing and automatic fallback to standard HTTP JSON.
import client from "./api/client";

// Fast client-side session cache
const clientCache = new Map();

const getClientCacheKey = (type, code, lang, targetLang = "") => {
  return `${type}:${lang}:${targetLang}:${code.replace(/\r\n/g, "\n").trim()}`;
};

/**
 * Resilient JSON parser that handles markdown fences, preambles, and slight truncation.
 */
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

  // 3. Try standard parse first
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
      throw new Error(`AI response JSON formatting error: ${initialErr.message}`);
    }
  }
};

/**
 * Calls the streaming SSE endpoint and returns a Promise that resolves
 * with the fully parsed JSON result once the stream is complete.
 *
 * @param {string} url - The streaming endpoint path (e.g. /gemini/analyze-stream)
 * @param {object} body - The request body to POST
 * @param {function} onChunk - Optional callback invoked with each raw chunk string for live UI updates
 */
const streamGemini = (url, body, onChunk) => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = localStorage.getItem("BIGO_JWT_TOKEN");
      const response = await fetch(`/api${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return reject(new Error(errData.error || `Server error (${response.status})`));
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        buffer += text;

        // Parse SSE lines from the buffer
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep incomplete last line in buffer

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const jsonStr = line.slice(5).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);

            if (event.error) {
              return reject(new Error(event.error));
            }

            if (event.chunk && onChunk) {
              onChunk(event.chunk);
            }

            if (event.done) {
              // Priority 1: Use pre-parsed JSON object provided directly by server
              if (event.data && typeof event.data === "object") {
                return resolve(event.data);
              }
              // Priority 2: Use client-side resilient parser on raw accumulated buffer
              if (event.raw) {
                try {
                  const parsed = extractAndParseJson(event.raw);
                  return resolve(parsed);
                } catch (parseErr) {
                  return reject(new Error(parseErr.message));
                }
              }
            }
          } catch (_) {}
        }
      }

      reject(new Error("AI stream ended unexpectedly. Please try again."));
    } catch (err) {
      reject(new Error(err.message || "Failed to connect to AI service."));
    }
  });
};

/**
 * Analyze code complexity via SSE streaming with instant client cache and silent HTTP fallback.
 */
export const analyzeCodeWithGemini = async (code, language, onChunk) => {
  if (!code || !code.trim()) throw new Error("Please provide code to analyze.");
  
  const cacheKey = getClientCacheKey("analyze", code, language);
  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey);
  }

  try {
    const result = await streamGemini("/gemini/analyze-stream", { code, language }, onChunk);
    clientCache.set(cacheKey, result);
    return result;
  } catch (streamErr) {
    console.warn("Streaming analysis failed, falling back to standard HTTP call:", streamErr.message);
    // Silent fallback to standard HTTP JSON endpoint
    const { data } = await client.post("/gemini/analyze", { code, language });
    clientCache.set(cacheKey, data);
    return data;
  }
};

/**
 * Convert code to another language via SSE streaming with instant client cache and silent HTTP fallback.
 */
export const convertCodeWithGemini = async (code, sourceLanguage, targetLanguage, onChunk) => {
  if (!code || !code.trim()) throw new Error("Please provide code to convert.");

  const cacheKey = getClientCacheKey("convert", code, sourceLanguage, targetLanguage);
  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey);
  }

  try {
    const result = await streamGemini("/gemini/convert-stream", { code, sourceLanguage, targetLanguage }, onChunk);
    clientCache.set(cacheKey, result);
    return result;
  } catch (streamErr) {
    console.warn("Streaming conversion failed, falling back to standard HTTP call:", streamErr.message);
    // Silent fallback to standard HTTP JSON endpoint
    const { data } = await client.post("/gemini/convert", { code, sourceLanguage, targetLanguage });
    clientCache.set(cacheKey, data);
    return data;
  }
};

/**
 * Explain code in plain English (non-streaming, lighter call).
 */
export const explainCodeWithGemini = async (code, language) => {
  if (!code || !code.trim()) return "Code logic summary unavailable.";
  const cacheKey = getClientCacheKey("explain", code, language);
  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey);
  }

  try {
    const { data } = await client.post("/gemini/explain", { code, language });
    const explanation = data.plainExplanation || "Code logic summary unavailable.";
    clientCache.set(cacheKey, explanation);
    return explanation;
  } catch (error) {
    console.error("Explain Code API Error:", error);
    return "Code logic summary unavailable.";
  }
};
