/**
 * Static Complexity Heuristic Parser
 * 
 * Performs deterministic, zero-latency static code analysis to estimate
 * asymptotic Time and Space complexity without requiring external AI APIs.
 * Inspects loop nesting depth, logarithmic stride patterns, recursion signatures,
 * and data structure allocation footprints across multiple programming languages.
 */

export function parseStaticComplexity(code, language = "javascript") {
  if (!code || typeof code !== "string" || !code.trim()) {
    return {
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      confidence: "low",
      reasoning: ["No executable code provided."],
      loopDepth: 0,
      hasRecursion: false,
    };
  }

  const cleanCode = stripCommentsAndStrings(code);
  const reasoning = [];
  let timeComplexity = "O(1)";
  let spaceComplexity = "O(1)";
  let confidence = "medium";

  // 1. Detect Recursion
  const recursionInfo = detectRecursion(cleanCode, language);
  if (recursionInfo.isRecursive) {
    reasoning.push(
      `Recursive call detected in '${recursionInfo.functionName}' (${recursionInfo.callCount} call site${recursionInfo.callCount > 1 ? "s" : ""}).`
    );
    if (recursionInfo.isDivideAndConquer) {
      timeComplexity = recursionInfo.callCount > 1 ? "O(2^N)" : "O(log N)";
      spaceComplexity = "O(N)";
      reasoning.push("Multiple branch branching points identified (e.g. tree traversal or fibonacci branching).");
    } else if (recursionInfo.isLogarithmic) {
      timeComplexity = "O(log N)";
      spaceComplexity = "O(log N)";
      reasoning.push("Binary partitioning recurrence identified (logarithmic recursion depth).");
    } else {
      timeComplexity = "O(N)";
      spaceComplexity = "O(N)";
      reasoning.push("Linear recursion depth with single recursive invocation step.");
    }
  }

  // 2. Detect Loop Nesting & Stride Characteristics
  const loopAnalysis = analyzeLoopStructures(cleanCode);

  if (loopAnalysis.maxDepth > 0) {
    let loopTime = "O(1)";
    if (loopAnalysis.maxDepth === 1) {
      if (loopAnalysis.hasLogarithmicStride) {
        loopTime = "O(log N)";
        reasoning.push("Single loop with logarithmic index stride (e.g. i *= 2, n /= 2, binary search step).");
      } else {
        loopTime = "O(N)";
        reasoning.push("Single linear loop structure iterating over input collection.");
      }
    } else if (loopAnalysis.maxDepth === 2) {
      if (loopAnalysis.hasLogarithmicStride) {
        loopTime = "O(N log N)";
        reasoning.push("Nested loop combination with linear and logarithmic scaling strides (e.g. divide-and-conquer inner stride).");
      } else {
        loopTime = "O(N²)";
        reasoning.push("Quadratic double-nested loop hierarchy detected (O(N²)).");
      }
    } else if (loopAnalysis.maxDepth === 3) {
      loopTime = "O(N³)";
      reasoning.push("Cubic triple-nested loop hierarchy detected (O(N³)).");
    } else {
      loopTime = `O(N^${loopAnalysis.maxDepth})`;
      reasoning.push(`High-order loop nesting with depth ${loopAnalysis.maxDepth}.`);
    }

    // Compare with recursion time complexity and take upper bound
    if (getComplexityOrder(loopTime) > getComplexityOrder(timeComplexity)) {
      timeComplexity = loopTime;
    }
  }

  // 3. Detect Space Allocations
  const spaceInfo = analyzeSpaceAllocations(cleanCode);
  if (spaceInfo.hasDynamicAllocation && spaceComplexity === "O(1)") {
    spaceComplexity = spaceInfo.spaceComplexity;
    reasoning.push(spaceInfo.reason);
  }

  if (reasoning.length === 0) {
    reasoning.push("Constant-time operation with no loops or dynamic allocations identified (O(1)).");
    confidence = "high";
  } else if (loopAnalysis.maxDepth <= 2 && !recursionInfo.isRecursive) {
    confidence = "high";
  }

  return {
    timeComplexity,
    spaceComplexity,
    confidence,
    reasoning,
    loopDepth: loopAnalysis.maxDepth,
    hasRecursion: recursionInfo.isRecursive,
  };
}

/**
 * Strips comments and string literals to prevent false positives in regex scans
 */
