import { describe, it, expect } from "vitest";
import {
  calculateOps,
  formatOperationCount,
  getEstimatedLatency,
} from "../utils/benchmarkMath";

describe("Benchmark Math Calculations", () => {
  it("calculates O(1) operations accurately", () => {
    expect(calculateOps("O(1)", 1000)).toBe(1);
    expect(calculateOps("O(1)", 100000)).toBe(1);
  });

  it("calculates O(log N) operations accurately", () => {
    expect(calculateOps("O(log N)", 1024)).toBe(10);
    expect(calculateOps("O(LOGN)", 1000)).toBe(10);
  });

  it("calculates O(N) linear operations accurately", () => {
    expect(calculateOps("O(N)", 500)).toBe(500);
    expect(calculateOps("O(N)", 10000)).toBe(10000);
  });

  it("calculates O(N log N) log-linear operations accurately", () => {
    // 1024 * 10 = 10240
    expect(calculateOps("O(N log N)", 1024)).toBe(10240);
  });

  it("calculates O(N²) quadratic operations accurately", () => {
    expect(calculateOps("O(N²)", 100)).toBe(10000);
    expect(calculateOps("O(N^2)", 1000)).toBe(1000000);
  });

  it("calculates O(N³) cubic operations accurately", () => {
    expect(calculateOps("O(N³)", 10)).toBe(1000);
    expect(calculateOps("O(N^3)", 100)).toBe(1000000);
  });

  it("handles exponential O(2^N) and caps overflow at Infinity safely", () => {
    expect(calculateOps("O(2^N)", 10)).toBe(1024);
    expect(calculateOps("O(2^N)", 50)).toBe(Infinity);
  });

  it("formats operation counts into human-readable strings", () => {
    expect(formatOperationCount(500)).toBe("500");
    expect(formatOperationCount(1500)).toBe("1.5 Thousand");
    expect(formatOperationCount(2500000)).toBe("2.50 Million");
    expect(formatOperationCount(3500000000)).toBe("3.50 Billion");
    expect(formatOperationCount(Infinity)).toBe("> 10¹⁵ (Out of bounds)");
  });

  it("computes accurate estimated latency representations", () => {
    // 10 ops = 10 / 1e8 = 10^-7 s = < 1 µs
    expect(getEstimatedLatency(10)).toBe("< 1 µs (Instant)");
    // 50,000 ops = 50,000 / 1e8 = 0.0005 s = 0.5 ms
    expect(getEstimatedLatency(50000)).toBe("0.50 ms (Real-time)");
    // 100,000,000 ops = 1 s
    expect(getEstimatedLatency(100000000)).toBe("1.00 seconds");
    // Infinity
    expect(getEstimatedLatency(Infinity)).toBe("Years / Uncomputable");
  });
});
