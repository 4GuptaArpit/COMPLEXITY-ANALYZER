// Service to make calls to the Gemini API for code complexity analysis and simulation traces.

const sanitizeJsonResponse = (text) => {
  if (!text) return "";
  let clean = text.trim();
  // Strip starting ```json or ```
  clean = clean.replace(/^```(?:json)?\s*/i, "");
  // Strip ending ```
  clean = clean.replace(/\s*```$/i, "");
  return clean.trim();
};

const getKeyForFeature = (featureKey) => {
  const envKey = import.meta.env[featureKey] || import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey !== "YOUR_API_KEY_HERE") return envKey;
  return "";
};

const fetchWithRetry = async (url, options, maxRetries = 3) => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429) {
        attempt++;
        if (attempt >= maxRetries) {
          throw new Error("Gemini API rate limit exceeded (429). Please try again in a few seconds.");
        }
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        console.warn(`Gemini API 429 rate limit. Retrying in ${delay.toFixed(0)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      return response;
    } catch (error) {
      if (attempt >= maxRetries - 1) {
        throw error;
      }
      attempt++;
      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export const analyzeCodeWithGemini = async (code, language) => {
  const apiKey = getKeyForFeature("VITE_GEMINI_KEY_ANALYZE");
  if (!apiKey) {
    throw new Error("No Gemini API Key found for Complexity Analyzer. Please configure VITE_GEMINI_KEY_ANALYZE.");
  }

  // Define the prompt requesting a strict JSON format
  const prompt = `
You are an expert computer science assistant named BigO.ai.
Analyze the following code written in ${language}.
Calculate its Time and Space complexity, provide an optimized version if possible, highlight lines based on runtime intensity, and trace its step-by-step execution.

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

You must respond with a SINGLE JSON object. Do not include markdown code block syntax (like \`\`\`json) in your response, just return the raw JSON text. The JSON object must contain the following keys exactly:
{
  "timeComplexity": "Big-O notation, e.g., O(N), O(N^2), O(log N)",
  "spaceComplexity": "Big-O notation, e.g., O(1), O(N)",
  "explanation": "A concise breakdown of how the time and space complexity are derived.",
  "optimizedCode": "An optimized version of the code in the same language, or the same code if already fully optimal.",
  "optimizationExplanation": "Explanation of what optimization was made, why it is faster, or a note saying it's already optimal.",
  "heatmap": {
    "1": "low or medium or high (corresponding to frequency of line execution)",
    "2": "low or medium or high"
  },
  "simulation": [
    {
      "line": 1, 
      "vars": { "var1Name": "var1ValueAsStr", "var2Name": "var2ValueAsStr" }, 
      "explanation": "What is happening at this step. Keep it clear and simple."
    }
  ],
  "quiz": [
    {
      "stepIndex": 2,
      "question": "A multiple choice question about the state of variables or algorithm behavior at this specific simulation step.",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "answer": "Option A text"
    }
  ]
}

Please simulate a basic execution scenario. Make the simulation trace cover a complete simple run of about 5-15 steps (e.g. searching for a number, sorting a 3-element list, finding Fibonacci of 3 or 4) so the visualizer can step through it. Verify that the 'line' number matches the corresponding 1-indexed line of the user's code.

Double check: Return ONLY a valid JSON object.
`;

  try {
    const response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status} Error`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error("Empty response received from Gemini API.");
    }

    const cleanText = sanitizeJsonResponse(responseText);
    const parsedJson = JSON.parse(cleanText);
    return parsedJson;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const convertCodeWithGemini = async (code, sourceLanguage, targetLanguage) => {
  const apiKey = getKeyForFeature("VITE_GEMINI_KEY_CONVERT");
  if (!apiKey) {
    throw new Error("No Gemini API Key found for Converter. Please configure VITE_GEMINI_KEY_CONVERT.");
  }

  const prompt = `
You are an expert polyglot software engineering assistant.
Convert the following code from ${sourceLanguage} to ${targetLanguage}.
Optimize the translated code to be idiomatic in the target language.

Source Code:
\`\`\`${sourceLanguage}
${code}
\`\`\`

You must respond with a SINGLE JSON object. Do not include markdown code block syntax (like \`\`\`json) in your response, just return the raw JSON text. The JSON object must contain the following keys exactly:
{
  "convertedCode": "The full source code of the translated version. Preserve all comments and structure, translating them correctly.",
  "explanation": "A breakdown of the differences between the source and target languages for this specific code, including key syntax changes, standard library functions used, and execution model updates (e.g. how types are handled or how loops map)."
}

Double check: Return ONLY a valid JSON object.
`;

  try {
    const response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status} Error`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error("Empty response received from Gemini API.");
    }

    const cleanText = sanitizeJsonResponse(responseText);
    const parsedJson = JSON.parse(cleanText);
    return parsedJson;
  } catch (error) {
    console.error("Gemini API Error during translation:", error);
    throw error;
  }
};

export const explainCodeWithGemini = async (code, language) => {
  const apiKey = getKeyForFeature("VITE_GEMINI_KEY_EXPLAIN");
  if (!apiKey) {
    return "Explain key is not configured, but you can still view complexity results above!";
  }

  const prompt = `
You are an intuitive computer science teacher.
Explain what the following ${language} code actually DOES in simple, plain English (for someone learning programming).
Explain the main logic in 3-4 clear, friendly sentences. Avoid heavy math jargon. Use a helpful real-world analogy if applicable.

Code:
\`\`\`${language}
${code}
\`\`\`

Return a SINGLE JSON object with key "plainExplanation" containing your explanation text.
`;

  try {
    const response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    if (!response.ok) return "Code logic summary unavailable.";
    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) return "Code logic summary unavailable.";
    const parsed = JSON.parse(sanitizeJsonResponse(responseText));
    return parsed.plainExplanation || "Code logic summary unavailable.";
  } catch (error) {
    console.error("Explain Code Error:", error);
    return "Code logic summary unavailable.";
  }
};



