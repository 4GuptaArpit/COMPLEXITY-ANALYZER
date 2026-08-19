/**
 * Benchmark Math Engine
 * Computes estimated asymptotic operations and CPU execution latency
 * based on input size N and standard Big-O classes.
 */

export function calculateOps(timeComplexity = "O(N)", n = 1000) {
  if (!n || n <= 0) return 0;
  const complexity = (timeComplexity || "").toUpperCase().replace(/\s+/g, "");

  if (complexity.includes("O(1)")) {
    return 1;
  }
  if (complexity.includes("O(LOGN)")) {
    return Math.max(1, Math.round(Math.log2(n)));
  }
  if (complexity.includes("O(NLOGN)")) {
    return Math.round(n * Math.log2(n));
  }
  if (complexity.includes("O(N²)") || complexity.includes("O(N2)") || complexity.includes("O(N^2)")) {
    return Math.pow(n, 2);
  }
  if (complexity.includes("O(N³)") || complexity.includes("O(N3)") || complexity.includes("O(N^3)")) {
    return Math.pow(n, 3);
  }
  if (complexity.includes("O(2^N)") || complexity.includes("O(2N)")) {
    if (n > 30) return Infinity;
    return Math.pow(2, n);
  }
  if (complexity.includes("O(N!)")) {
    if (n > 20) return Infinity;
    let fact = 1;
    for (let i = 2; i <= n; i++) fact *= i;
    return fact;
  }

  // Default linear O(N)
  return n;
}

export function formatOperationCount(num) {
  if (num === Infinity || num > 1e15) return "> 10¹⁵ (Out of bounds)";
  if (num >= 1e12) return (num / 1e12).toFixed(2) + " Trillion";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + " Billion";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + " Million";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + " Thousand";
  return num.toLocaleString();
}

export function getEstimatedLatency(ops) {
  if (ops === Infinity || ops > 1e15) return "Years / Uncomputable";
  // Assuming a standard single core execution speed of ~100M operations/sec (10^8 ops/s)
  const seconds = ops / 1e8;
  if (seconds < 0.000001) return "< 1 µs (Instant)";
  if (seconds < 0.001) return `${(seconds * 1000).toFixed(2)} ms (Real-time)`;
  if (seconds < 1) return `${(seconds * 1000).toFixed(0)} ms`;
  if (seconds < 60) return `${seconds.toFixed(2)} seconds`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} minutes`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} hours`;
  return `${(seconds / 86400).toFixed(1)} days`;
}

export function getFormulaString(timeComplexity = "O(N)", n = 1000) {
  const complexity = (timeComplexity || "").toUpperCase().replace(/\s+/g, "");
  const nStr = n.toLocaleString();

  if (complexity.includes("O(1)")) {
    return `f(N) = 1 = 1 op`;
  }
  if (complexity.includes("O(LOGN)")) {
    const logVal = Math.log2(n).toFixed(2);
    return `f(N) = log₂(N) = log₂(${nStr}) ≈ ${logVal} ops`;
  }
  if (complexity.includes("O(NLOGN)")) {
    const logVal = Math.log2(n).toFixed(2);
    return `f(N) = N · log₂(N) = ${nStr} · ${logVal} ≈ ${Math.round(n * Math.log2(n)).toLocaleString()} ops`;
  }
  if (complexity.includes("O(N²)") || complexity.includes("O(N2)") || complexity.includes("O(N^2)")) {
    return `f(N) = N² = (${nStr})² = ${(n * n).toLocaleString()} ops`;
  }
  if (complexity.includes("O(N³)") || complexity.includes("O(N3)") || complexity.includes("O(N^3)")) {
    return `f(N) = N³ = (${nStr})³ = ${(n * n * n).toLocaleString()} ops`;
  }
  if (complexity.includes("O(2^N)") || complexity.includes("O(2N)")) {
    return `f(N) = 2^N = 2^(${nStr}) ${n > 30 ? "→ Exponential Explosion (Infinity)" : ""}`;
  }
  if (complexity.includes("O(N!)")) {
    return `f(N) = N! = ${nStr}! ${n > 15 ? "→ Combinatorial Explosion (Infinity)" : ""}`;
  }

  return `f(N) = N = ${nStr} ops`;
}

export function getScalabilityVerdict(ops) {
  if (ops === Infinity || ops > 1e8) {
    return {
      status: "critical",
      badge: "TLE / Severe Bottleneck",
      badgeColor: "bg-red-500/10 text-red-400 border-red-500/30",
      textColor: "text-red-400",
      barColor: "bg-red-500",
      title: "Exceeds 1-Second CPU Compute Budget (10⁸ ops)",
      description: "At this input scale, your algorithm will freeze the client browser or result in a Time Limit Exceeded (TLE) on online judges like LeetCode.",
      recommendation: "Refactor to O(N log N) or O(N) using hash maps, two pointers, or divide-and-conquer.",
    };
  }

  if (ops > 1e7) {
    return {
      status: "warning",
      badge: "High Overhead (~100ms - 1s)",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      textColor: "text-amber-400",
      barColor: "bg-amber-500",
      title: "Approaching Real-Time Latency Ceiling",
      description: "Acceptable for background offline jobs, but noticeable UI lag or server API delay under concurrent traffic.",
      recommendation: "Consider memoization, pruning, or parallel worker execution.",
    };
  }

  if (ops > 1e5) {
    return {
      status: "moderate",
      badge: "Fast & Scalable (~1ms - 10ms)",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      textColor: "text-blue-400",
      barColor: "bg-blue-500",
      title: "Production Ready Scalability",
      description: "Executes in milliseconds with minimal CPU overhead across standard web inputs.",
      recommendation: "Well-optimized for standard medium to large scale applications.",
    };
  }

  return {
    status: "optimal",
    badge: "Blazing Fast (< 1ms)",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    textColor: "text-emerald-400",
    barColor: "bg-emerald-500",
    title: "Instant Execution",
    description: "Near-instantaneous atomic execution. Can easily handle inputs well beyond N = 1,000,000.",
    recommendation: "Optimal asymptotic tier achieved.",
  };
}

export function getScalingComparisonTable(timeComplexity) {
  const sampleSizes = [10, 100, 1000, 10000, 100000];
  return sampleSizes.map((n) => {
    const currentOps = calculateOps(timeComplexity, n);
    const logLinearOps = calculateOps("O(NLOGN)", n);
    const linearOps = calculateOps("O(N)", n);
    const quadraticOps = calculateOps("O(N²)", n);

    return {
      n,
      currentOps,
      currentLatency: getEstimatedLatency(currentOps),
      linearOps,
      logLinearOps,
      quadraticOps,
    };
  });
}
