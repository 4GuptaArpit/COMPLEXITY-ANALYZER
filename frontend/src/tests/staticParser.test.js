import { describe, it, expect } from "vitest";
import { parseStaticComplexity } from "../utils/staticComplexityParser";

describe("Static Complexity Heuristic Parser", () => {
  it("handles empty or blank input gracefully with O(1)", () => {
    const res = parseStaticComplexity("");
    expect(res.timeComplexity).toBe("O(1)");
    expect(res.spaceComplexity).toBe("O(1)");
    expect(res.confidence).toBe("low");
  });

  it("detects single linear loops as O(N)", () => {
    const jsLoop = `
      function sumArray(arr) {
        let total = 0;
        for (let i = 0; i < arr.length; i++) {
          total += arr[i];
        }
        return total;
      }
    `;
    const res = parseStaticComplexity(jsLoop, "javascript");
    expect(res.timeComplexity).toBe("O(N)");
    expect(res.loopDepth).toBe(1);
    expect(res.hasRecursion).toBe(false);
  });

  it("detects Python for-in iteration as O(N)", () => {
    const pythonLoop = `
      def find_max(items):
        m = items[0]
        for x in items:
          if x > m:
            m = x
        return m
    `;
    const res = parseStaticComplexity(pythonLoop, "python");
    expect(res.timeComplexity).toBe("O(N)");
    expect(res.loopDepth).toBeGreaterThanOrEqual(1);
  });

  it("detects double nested loops as O(N²)", () => {
    const bubbleSort = `
      function bubbleSort(arr) {
        for (let i = 0; i < arr.length; i++) {
          for (let j = 0; j < arr.length - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
              let temp = arr[j];
              arr[j] = arr[j + 1];
              arr[j + 1] = temp;
            }
          }
        }
        return arr;
      }
    `;
    const res = parseStaticComplexity(bubbleSort, "javascript");
    expect(res.timeComplexity).toBe("O(N²)");
    expect(res.loopDepth).toBe(2);
  });

  it("detects triple nested loops as O(N³)", () => {
    const matrixMult = `
      function multiplyMatrices(a, b, n) {
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            for (let k = 0; k < n; k++) {
              c[i][j] += a[i][k] * b[k][j];
            }
          }
        }
      }
    `;
    const res = parseStaticComplexity(matrixMult, "javascript");
    expect(res.timeComplexity).toBe("O(N³)");
    expect(res.loopDepth).toBe(3);
  });

  it("detects logarithmic stride in while loops (binary search)", () => {
    const binarySearch = `
      function binarySearch(arr, target) {
        let left = 0;
        let right = arr.length - 1;
        while (left <= right) {
          let mid = Math.floor((left + right) / 2);
          if (arr[mid] === target) return mid;
          if (arr[mid] < target) left = mid + 1;
          else right = mid - 1;
        }
        return -1;
      }
    `;
    const res = parseStaticComplexity(binarySearch, "javascript");
    expect(res.timeComplexity).toBe("O(log N)");
  });

  it("detects single linear recursion", () => {
    const countdown = `
      function countdown(n) {
        if (n <= 0) return;
        console.log(n);
        countdown(n - 1);
      }
    `;
    const res = parseStaticComplexity(countdown, "javascript");
    expect(res.hasRecursion).toBe(true);
    expect(res.timeComplexity).toBe("O(N)");
    expect(res.spaceComplexity).toBe("O(N)");
  });

  it("detects branching divide-and-conquer / fibonacci recursion as O(2^N)", () => {
    const fib = `
      function fibonacci(n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
      }
    `;
    const res = parseStaticComplexity(fib, "javascript");
    expect(res.hasRecursion).toBe(true);
    expect(res.timeComplexity).toBe("O(2^N)");
  });

  it("detects dynamic memory allocation for O(N) space", () => {
    const withBuffer = `
      function cloneAndFilter(arr) {
        const result = [];
        for (let i = 0; i < arr.length; i++) {
          result.push(arr[i] * 2);
        }
        return result;
      }
    `;
    const res = parseStaticComplexity(withBuffer, "javascript");
    expect(res.timeComplexity).toBe("O(N)");
    expect(res.spaceComplexity).toBe("O(N)");
  });

  it("identifies O(1) constant arithmetic operations with high confidence", () => {
    const constantOps = `
      function isEven(n) {
        return n % 2 === 0;
      }
    `;
    const res = parseStaticComplexity(constantOps, "javascript");
    expect(res.timeComplexity).toBe("O(1)");
    expect(res.spaceComplexity).toBe("O(1)");
    expect(res.confidence).toBe("high");
  });

  it("handles C++ class and vector methods correctly", () => {
    const cppCode = `
      #include <vector>
      using namespace std;
      int linearScan(const vector<int>& v) {
        int sum = 0;
        for (int x : v) {
          sum += x;
        }
        return sum;
      }
    `;
    const res = parseStaticComplexity(cppCode, "cpp");
    expect(res.timeComplexity).toBe("O(N)");
  });

  it("handles Java standard methods", () => {
    const javaCode = `
      public static int countElements(int[] arr) {
        int count = 0;
        for (int i = 0; i < arr.length; i++) {
          count++;
        }
        return count;
      }
    `;
    const res = parseStaticComplexity(javaCode, "java");
    expect(res.timeComplexity).toBe("O(N)");
  });

  it("handles Rust functions with iterators", () => {
    const rustCode = `
      fn sum_array(arr: &[i32]) -> i32 {
        let mut total = 0;
        for item in arr {
          total += item;
        }
        total
      }
    `;
    const res = parseStaticComplexity(rustCode, "rust");
    expect(res.timeComplexity).toBe("O(N)");
  });
});
