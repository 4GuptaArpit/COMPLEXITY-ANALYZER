export const mergeSortMockAnalysis = {
  timeComplexity: "O(N log N)",
  spaceComplexity: "O(N)",
  explanation: `Merge Sort is an efficient, comparison-based, divide-and-conquer sorting algorithm.

### Detailed Complexity Analysis:
1. **Time Complexity O(N log N):**
   - **Divide Step:** The array of size N is recursively divided in half, which takes O(log N) depth.
   - **Conquer/Merge Step:** At each recursion depth, all elements are merged back together. The merging process takes linear time O(N) at each level.
   - **Total:** O(N) operations across O(log N) levels results in a guaranteed O(N log N) time complexity for best, average, and worst cases.

2. **Space Complexity O(N):**
   - Requires O(N) auxiliary space to temporarily store merged sub-arrays before copying them back to the original array.`,
  optimizedCode: `// Already highly optimal!
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}`,
  optimizationExplanation: "Your code is already running at optimal complexity! Merge Sort is the standard O(N log N) sorting method.",
  heatmap: {
    1: "low",
    2: "low",
    3: "medium",
    4: "high",
    5: "high",
    6: "high",
    9: "low",
    10: "low",
    11: "medium",
    12: "high",
    14: "low"
  },
  simulation: [
    { line: 1, vars: { arr: "[4, 2, 1, 3]" }, explanation: "Calling mergeSort on [4, 2, 1, 3]" },
    { line: 2, vars: { arr: "[4, 2, 1, 3]" }, explanation: "Base case check: length is 4 (greater than 1)" },
    { line: 3, vars: { arr: "[4, 2, 1, 3]", mid: 2 }, explanation: "Dividing array at middle index 2" },
    { line: 4, vars: { arr: "[4, 2, 1, 3]", left: "[4, 2]" }, explanation: "Recursively sorting left half: [4, 2]" },
    { line: 1, vars: { arr: "[4, 2]" }, explanation: "mergeSort([4, 2]) sub-call" },
    { line: 4, vars: { arr: "[4, 2]", left: "[4]" }, explanation: "mergeSort([4]) returns [4] (base case)" },
    { line: 5, vars: { arr: "[4, 2]", right: "[2]" }, explanation: "mergeSort([2]) returns [2] (base case)" },
    { line: 6, vars: { arr: "[4, 2]", left: "[4]", right: "[2]" }, explanation: "Merging [4] and [2] using merge()" },
    { line: 9, vars: { left: "[4]", right: "[2]" }, explanation: "merge() starting. result = [], l = 0, r = 0" },
    { line: 11, vars: { left: "[4]", right: "[2]", result: "[2]" }, explanation: "2 < 4. Pushed 2 to result." },
    { line: 14, vars: { left: "[4]", right: "[2]", result: "[2, 4]" }, explanation: "Merged result: [2, 4]" },
    { line: 5, vars: { arr: "[4, 2, 1, 3]", right: "[1, 3]" }, explanation: "Recursively sorting right half: [1, 3]" },
    { line: 6, vars: { left: "[2, 4]", right: "[1, 3]" }, explanation: "Merging sorted halves: [2, 4] and [1, 3]" },
    { line: 14, vars: { result: "[1, 2, 3, 4]" }, explanation: "Merge complete. Returning fully sorted array: [1, 2, 3, 4]" }
  ],
  quiz: [
    {
      stepIndex: 3,
      question: "Why is the array split at index 2?",
      options: [
        "Because index 2 is Math.floor(4 / 2)",
        "Because 2 is the smallest element",
        "It is always split at index 2",
        "To skip the odd indices"
      ],
      answer: "Because index 2 is Math.floor(4 / 2)"
    }
  ]
};

