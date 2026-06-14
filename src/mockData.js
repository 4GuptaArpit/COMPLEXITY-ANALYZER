export const mockAlgorithms = [
  {
    id: "bubble_sort",
    name: "Bubble Sort",
    language: "javascript",
    timeComplexity: "O(N²)",
    spaceComplexity: "O(1)",
    explanation: "Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted. It is called Bubble Sort because smaller or larger elements 'bubble' to the top of the list.",
    code: `function bubbleSort(arr) {
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
    optimizedCode: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  let result = [], l = 0, r = 0;
  while (l < left.length && r < right.length) {
    if (left[l] < right[r]) result.push(left[l++]);
    else result.push(right[r++]);
  }
  return result.concat(left.slice(l)).concat(right.slice(r));
}`,
    optimizationExplanation: "Bubble Sort runs in **O(N²)** time due to nested loops. We can optimize it by using **Merge Sort**, which uses a divide-and-conquer strategy. Merge Sort recursively splits the array in half, sorts the halves, and merges them in **O(N log N)** time. This is a dramatic improvement for large arrays: for N = 10,000 elements, Bubble Sort does ~100M operations, while Merge Sort does only ~130K.",
    heatmap: {
      1: "low",
      2: "low",
      3: "medium",
      4: "high",
      5: "high",
      7: "high",
      8: "high",
      9: "high",
      13: "low"
    },
    simulation: [
      { line: 1, vars: { arr: "[5, 3, 8]" }, explanation: "Function called with array: [5, 3, 8]" },
      { line: 2, vars: { arr: "[5, 3, 8]", n: 3 }, explanation: "Determined array length n = 3" },
      { line: 3, vars: { arr: "[5, 3, 8]", n: 3, i: 0 }, explanation: "Outer loop starts. i = 0" },
      { line: 4, vars: { arr: "[5, 3, 8]", n: 3, i: 0, j: 0 }, explanation: "Inner loop starts. Comparing arr[0] (5) and arr[1] (3). j = 0" },
      { line: 5, vars: { arr: "[5, 3, 8]", n: 3, i: 0, j: 0 }, explanation: "5 > 3 is TRUE. Preparing to swap." },
      { line: 7, vars: { arr: "[5, 3, 8]", n: 3, i: 0, j: 0, temp: 5 }, explanation: "Stored temp = 5" },
      { line: 8, vars: { arr: "[3, 3, 8]", n: 3, i: 0, j: 0, temp: 5 }, explanation: "Copied arr[1] to arr[0]. Array is now [3, 3, 8]" },
      { line: 9, vars: { arr: "[3, 5, 8]", n: 3, i: 0, j: 0, temp: 5 }, explanation: "Copied temp to arr[1]. Swapped! Array is now [3, 5, 8]" },
      { line: 4, vars: { arr: "[3, 5, 8]", n: 3, i: 0, j: 1 }, explanation: "Inner loop increments. Comparing arr[1] (5) and arr[2] (8). j = 1" },
      { line: 5, vars: { arr: "[3, 5, 8]", n: 3, i: 0, j: 1 }, explanation: "5 > 8 is FALSE. No swap needed." },
      { line: 3, vars: { arr: "[3, 5, 8]", n: 3, i: 1 }, explanation: "Outer loop increments. i = 1" },
      { line: 4, vars: { arr: "[3, 5, 8]", n: 3, i: 1, j: 0 }, explanation: "Inner loop starts. Comparing arr[0] (3) and arr[1] (5). j = 0" },
      { line: 5, vars: { arr: "[3, 5, 8]", n: 3, i: 1, j: 0 }, explanation: "3 > 5 is FALSE. No swap needed." },
      { line: 3, vars: { arr: "[3, 5, 8]", n: 3, i: 2 }, explanation: "Outer loop finished (i reached n-1)." },
      { line: 13, vars: { arr: "[3, 5, 8]", returnVal: "[3, 5, 8]" }, explanation: "Returning sorted array: [3, 5, 8]" }
    ],
    quiz: [
      {
        stepIndex: 3,
        question: "Why does the inner loop start with j = 0?",
        options: [
          "To compare the first element with its neighbor",
          "Because j must always equal i",
          "To skip the sorted elements at the end",
          "It's a syntax requirement in JavaScript"
        ],
        answer: "To compare the first element with its neighbor"
      },
      {
        stepIndex: 9,
        question: "What is the state of the array after the first swap?",
        options: [
          "[5, 3, 8]",
          "[3, 5, 8]",
          "[8, 5, 3]",
          "[3, 8, 5]"
        ],
        answer: "[3, 5, 8]"
      }
    ]
  },
  {
    id: "binary_search",
    name: "Binary Search",
    language: "javascript",
    timeComplexity: "O(log N)",
    spaceComplexity: "O(1)",
    explanation: "Binary Search is an efficient algorithm for finding an item from a sorted list of items. It works by repeatedly dividing in half the portion of the list that could contain the item, until you've narrowed down the possible locations to just one.",
    code: `function binarySearch(arr, target) {
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
    optimizedCode: `// Binary search is already highly optimal at O(log N).
// For recursive visual styling, here is the recursive version:
function binarySearchRecursive(arr, target, left = 0, right = arr.length - 1) {
  if (left > right) return -1;
  let mid = Math.floor((left + right) / 2);
  if (arr[mid] === target) return mid;
  if (arr[mid] < target) {
    return binarySearchRecursive(arr, target, mid + 1, right);
  }
  return binarySearchRecursive(arr, target, left, mid - 1);
}`,
    optimizationExplanation: "Binary Search is already optimal at **O(log N)** time. Compared to a linear scan (**O(N)**), Binary Search is incredibly fast. For N = 1,000,000 items, linear search takes up to 1,000,000 operations, whereas Binary Search takes at most 20 operations.",
    heatmap: {
      1: "low",
      2: "low",
      3: "low",
      4: "medium",
      5: "high",
      6: "high",
      9: "high",
      11: "high"
    },
    simulation: [
      { line: 1, vars: { arr: "[2, 5, 8, 12, 16]", target: 12 }, explanation: "Searching for target 12 in sorted array [2, 5, 8, 12, 16]" },
      { line: 2, vars: { arr: "[2, 5, 8, 12, 16]", target: 12, left: 0 }, explanation: "Initialized left pointer to 0" },
      { line: 3, vars: { arr: "[2, 5, 8, 12, 16]", target: 12, left: 0, right: 4 }, explanation: "Initialized right pointer to 4 (arr.length - 1)" },
      { line: 4, vars: { arr: "[2, 5, 8, 12, 16]", target: 12, left: 0, right: 4 }, explanation: "Loop condition left <= right (0 <= 4) is TRUE" },
      { line: 5, vars: { arr: "[2, 5, 8, 12, 16]", target: 12, left: 0, right: 4, mid: 2 }, explanation: "Calculated mid-point index: mid = floor((0+4)/2) = 2. Value arr[2] is 8" },
      { line: 6, vars: { arr: "[2, 5, 8, 12, 16]", target: 12, left: 0, right: 4, mid: 2 }, explanation: "Checked arr[2] === 12 (8 === 12) -> FALSE" },
      { line: 9, vars: { arr: "[2, 5, 8, 12, 16]", target: 12, left: 0, right: 4, mid: 2 }, explanation: "Checked arr[2] < 12 (8 < 12) -> TRUE. Moving left boundary." },
      { line: 10, vars: { arr: "[2, 5, 8, 12, 16]", target: 12, left: 3, right: 4, mid: 2 }, explanation: "Updated left = mid + 1 = 3" },
      { line: 4, vars: { arr: "[2, 5, 8, 12, 16]", target: 12, left: 3, right: 4 }, explanation: "Loop condition left <= right (3 <= 4) is TRUE" },
      { line: 5, vars: { arr: "[2, 5, 8, 12, 16]", target: 12, left: 3, right: 4, mid: 3 }, explanation: "Calculated mid-point index: mid = floor((3+4)/2) = 3. Value arr[3] is 12" },
      { line: 6, vars: { arr: "[2, 5, 8, 12, 16]", target: 12, left: 3, right: 4, mid: 3 }, explanation: "Checked arr[3] === 12 (12 === 12) -> TRUE!" },
      { line: 7, vars: { arr: "[2, 5, 8, 12, 16]", target: 12, returnVal: 3 }, explanation: "Target found at index 3. Returning 3." }
    ],
    quiz: [
      {
        stepIndex: 4,
        question: "What index does 'mid' point to in the first iteration?",
        options: ["0", "1", "2", "3"],
        answer: "2"
      },
      {
        stepIndex: 7,
        question: "Why did we set left = mid + 1?",
        options: [
          "Because the target is smaller than the mid value",
          "Because the target is larger than the mid value",
          "To reset the search range completely",
          "It's just a default action"
        ],
        answer: "Because the target is larger than the mid value"
      }
    ]
  },
  {
    id: "recursive_fibonacci",
    name: "Recursive Fibonacci",
    language: "javascript",
    timeComplexity: "O(2^N)",
    spaceComplexity: "O(N)",
    explanation: "Calculates the N-th Fibonacci number using direct recursion. The algorithm is highly inefficient because it computes the same subproblems repeatedly, leading to exponential time complexity.",
    code: `function fibonacci(n) {
  if (n <= 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
    optimizedCode: `function fibonacciMemoized(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  memo[n] = fibonacciMemoized(n - 1, memo) + fibonacciMemoized(n - 2, memo);
  return memo[n];
}`,
    optimizationExplanation: "Recursive Fibonacci takes exponential time **O(2^N)** due to redundant branching. By using **Memoization** (caching computed results), we reduce the time complexity to **O(N)**. For instance, computing Fib(40) recursively takes over 1 trillion operations, while memoized takes only 80 operations.",
    heatmap: {
      1: "low",
      2: "high",
      3: "low",
      5: "high"
    },
    simulation: [
      { line: 1, vars: { n: 3 }, explanation: "fibonacci(3) called" },
      { line: 2, vars: { n: 3 }, explanation: "Condition (3 <= 1) is FALSE" },
      { line: 5, vars: { n: 3 }, explanation: "Branching: calls fibonacci(2) + fibonacci(1)" },
      { line: 1, vars: { n: 2 }, explanation: "-> fibonacci(2) sub-call started" },
      { line: 2, vars: { n: 2 }, explanation: "Condition (2 <= 1) is FALSE" },
      { line: 5, vars: { n: 2 }, explanation: "-> Branching: calls fibonacci(1) + fibonacci(0)" },
      { line: 1, vars: { n: 1 }, explanation: "--> fibonacci(1) sub-call started" },
      { line: 2, vars: { n: 1 }, explanation: "--> Condition (1 <= 1) is TRUE. Returning 1." },
      { line: 1, vars: { n: 0 }, explanation: "--> fibonacci(0) sub-call started" },
      { line: 2, vars: { n: 0 }, explanation: "--> Condition (0 <= 1) is TRUE. Returning 0." },
      { line: 5, vars: { n: 2, subResult: 1 }, explanation: "<- fibonacci(2) resolved (1 + 0 = 1). Returning 1." },
      { line: 1, vars: { n: 1 }, explanation: "-> fibonacci(1) second branch started" },
      { line: 2, vars: { n: 1 }, explanation: "-> Condition (1 <= 1) is TRUE. Returning 1." },
      { line: 5, vars: { n: 3, finalResult: 2 }, explanation: "<- fibonacci(3) resolved (fib(2)=1 + fib(1)=1). Returning 2." }
    ],
    quiz: [
      {
        stepIndex: 2,
        question: "Why doesn't the algorithm return immediately for fibonacci(3)?",
        options: [
          "Because 3 is greater than 1",
          "Because the compiler is busy",
          "Because n is odd",
          "Because 3 is a prime number"
        ],
        answer: "Because 3 is greater than 1"
      },
      {
        stepIndex: 5,
        question: "How many recursive branch calls are generated directly by fibonacci(2)?",
        options: ["1", "2", "3", "4"],
        answer: "2"
      }
    ]
  },
  {
    id: "two_sum",
    name: "Two Sum (Brute Force)",
    language: "javascript",
    timeComplexity: "O(N²)",
    spaceComplexity: "O(1)",
    explanation: "Given an array of integers and a target value, finds the indices of the two numbers that add up to the target. This brute force solution checks every possible pair, leading to quadratic time complexity.",
    code: `function twoSum(nums, target) {
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
    optimizedCode: `function twoSumOptimized(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    optimizationExplanation: "The Brute Force Two Sum checks every pair, taking **O(N²)** time. By using a **Hash Map**, we can store visited values and look up their complements (target - current) in $O(1)$ time, reducing the total time complexity to **O(N)**. Space complexity increases from $O(1)$ to $O(N)$ to store the map.",
    heatmap: {
      1: "low",
      2: "low",
      3: "medium",
      4: "high",
      5: "high",
      6: "medium"
    },
    simulation: [
      { line: 1, vars: { nums: "[3, 2, 4]", target: 6 }, explanation: "twoSum called with nums=[3, 2, 4], target=6" },
      { line: 2, vars: { nums: "[3, 2, 4]", target: 6, n: 3 }, explanation: "Determined array length n = 3" },
      { line: 3, vars: { nums: "[3, 2, 4]", target: 6, n: 3, i: 0 }, explanation: "Outer loop starts. i = 0 (val = 3)" },
      { line: 4, vars: { nums: "[3, 2, 4]", target: 6, n: 3, i: 0, j: 1 }, explanation: "Inner loop starts at j = i + 1 = 1 (val = 2)" },
      { line: 5, vars: { nums: "[3, 2, 4]", target: 6, n: 3, i: 0, j: 1 }, explanation: "Checking nums[0]+nums[1] (3 + 2 = 5) === 6 -> FALSE" },
      { line: 4, vars: { nums: "[3, 2, 4]", target: 6, n: 3, i: 0, j: 2 }, explanation: "Inner loop increments. j = 2 (val = 4)" },
      { line: 5, vars: { nums: "[3, 2, 4]", target: 6, n: 3, i: 0, j: 2 }, explanation: "Checking nums[0]+nums[2] (3 + 4 = 7) === 6 -> FALSE" },
      { line: 3, vars: { nums: "[3, 2, 4]", target: 6, n: 3, i: 1 }, explanation: "Outer loop increments. i = 1 (val = 2)" },
      { line: 4, vars: { nums: "[3, 2, 4]", target: 6, n: 3, i: 1, j: 2 }, explanation: "Inner loop starts at j = i + 1 = 2 (val = 4)" },
      { line: 5, vars: { nums: "[3, 2, 4]", target: 6, n: 3, i: 1, j: 2 }, explanation: "Checking nums[1]+nums[2] (2 + 4 = 6) === 6 -> TRUE!" },
      { line: 6, vars: { nums: "[3, 2, 4]", target: 6, returnVal: "[1, 2]" }, explanation: "Match found! Returning indices: [1, 2]" }
    ],
    quiz: [
      {
        stepIndex: 4,
        question: "Why does the inner loop start at j = i + 1 instead of j = 0?",
        options: [
          "To avoid comparing a number with itself and duplicate checks",
          "Because j cannot be smaller than i in JS",
          "To speed up indexing in the memory",
          "It is a syntax rule in loops"
        ],
        answer: "To avoid comparing a number with itself and duplicate checks"
      }
    ]
  }
];
