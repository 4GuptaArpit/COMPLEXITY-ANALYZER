export const mockTranslations = {
  bubble_sort: {
    javascript: {
      convertedCode: `function bubbleSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap elements
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`,
      explanation: "Already in JavaScript! Copied the original code directly. JavaScript uses standard dynamic arrays and C-style nested loops."
    },
    python: {
      convertedCode: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                # Swap elements cleanly using Python tuple packing
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
      explanation: "Python conversion complete:\n1. Removed dynamic variable initializations (no let/var).\n2. Changed standard C-style loops to idiomatic `range` iterations.\n3. Swapped elements using Python's tuple packing syntax: `a, b = b, a`, which avoids using a temporary variable.\n4. Adjusted indentation to use 4-space blocks instead of braces `{}`."
    },
    cpp: {
      convertedCode: `#include <vector>
#include <algorithm>

std::vector<int> bubbleSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Swap elements using std::swap
                std::swap(arr[j], arr[j + 1]);
            }
        }
    }
    return arr;
}`,
      explanation: "C++ conversion complete:\n1. Imported `<vector>` to represent the dynamic array structure and `<algorithm>` for `std::swap`.\n2. Declared explicit types: function returns `std::vector<int>` and accepts the vector as a mutable reference `&` to modify it in-place.\n3. Replaced custom temporary variable swap with the highly optimized STL utility `std::swap`.\n4. Standardized indices to use static `int` types."
    },
    java: {
      convertedCode: `public class BubbleSort {
    public static int[] bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    // Swap elements
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        return arr;
    }
}`,
      explanation: "Java conversion complete:\n1. Wrapped the method inside a helper utility class `BubbleSort` since Java is strictly object-oriented.\n2. Declared the method as `public static` so it can be invoked directly without instantiating the class.\n3. Declared explicit primitive type `int[]` for the array parameter and return type, and standard `int` for loop counters.\n4. Replaced `.length` property instead of JavaScript's `.length` getter."
    },
    rust: {
      convertedCode: `fn bubble_sort(arr: &mut [i32]) -> &[i32] {
    let n = arr.len();
    for i in 0..n {
        for j in 0..n - i - 1 {
            if arr[j] > arr[j + 1] {
                // Swap elements safely using slice::swap
                arr.swap(j, j + 1);
            }
        }
    }
    arr
}`,
      explanation: "Rust conversion complete:\n1. Handled Rust's strict ownership model by accepting a mutable slice `&mut [i32]` to permit in-place swapping.\n2. Substituted standard C-style loops with range intervals `0..n` and index calculations.\n3. Used slice-safe method `arr.swap(j, j + 1)` which avoids unsafe borrow-checker issues during mutable index updates.\n4. Returned the final reference using Rust's expression block evaluation (no `return` keyword needed)."
    }
  },
  binary_search: {
    javascript: {
      convertedCode: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) {
      return mid;
    }
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}`,
      explanation: "Already in JavaScript! Copied the original code directly."
    },
    python: {
      convertedCode: `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    while left <= right:
        # Python floor division
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
      explanation: "Python conversion complete:\n1. Used Python's double slash operator `//` for floor integer division, replacing `Math.floor(...)`.\n2. Simplified logical blocks and replaced JS triple-equals `===` with standard equality comparison `==`.\n3. Structured code using 4-space syntax blocks."
    },
    cpp: {
      convertedCode: `#include <vector>

int binarySearch(const std::vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size() - 1;
    while (left <= right) {
        // Prevent overflow by calculating mid with subtraction
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) {
            return mid;
        }
        if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}`,
      explanation: "C++ conversion complete:\n1. Vector passed as a constant reference `const std::vector<int>&` to prevent copy overhead.\n2. Replaced division with index boundary calculations: `left + (right - left) / 2` to avoid integer overflow issues in large lists.\n3. Defined strict integer parameter inputs and returned values."
    },
    java: {
      convertedCode: `public class BinarySearch {
    public static int binarySearch(int[] arr, int target) {
        int left = 0;
        int right = arr.length - 1;
        while (left <= right) {
            // Prevent potential integer overflow
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) {
                return mid;
            }
            if (arr[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return -1;
    }
}`,
      explanation: "Java conversion complete:\n1. Encapsulated in a static utility class `BinarySearch`.\n2. Replaced `Math.floor` with basic integer division `/` since Java naturally drops fractional remainders when dividing two `int` parameters.\n3. Applied the safe mid-index algorithm: `left + (right - left) / 2`."
    },
    rust: {
      convertedCode: `fn binary_search(arr: &[i32], target: i32) -> isize {
    let mut left = 0isize;
    let mut right = arr.len() as isize - 1;
    
    while left <= right {
        let mid = left + (right - left) / 2;
        let mid_val = arr[mid as usize];
        
        if mid_val == target {
            return mid;
        }
        if mid_val < target {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    -1
}`,
      explanation: "Rust conversion complete:\n1. Explicitly cast slice length `arr.len()` to signed integer `isize` to prevent negative index out of bounds exceptions on empty arrays or left shift decrements.\n2. Made indexing variables `mut` (mutable) to enable updating search scopes.\n3. Dereferenced index `arr[mid as usize]` by explicitly converting index pointer bounds to standard `usize` array types."
    }
  },
  recursive_fibonacci: {
    javascript: {
      convertedCode: `function fibonacci(n) {
  if (n <= 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
      explanation: "Already in JavaScript! Copied the original code directly."
    },
    python: {
      convertedCode: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)`,
      explanation: "Python conversion complete:\n1. Removed JS brace brackets and `function` indicator.\n2. Translated logical recursive call statements into pythonic clean script return statements."
    },
    cpp: {
      convertedCode: `int fibonacci(int n) {
    if (n <= 1) {
        return n;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
}`,
      explanation: "C++ conversion complete:\n1. Typed the input parameter `n` as integer (`int`) and declared method signature return as integer `int`."
    },
    java: {
      convertedCode: `public class Fibonacci {
    public static int fibonacci(int n) {
        if (n <= 1) {
            return n;
        }
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}`,
      explanation: "Java conversion complete:\n1. Created class wrapper `Fibonacci`.\n2. Declared parameters as `int` types."
    },
    rust: {
      convertedCode: `fn fibonacci(n: u32) -> u32 {
    if n <= 1 {
        return n;
    }
    fibonacci(n - 1) + fibonacci(n - 2)
}`,
      explanation: "Rust conversion complete:\n1. Handled type declaration as unsigned integer `u32` since index counts and Fibonacci ranges cannot go below zero.\n2. Evaluated and returned math branches using Rust block return expressions."
    }
  },
  two_sum: {
    javascript: {
      convertedCode: `function twoSum(nums, target) {
  let n = nums.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}`,
      explanation: "Already in JavaScript! Copied the original code directly."
    },
    python: {
      convertedCode: `def two_sum(nums, target):
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
      explanation: "Python conversion complete:\n1. Used pythonic loops: outer `range(n)` and inner `range(i + 1, n)`.\n2. Returned native list formats `[]`."
    },
    cpp: {
      convertedCode: `#include <vector>

std::vector<int> twoSum(const std::vector<int>& nums, int target) {
    int n = nums.size();
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[i] + nums[j] == target) {
                return {i, j};
            }
        }
    }
    return {};
}`,
      explanation: "C++ conversion complete:\n1. Inputs defined as `std::vector<int>`.\n2. Retails clean list initialization: returned indices inside braces `{i, j}` or `{}`."
    },
    java: {
      convertedCode: `public class TwoSum {
    public static int[] twoSum(int[] nums, int target) {
        int n = nums.length;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (nums[i] + nums[j] == target) {
                    return new int[] { i, j };
                }
            }
        }
        return new int[] {};
    }
}`,
      explanation: "Java conversion complete:\n1. Created class structure `TwoSum`.\n2. Returns new primitive int arrays instantiated inline: `new int[] { i, j }`."
    },
    rust: {
      convertedCode: `fn two_sum(nums: &[i32], target: i32) -> Vec<usize> {
    let n = nums.len();
    for i in 0..n {
        for j in (i + 1)..n {
            if nums[i] + nums[j] == target {
                return vec![i, j];
            }
        }
    }
    vec![]
}`,
      explanation: "Rust conversion complete:\n1. Returns array indices inside standard Rust vectors: `Vec<usize>`.\n2. Uses range iteration: outer loop `0..n`, inner loop `(i + 1)..n`.\n3. Instantiates vectors using standard macro helper `vec![i, j]`."
    }
  }
};