export const binarySearchRecursiveMockAnalysis = {
  timeComplexity: "O(log N)",
  spaceComplexity: "O(log N)",
  explanation: `Recursive Binary Search searches for a target value within a sorted array by dividing the search range in half recursively.

### Detailed Complexity Analysis:
1. **Time Complexity O(log N):**
   - Each recursive call halves the search space.
   - Reducing an input size of N to 1 takes log2(N) levels of recursion.
   - For N = 1,024 elements, it takes at most 10 steps.

2. **Space Complexity O(log N):**
   - Because each split occurs recursively, it pushes a new activation record onto the call stack.
   - The maximum depth of the call stack is log2(N), leading to O(log N) auxiliary space.`,
  optimizedCode: `// Iterative binary search uses O(1) space, which is more space-efficient:
function binarySearchIterative(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
  optimizationExplanation: "Your recursive binary search is optimal in time O(log N), but uses O(log N) stack memory. We can optimize the space complexity to O(1) by converting it to an iterative loop.",
  heatmap: {
    1: "low",
    2: "low",
    3: "low",
    4: "medium",
    5: "high",
    6: "medium",
    8: "high",
    9: "low"
  },
  simulation: [
    { line: 1, vars: { arr: "[1, 3, 5, 7, 9]", target: 7, left: 0, right: 4 }, explanation: "Calling recursive binary search to find target 7 in [1, 3, 5, 7, 9]" },
    { line: 2, vars: { left: 0, right: 4 }, explanation: "Check base case: left (0) <= right (4) is TRUE" },
    { line: 3, vars: { left: 0, right: 4, mid: 2 }, explanation: "Calculated mid index = Math.floor((0 + 4) / 2) = 2. Value is arr[2] = 5" },
    { line: 4, vars: { mid: 2, val: 5 }, explanation: "Check if arr[mid] === target (5 === 7) -> FALSE" },
    { line: 5, vars: { mid: 2, val: 5 }, explanation: "Check if arr[mid] < target (5 < 7) -> TRUE" },
    { line: 6, vars: { mid: 2 }, explanation: "Recursively call binarySearchRecursive with left = mid + 1 = 3" },
    { line: 1, vars: { arr: "[1, 3, 5, 7, 9]", target: 7, left: 3, right: 4 }, explanation: "Sub-call active with left = 3, right = 4" },
    { line: 3, vars: { left: 3, right: 4, mid: 3 }, explanation: "Calculated mid index = Math.floor((3 + 4) / 2) = 3. Value is arr[3] = 7" },
    { line: 4, vars: { mid: 3, val: 7 }, explanation: "Check if arr[mid] === target (7 === 7) -> TRUE. Target found at index 3!" },
    { line: 4, vars: { returnVal: 3 }, explanation: "Returning index 3." }
  ],
  quiz: [
    {
      stepIndex: 5,
      question: "Why did the algorithm recursively search the right side?",
      options: [
        "Because the target (7) is greater than the middle element (5)",
        "Because we always start with the right side",
        "Because the left side was empty",
        "It's chosen at random"
      ],
      answer: "Because the target (7) is greater than the middle element (5)"
    }
  ]
};

export const fibonacciMemoizedMockAnalysis = {
  timeComplexity: "O(N)",
  spaceComplexity: "O(N)",
  explanation: `Memoized Fibonacci calculates the N-th Fibonacci number by caching intermediate results in a lookup table (memo).

### Detailed Complexity Analysis:
1. **Time Complexity O(N):**
   - Unlike the brute-force recursive version which repeats calculations and runs in exponential O(2^N) time, memoization ensures each Fibonacci number from 0 to N is computed exactly once.
   - Any repeated recursive call is returned from the cache in O(1) time, resulting in a total time complexity of O(N).

2. **Space Complexity O(N):**
   - Requires O(N) memory to store computed Fibonacci values in the memo dictionary.
   - The recursive call stack also reaches a maximum depth of N, using O(N) space.`,
  optimizedCode: `// Already optimal! We can also write it iteratively (Tabulation) to reduce stack memory to O(1):
function fibonacciIterative(n) {
  if (n <= 1) return n;
  let prev2 = 0, prev1 = 1;
  for (let i = 2; i <= n; i++) {
    let current = prev2 + prev1;
    prev2 = prev1;
    prev1 = current;
  }
  return prev1;
}`,
  optimizationExplanation: "Your memoized code is highly optimal at O(N) time. If we want to optimize the space complexity further to O(1), we can use an iterative bottom-up tabulation approach.",
  heatmap: {
    1: "low",
    2: "high",
    3: "low",
    4: "medium",
    5: "low"
  },
  simulation: [
    { line: 1, vars: { n: 3, memo: "{}" }, explanation: "fibonacciMemoized called with n = 3" },
    { line: 2, vars: { n: 3 }, explanation: "Check memo: 3 is not in memo." },
    { line: 3, vars: { n: 3 }, explanation: "Check base case: 3 <= 1 is FALSE." },
    { line: 4, vars: { n: 3 }, explanation: "Branching: calculating sub-calls for n=2 and n=1." },
    { line: 1, vars: { n: 2, memo: "{}" }, explanation: "Sub-call for n = 2" },
    { line: 4, vars: { n: 2 }, explanation: "Branching: calculating sub-calls for n=1 and n=0." },
    { line: 1, vars: { n: 1, memo: "{}" }, explanation: "Sub-call for n = 1" },
    { line: 3, vars: { n: 1 }, explanation: "Base case: 1 <= 1 is TRUE. Returning 1." },
    { line: 1, vars: { n: 0, memo: "{}" }, explanation: "Sub-call for n = 0" },
    { line: 3, vars: { n: 0 }, explanation: "Base case: 0 <= 1 is TRUE. Returning 0." },
    { line: 4, vars: { n: 2, memo: "{'2': 1}" }, explanation: "Sub-call for n=2 completed. Storing memo['2'] = 1. Returning 1." },
    { line: 1, vars: { n: 1, memo: "{'2': 1}" }, explanation: "Sub-call for n = 1 (second branch of n=3)" },
    { line: 2, vars: { n: 1 }, explanation: "Check memo: 1 is in memo or base case (1 <= 1 is TRUE). Returning 1 immediately from cache!" },
    { line: 4, vars: { n: 3, memo: "{'2': 1, '3': 2}" }, explanation: "Sub-call for n=3 completed (1 + 1 = 2). Returning 2." }
  ],
  quiz: [
    {
      stepIndex: 12,
      question: "Why did the second branch call for n=1 return immediately?",
      options: [
        "Because it was already in the memo cache or triggered the base case directly",
        "Because the algorithm crashed",
        "Because we skipped that calculation to save time",
        "Because n = 1 is always ignored"
      ],
      answer: "Because it was already in the memo cache or triggered the base case directly"
    }
  ]
};

export const twoSumOptimizedMockAnalysis = {
  timeComplexity: "O(N)",
  spaceComplexity: "O(N)",
  explanation: `Optimized Two Sum uses a Hash Map (Map object) to achieve linear time complexity.

### Detailed Complexity Analysis:
1. **Time Complexity O(N):**
   - The algorithm iterates through the array of size N exactly once.
   - For each element, looking up the required complement (target - current) in the hash map takes O(1) constant time on average.
   - Total time complexity is O(N) operations.

2. **Space Complexity O(N):**
   - In the worst case, if no matching pair is found until the end, we will store up to N elements in the Map cache, which takes O(N) auxiliary space.`,
  optimizedCode: `// Already highly optimal!
function twoSumOptimized(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement), i];
    map.set(nums[i], i);
  }
  return [];
}`,
  optimizationExplanation: "Your hash map implementation is already optimal at O(N) time and O(N) space. No further improvements are needed.",
  heatmap: {
    1: "low",
    2: "low",
    3: "high",
    4: "high",
    5: "medium",
    7: "high",
    9: "low"
  },
  simulation: [
    { line: 1, vars: { nums: "[3, 2, 4]", target: 6 }, explanation: "twoSumOptimized called with nums = [3, 2, 4], target = 6" },
    { line: 2, vars: { map: "empty Map" }, explanation: "Initialized empty Map object" },
    { line: 3, vars: { i: 0, num: 3 }, explanation: "Starting loop. i = 0, nums[0] = 3" },
    { line: 4, vars: { complement: 3 }, explanation: "Calculated complement = 6 - 3 = 3" },
    { line: 5, vars: { map: "empty Map" }, explanation: "Checked if map contains 3 -> FALSE" },
    { line: 8, vars: { map: "{3 => 0}" }, explanation: "Added nums[0] = 3 to map with index 0. Map is now {3 => 0}" },
    { line: 3, vars: { i: 1, num: 2 }, explanation: "Loop continues. i = 1, nums[1] = 2" },
    { line: 4, vars: { complement: 4 }, explanation: "Calculated complement = 6 - 2 = 4" },
    { line: 5, vars: { map: "{3 => 0}" }, explanation: "Checked if map contains 4 -> FALSE" },
    { line: 8, vars: { map: "{3 => 0, 2 => 1}" }, explanation: "Added nums[1] = 2 to map with index 1. Map is now {3 => 0, 2 => 1}" },
    { line: 3, vars: { i: 2, num: 4 }, explanation: "Loop continues. i = 2, nums[2] = 4" },
    { line: 4, vars: { complement: 2 }, explanation: "Calculated complement = 6 - 4 = 2" },
    { line: 5, vars: { map: "{3 => 0, 2 => 1}" }, explanation: "Checked if map contains 2 -> TRUE! Complement found." },
    { line: 6, vars: { returnVal: "[1, 2]" }, explanation: "Found match! Returning indices: [1, 2]" }
  ],
  quiz: [
    {
      stepIndex: 12,
      question: "What complement value was found in the hash map that matched our current element?",
      options: [
        "2 (complement for current element 4)",
        "3 (complement for current element 3)",
        "4 (complement for current element 2)",
        "6"
      ],
      answer: "2 (complement for current element 4)"
    }
  ]
};
