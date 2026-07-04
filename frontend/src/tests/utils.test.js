import { describe, it, expect } from "vitest";
import { detectLanguage } from "../utils/langDetector";

describe("detectLanguage Utility", () => {
  it("returns javascript for empty/null input", () => {
    expect(detectLanguage("")).toBe("javascript");
    expect(detectLanguage(null)).toBe("javascript");
  });

  it("detects C++ code", () => {
    const cppCode1 = `#include <iostream>\nusing namespace std;\nint main() { cout << "hello"; }`;
    const cppCode2 = `#include <vector>\n#include <algorithm>\nvector<int> v; std::sort(v.begin(), v.end());`;
    expect(detectLanguage(cppCode1)).toBe("cpp");
    expect(detectLanguage(cppCode2)).toBe("cpp");
  });

  it("detects Java code including methods without class declaration", () => {
    const javaWithClass = `public class Solution {\n  public int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> map = new HashMap<>();\n    return new int[]{0, 1};\n  }\n}`;
    const javaMethodOnly = `public static int[] twoSum(int[] nums, int target) {\n  Map<Integer, Integer> map = new HashMap<>();\n  for (int i = 0; i < nums.length; i++) {\n    int complement = target - nums[i];\n    if (map.containsKey(complement)) return new int[]{map.get(complement), i};\n    map.put(nums[i], i);\n  }\n  return new int[]{};\n}`;
    const javaArrays = `import java.util.ArrayList;\npublic static List<Integer> solve(int[] arr) {\n  List<Integer> result = new ArrayList<>();\n  return result;\n}`;
    expect(detectLanguage(javaWithClass)).toBe("java");
    expect(detectLanguage(javaMethodOnly)).toBe("java");
    expect(detectLanguage(javaArrays)).toBe("java");
  });

  it("detects Python code", () => {
    const pythonCode = `def binary_search(arr, target):\n  left, right = 0, len(arr) - 1\n  while left <= right:\n    mid = (left + right) // 2\n    if arr[mid] == target:\n      return mid\n    elif arr[mid] < target:\n      left = mid + 1\n    else:\n      right = mid - 1\n  return -1`;
    expect(detectLanguage(pythonCode)).toBe("python");
  });

  it("detects Rust code", () => {
    const rustCode = `fn fibonacci(n: u32) -> u32 {\n  let mut a = 0;\n  let mut b = 1;\n  for _ in 0..n {\n    let temp = a;\n    a = b;\n    b = temp + b;\n  }\n  a\n}`;
    expect(detectLanguage(rustCode)).toBe("rust");
  });

  it("detects JavaScript code", () => {
    const jsCode = `const twoSum = (nums, target) => {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n  return [];\n};`;
    expect(detectLanguage(jsCode)).toBe("javascript");
  });

  it("does NOT mis-detect Java as JavaScript", () => {
    const javaNoClass = `public static boolean isPrime(int n) {\n  if (n < 2) return false;\n  for (int i = 2; i <= Math.sqrt(n); i++) {\n    if (n % i == 0) return false;\n  }\n  return true;\n}`;
    const result = detectLanguage(javaNoClass);
    expect(result).toBe("java");
    expect(result).not.toBe("javascript");
  });
});