function stripCommentsAndStrings(code) {
  return code
    // Remove single line comments
    .replace(/\/\/.*$/gm, "")
    .replace(/#.*$/gm, "")
    // Remove multi-line comments
    .replace(/\/\*[\s\S]*?\*\//g, "")
    // Remove string literals
    .replace(/(["'`])(?:(?=(\\?))\2[\s\S])*?\1/g, '""');
}

/**
 * Scans code for recursive function definitions and invocation sites
 */
function detectRecursion(code) {
  // Common function declaration patterns in JS/TS, Python, Java, C++, Rust
  const funcRegexes = [
    // JS/TS: function name(...) or const name = (...) =>
    /(?:function\s+([a-zA-Z0-9_$]+)\s*\(|(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)/g,
    // Python: def name(...)
    /def\s+([a-zA-Z0-9_$]+)\s*\(/g,
    // Java/C++/C: returnType name(...)
    /(?:public|private|protected|static|\w+)\s+(?:[\w<>\[\]]+\s+)+([a-zA-Z0-9_$]+)\s*\([^)]*\)\s*\{/g,
    // Rust: fn name(...)
    /fn\s+([a-zA-Z0-9_$]+)\s*\(/g,
  ];

  for (const regex of funcRegexes) {
    let match;
    while ((match = regex.exec(code)) !== null) {
      const fnName = match[1] || match[2];
      if (
        !fnName ||
        ["if", "for", "while", "switch", "catch", "main"].includes(fnName)
      ) {
        continue;
      }

      // Check if function name is invoked within the code block
      const callRegex = new RegExp(`\\b${fnName}\\s*\\(`, "g");
      const matches = code.match(callRegex) || [];
      
      // Need at least 2 occurrences (1 definition + 1 recursive call)
      if (matches.length >= 2) {
        const isLogarithmic =
          /\/\s*2|>>\s*1|mid\s*[-+]\s*1|floor\(|Math\.floor/i.test(code);
        const isDivideAndConquer = matches.length >= 3; // Calls itself 2+ times in body

        return {
          isRecursive: true,
          functionName: fnName,
          callCount: matches.length - 1,
          isDivideAndConquer,
          isLogarithmic,
        };
      }
    }
  }

  return { isRecursive: false };
}

/**
 * Computes maximum loop nesting depth and checks for logarithmic strides
 */
function analyzeLoopStructures(code) {
  const lines = code.split("\n");
  let currentDepth = 0;
  let maxDepth = 0;
  let hasLogarithmicStride = false;

  // Stride patterns indicating O(log N)
  if (
    /(\*=|<<=|\/=|>>=|\bMath\.floor\s*\([^)]*\/\s*2|\/\s*2|>>\s*1|\bi\s*=\s*i\s*\*\s*2|\bi\s*=\s*i\s*\/\s*2|\bmid\b|\bleft\s*=\s*mid|\bright\s*=\s*mid|\blow\s*=\s*mid|\bhigh\s*=\s*mid)/i.test(
      code
    )
  ) {
    hasLogarithmicStride = true;
  }

  // Iterate line by line tracking block scope braces / indentation
  const loopHeaderPattern =
    /\b(for\s*\(|while\s*\(|for\s+[a-zA-Z0-9_$]+\s+in\s+|for\s+[a-zA-Z0-9_$]+\s+of\s+|\.forEach\s*\(|\.map\s*\(|\.filter\s*\()/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (loopHeaderPattern.test(trimmed)) {
      currentDepth++;
      if (currentDepth > maxDepth) {
        maxDepth = currentDepth;
      }
    }

    // Count closing structures
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    if (closeBraces > openBraces && currentDepth > 0) {
      currentDepth = Math.max(0, currentDepth - (closeBraces - openBraces));
    }
  }

  // Fallback: If maxDepth is 0 but loop keywords exist
  if (maxDepth === 0 && /\b(for|while)\b/.test(code)) {
    const loopMatches = code.match(/\b(for|while)\b/g) || [];
    maxDepth = Math.min(loopMatches.length, 2);
  }

  return {
    maxDepth,
    hasLogarithmicStride,
  };
}

/**
 * Checks for heap/memory dynamic allocations
 */
function analyzeSpaceAllocations(code) {
  if (
    /new\s+(?:Array|ArrayList|HashMap|HashSet|LinkedList|Vector|Map|Set)|\[\]\s*;\s*for|\.push\(|\.append\(|malloc\(|new\s+int\[/i.test(
      code
    )
  ) {
    // If inside nested loops creating 2D matrix
    if (
      /new\s+(?:Array|int)\[\w*\]\[\w*\]|Array\.from\(\{[^}]*\},\s*\(\)\s*=>\s*\[\]\)/i.test(
        code
      )
    ) {
      return {
        hasDynamicAllocation: true,
        spaceComplexity: "O(N²)",
        reason: "Multi-dimensional matrix buffer allocation identified (O(N²)).",
      };
    }

    return {
      hasDynamicAllocation: true,
      spaceComplexity: "O(N)",
      reason: "Dynamic linear memory allocation or collection buffer instantiated (O(N)).",
    };
  }

  return {
    hasDynamicAllocation: false,
    spaceComplexity: "O(1)",
    reason: "No dynamic memory growth detected; auxiliary space is $O(1)$.",
  };
}

/**
 * Relative order hierarchy for comparing Big-O notations
 */
function getComplexityOrder(comp) {
  const c = comp.toUpperCase().replace(/\s+/g, "");
  if (c.includes("O(1)")) return 1;
  if (c.includes("O(LOGN)")) return 2;
  if (c.includes("O(N)") && !c.includes("O(NLOGN)") && !c.includes("O(N^") && !c.includes("O(N2)") && !c.includes("O(N²)") && !c.includes("O(N3)") && !c.includes("O(N³)")) return 3;
  if (c.includes("O(NLOGN)")) return 4;
  if (c.includes("O(N^2)") || c.includes("O(N²)") || c.includes("O(N2)")) return 5;
  if (c.includes("O(N^3)") || c.includes("O(N³)") || c.includes("O(N3)")) return 6;
  if (c.includes("O(2^N)") || c.includes("O(2N)")) return 7;
  return 3;
}
