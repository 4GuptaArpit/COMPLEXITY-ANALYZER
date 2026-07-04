/**
 * Score-based language detector.
 * Awards points per pattern match. Returns the language with highest score.
 * Falls back to "javascript" only if no other language has meaningful score.
 */
export function detectLanguage(sourceCode) {
  if (!sourceCode || sourceCode.trim().length < 5) return "javascript";

  const src = sourceCode;
  const lower = sourceCode.toLowerCase();

  const scores = { java: 0, python: 0, cpp: 0, c: 0, rust: 0, javascript: 0 };

  // ── JAVA ────────────────────────────────────────────────────────────────
  if (/public\s+(static\s+)?class\s+\w+/.test(src))      scores.java += 10;
  if (/public\s+static\s+void\s+main/.test(src))          scores.java += 10;
  if (/System\.out\.(print|println|printf)/.test(src))     scores.java += 8;
  if (/public\s+static\s+\w+\s+\w+\s*\(/.test(src))       scores.java += 6;
  if (/private\s+\w+\s+\w+/.test(src))                     scores.java += 4;
  if (/protected\s+\w+\s+\w+/.test(src))                   scores.java += 4;
  if (/new\s+ArrayList\s*[<(]/.test(src))                  scores.java += 8;
  if (/new\s+HashMap\s*[<(]/.test(src))                    scores.java += 8;
  if (/new\s+LinkedList\s*[<(]/.test(src))                 scores.java += 8;
  if (/new\s+HashSet\s*[<(]/.test(src))                    scores.java += 8;
  if (/new\s+Stack\s*[<(]/.test(src))                      scores.java += 6;
  if (/new\s+PriorityQueue\s*[<(]/.test(src))              scores.java += 6;
  if (/Map<|List<|Set<|Queue<|Deque</.test(src))           scores.java += 6;
  if (/int\[\]|String\[\]|char\[\]|double\[\]|boolean\[\]/.test(src)) scores.java += 6;
  if (/new\s+int\[|new\s+char\[|new\s+double\[/.test(src)) scores.java += 6;
  if (/@Override|@Deprecated|@SuppressWarnings/.test(src)) scores.java += 8;
  if (/throws\s+\w+Exception/.test(src))                   scores.java += 6;
  if (/extends\s+\w+|implements\s+\w+/.test(src))          scores.java += 6;
  if (/\.length\b/.test(src) && /int\b|for\s*\(int/.test(src)) scores.java += 3;
  if (/for\s*\(\s*int\s+\w+\s*=/.test(src))                scores.java += 5;
  if (/\.containsKey\(|\.containsValue\(|\.entrySet\(/.test(src)) scores.java += 7;
  if (/\.get\(|\.put\(|\.remove\(/.test(src) && /Map<|HashMap|TreeMap/.test(src)) scores.java += 4;
  if (/import\s+java\./.test(src))                          scores.java += 10;
  if (/\bvoid\b/.test(src) && /\bpublic\b|\bprivate\b|\bprotected\b/.test(src)) scores.java += 3;

  // ── PYTHON ──────────────────────────────────────────────────────────────
  if (/^def\s+\w+\s*\(/m.test(src))                        scores.python += 10;
  if (/^class\s+\w+(\s*[\(:])/m.test(src))                 scores.python += 8;
  if (/\bself\b/.test(src))                                 scores.python += 8;
  if (/\belif\b/.test(src))                                 scores.python += 8;
  if (/\bpass\b/.test(src))                                 scores.python += 6;
  if (/\bNone\b/.test(src))                                 scores.python += 5;
  if (/\bTrue\b|\bFalse\b/.test(src))                       scores.python += 5;
  if (/print\s*\(/.test(src) && !lower.includes("system.out")) scores.python += 4;
  if (/import\s+\w+|from\s+\w+\s+import/.test(src) && !/import\s+java\./.test(src)) scores.python += 4;
  if (/#.+/.test(src) && /def\s+/.test(src))                scores.python += 2;
  if (/:\s*$|:\s*#/m.test(src))                             scores.python += 3;
  if (/\brange\s*\(/.test(src))                             scores.python += 6;
  if (/\blen\s*\(/.test(src))                               scores.python += 5;
  if (/__init__|__str__|__repr__/.test(src))                scores.python += 8;

  // ── C++ ─────────────────────────────────────────────────────────────────
  if (/#include\s*<(iostream|vector|string|map|set|algorithm|queue|stack)>/.test(src)) scores.cpp += 10;
  if (/std::/.test(src))                                    scores.cpp += 8;
  if (/cout\s*<<|cin\s*>>/.test(src))                       scores.cpp += 9;
  if (/::\s*\w+/.test(src) && !/https?:\/\//.test(src))    scores.cpp += 4;
  if (/vector<|map<|set<|pair<|queue<|stack<|unordered_map</.test(src)) scores.cpp += 7;
  if (/nullptr|auto\s+\w+\s*=/.test(src))                   scores.cpp += 5;
  if (/template\s*</.test(src))                             scores.cpp += 7;
  if (/using\s+namespace\s+std/.test(src))                  scores.cpp += 9;
  if (/->\s*\w+/.test(src) && /\*\w+/.test(src))            scores.cpp += 4;
  if (/int\s+main\s*\(/.test(src))                          scores.cpp += 6;
  if (/#include\s*</.test(src))                             scores.cpp += 8;

  // ── C ───────────────────────────────────────────────────────────────────
  if (/#include\s*<(stdio|stdlib|string|math)\.h>/.test(src)) scores.c += 10;
  if (/printf\s*\(|scanf\s*\(/.test(src))                   scores.c += 9;
  if (/malloc\s*\(|calloc\s*\(|free\s*\(/.test(src))        scores.c += 9;
  if (/struct\s+\w+\s*\{/.test(src) && !scores.cpp)         scores.c += 5;

  // ── RUST ────────────────────────────────────────────────────────────────
  if (/\bfn\s+\w+\s*\(/.test(src))                          scores.rust += 10;
  if (/let\s+mut\s+/.test(src))                             scores.rust += 9;
  if (/\bimpl\s+\w+/.test(src))                             scores.rust += 8;
  if (/println!\s*\(|print!\s*\(/.test(src))                scores.rust += 8;
  if (/use\s+std::/.test(src))                              scores.rust += 8;
  if (/\bVec<|\bHashMap<|\bOption<|\bResult</.test(src))    scores.rust += 7;
  if (/=>\s*{|match\s+\w+\s*\{/.test(src))                  scores.rust += 6;
  if (/&\s*mut\s+\w+|&\s*str\b/.test(src))                  scores.rust += 7;

  // ── JAVASCRIPT ──────────────────────────────────────────────────────────
  if (/\bconst\s+\w+\s*=\s*(function|\(|async)/.test(src)) scores.javascript += 7;
  if (/function\s+\w+\s*\(/.test(src))                      scores.javascript += 6;
  if (/=>\s*{|=>\s*\w+/.test(src) && !/match\s*\{/.test(src)) scores.javascript += 5;
  if (/console\.(log|error|warn)\s*\(/.test(src))           scores.javascript += 8;
  if (/document\.|window\.|addEventListener/.test(src))      scores.javascript += 9;
  if (/const\s+{|let\s+{|var\s+{/.test(src))                scores.javascript += 5;
  if (/require\s*\(|module\.exports|import\s+\w+\s+from/.test(src)) scores.javascript += 6;
  if (/Promise\.|async\s+function|await\s+/.test(src))      scores.javascript += 6;
  if (/\.map\s*\(|\.filter\s*\(|\.reduce\s*\(/.test(src) && !scores.java) scores.javascript += 4;
  if (/===|!==/.test(src))                                   scores.javascript += 5;
  if (/typeof\s+\w+/.test(src))                              scores.javascript += 7;

  // ── PICK WINNER ─────────────────────────────────────────────────────────
  // Merge c into cpp if cpp also has score (c subset of cpp)
  if (scores.c > 0 && scores.cpp > 0) scores.cpp += scores.c;

  const entries = Object.entries(scores).filter(([lang]) => lang !== "c");
  entries.sort((a, b) => b[1] - a[1]);

  const [topLang, topScore] = entries[0];
  const [, secondScore] = entries[1] || [null, 0];

  // Only use the top language if it has a meaningfully higher score (not a coin-flip)
  if (topScore >= 4 && topScore > secondScore) {
    return topLang;
  }

  // Ambiguous or no clear winner — fallback
  return "javascript";
}
