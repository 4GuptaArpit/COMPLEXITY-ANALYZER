import { describe, it, expect } from "vitest";
import { generateMarkdown } from "../utils/exportMarkdown";

describe("Markdown Export Engine", () => {
  it("generates markdown document with required metadata headers and tables", () => {
    const payload = {
      code: "function test() { return 1; }",
      language: "javascript",
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      explanation: "Constant time lookup with no iterations.",
      optimizedCode: "",
      optimizationExplanation: "",
    };

    const md = generateMarkdown(payload);
    expect(md).toContain("# Algorithm Complexity Report");
    expect(md).toContain("| **Language** | `JAVASCRIPT` |");
    expect(md).toContain("| **Time Complexity** | `O(1)` |");
    expect(md).toContain("| **Space Complexity** | `O(1)` |");
    expect(md).toContain("```javascript\nfunction test() { return 1; }\n```");
  });

  it("includes optimized code block and explanation when provided", () => {
    const payload = {
      code: "for(let i=0; i<n; i++) for(let j=0; j<n; j++) {}",
      language: "python",
      timeComplexity: "O(N²)",
      spaceComplexity: "O(1)",
      explanation: "Nested loop quadratic scan.",
      optimizedCode: "for i in range(n): pass",
      optimizationExplanation: "Reduced from O(N²) to O(N) using hash set lookup.",
    };

    const md = generateMarkdown(payload);
    expect(md).toContain("## ⚡ Optimized Alternative");
    expect(md).toContain("### 💡 Optimization Rationale");
    expect(md).toContain("Reduced from O(N²) to O(N)");
    expect(md).toContain("```python\nfor i in range(n): pass\n```");
  });

  it("omits optimized section when optimizedCode is empty or identical", () => {
    const payload = {
      code: "const x = 10;",
      language: "javascript",
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      explanation: "Optimal.",
      optimizedCode: "const x = 10;",
      optimizationExplanation: "",
    };

    const md = generateMarkdown(payload);
    expect(md).not.toContain("## ⚡ Optimized Alternative");
  });
});
