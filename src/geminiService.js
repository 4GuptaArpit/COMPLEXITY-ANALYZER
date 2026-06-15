// Service to make calls to the Gemini API for code complexity analysis and simulation traces.

export const hasApiKey = () => {
  const localKey = localStorage.getItem("BIGO_GEMINI_API_KEY");
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  return !!(localKey || (envKey && envKey !== "YOUR_API_KEY_HERE"));
};

export const getApiKey = () => {
  const localKey = localStorage.getItem("BIGO_GEMINI_API_KEY");
  if (localKey) return localKey;
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey !== "YOUR_API_KEY_HERE") return envKey;
  return "";
};

export const saveApiKey = (key) => {
  if (key) {
    localStorage.setItem("BIGO_GEMINI_API_KEY", key);
  } else {
    localStorage.removeItem("BIGO_GEMINI_API_KEY");
  }
};

export const analyzeCodeWithGemini = async (code, language) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("No Gemini API Key found. Please add your key in Settings.");
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
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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

    const parsedJson = JSON.parse(responseText.trim());
    return parsedJson;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const convertCodeWithGemini = async (code, sourceLanguage, targetLanguage) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("No Gemini API Key found. Please add your key in Settings.");
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
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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

    const parsedJson = JSON.parse(responseText.trim());
    return parsedJson;
  } catch (error) {
    console.error("Gemini API Error during translation:", error);
    throw error;
  }
};

