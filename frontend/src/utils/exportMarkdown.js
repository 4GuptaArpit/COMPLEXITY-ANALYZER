/**
 * Generates formatted Markdown documentation for an algorithm's complexity analysis snapshot.
 */
export function generateMarkdown({
  code,
  language = "javascript",
  timeComplexity = "O(N)",
  spaceComplexity = "O(1)",
  explanation = "",
  optimizedCode = "",
  optimizationExplanation = ""
}) {
  const timestamp = new Date().toISOString().split("T")[0];

  return `<!-- Generated with BigO.ai Complexity Analyzer (${timestamp}) -->
# Algorithm Complexity Report

| Metric | Complexity |
|---|---|
| **Language** | \`${language.toUpperCase()}\` |
| **Time Complexity** | \`${timeComplexity}\` |
| **Space Complexity** | \`${spaceComplexity}\` |

---

## 🔍 Complexity Analysis
${explanation || "Linear algorithm evaluation breakdown."}

---

## 💻 Source Implementation (\`${language}\`)
\`\`\`${language}
${code}
\`\`\`

${
  optimizedCode && optimizedCode !== code
    ? `---

## ⚡ Optimized Alternative
\`\`\`${language}
${optimizedCode}
\`\`\`

### 💡 Optimization Rationale
${optimizationExplanation || "Optimized for reduced asymptotic execution overhead."}`
    : ""
}

---
*Analyzed via [BigO.ai](https://bigo-ai.vercel.app) — Interactive Algorithm Complexity & Visual Execution Analyzer.*
`;
}
