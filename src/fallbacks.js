// fallbacks.js - Standalone Algorithm Defaults

export const fallbackAlgorithms = new Map([
    ["shell_sort", {
        id: "shell_sort",
        name: "Shell Sort",
        complexity: { best: "O(n log n)", average: "O(n^(7/6))", worst: "O(n^2)" },
        runtime_behavior: {
            sorted: "Best case: O(n log n). Minimal shifts needed when already ordered.",
            random: "Average case: O(n^(7/6)) to O(n^(5/4)) depending on gap choices.",
            reversed: "Worst case: O(n^2). Maximum far exchanges required across the array bounds."
        },
        description: "An extension of insertion sort that allows the exchange of far-apart elements.",
        display_code: [
            "function shellSort(arr) {",
            "  let n = arr.length;",
            "  for (let gap = Math.floor(n/2); gap > 0; gap = Math.floor(gap/2)) {",
            "    for (let i = gap; i < n; i += 1) {",
            "      let temp = arr[i];",
            "      let j;",
            "      for (j = i; j >= gap && arr[j - gap] > temp; j -= gap) {",
            "        arr[j] = arr[j - gap];",
            "      }",
            "      arr[j] = temp;",
            "    }",
            "  }",
            "  return arr;",
            "}"
        ],
        generator_code: `
            function* shellSort(arr) {
                let n = arr.length;
                for (let gap = Math.floor(n/2); gap > 0; gap = Math.floor(gap/2)) {
                    for (let i = gap; i < n; i += 1) {
                        let temp = arr[i]; let j;
                        for (j = i; j >= gap; j -= gap) {
                            yield { line: 6, compare: [j - gap, i], vars: { n, gap, i, temp, j } };
                            if (arr[j - gap] > temp) {
                                arr[j] = arr[j - gap];
                                yield { line: 7, assign: [j, arr[j - gap]], vars: { n, gap, i, temp, j } };
                            } else { break; }
                        }
                        arr[j] = temp;
                        yield { line: 9, assign: [j, temp], vars: { n, gap, i, temp, j } };
                    }
                }
                yield { line: 12, vars: { n } };
                return arr;
            }
        `
    }],
    ["insertion_sort", {
        id: "insertion_sort",
        name: "Insertion Sort",
        complexity: { best: "O(n)", average: "O(n^2)", worst: "O(n^2)" },
        runtime_behavior: {
            sorted: "Best case: O(n). Inner loop terminates instantly for every item.",
            random: "Average case: O(n^2). Shifting elements takes quadratic time on average.",
            reversed: "Worst case: O(n^2). Maximum comparisons and shifts required."
        },
        description: "Builds the final sorted array one item at a time by inserting elements into place.",
        display_code: [
            "function insertionSort(arr) {",
            "  let n = arr.length;",
            "  for (let i = 1; i < n; i++) {",
            "    let key = arr[i];",
            "    let j = i - 1;",
            "    while (j >= 0 && arr[j] > key) {",
            "      arr[j + 1] = arr[j];",
            "      j = j - 1;",
            "    }",
            "    arr[j + 1] = key;",
            "  }",
            "  return arr;",
            "}"
        ],
        generator_code: `function* insertionSort(arr) {
            let n = arr.length;
            for (let i = 1; i < n; i++) {
                let key = arr[i]; let j = i - 1;
                while (j >= 0) {
                    yield { line: 5, compare: [j, i], vars: { n, i, key, j } };
                    if (arr[j] > key) {
                        arr[j + 1] = arr[j];
                        yield { line: 6, assign: [j + 1, arr[j]], vars: { n, i, key, j } };
                        j = j - 1;
                    } else { break; }
                }
                arr[j + 1] = key;
                yield { line: 9, assign: [j + 1, key], vars: { n, i, key, j } };
            }
            yield { line: 11, vars: { n } };
            return arr;
        }`
    }],
    ["bubble_sort", {
        id: "bubble_sort",
        name: "Bubble Sort",
        complexity: { best: "O(n)", average: "O(n^2)", worst: "O(n^2)" },
        runtime_behavior: {
            sorted: "Best case: O(n). Optimized implementation breaks early if a pass has no swaps.",
            random: "Average case: O(n^2). Repeatedly stepping through lists swapping pairs.",
            reversed: "Worst case: O(n^2). Inverted data forcing maximum swaps."
        },
        description: "Repeatedly steps through the list, compares adjacent elements, and swaps them.",
        display_code: [
            "function bubbleSort(arr) {",
            "  let n = arr.length;",
            "  for (let i = 0; i < n - 1; i++) {",
            "    let swapped = false;",
            "    for (let j = 0; j < n - i - 1; j++) {",
            "      if (arr[j] > arr[j + 1]) {",
            "        let temp = arr[j];",
            "        arr[j] = arr[j + 1];",
            "        arr[j + 1] = temp;",
            "        swapped = true;",
            "      }",
            "    }",
            "    if (!swapped) break;",
            "  }",
            "  return arr;",
            "}"
        ],
        generator_code: `function* bubbleSort(arr) {
            let n = arr.length;
            for (let i = 0; i < n - 1; i++) {
                let swapped = false;
                for (let j = 0; j < n - i - 1; j++) {
                    yield { line: 4, compare: [j, j + 1], vars: { n, i, j, swapped } };
                    if (arr[j] > arr[j + 1]) {
                        let temp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = temp;
                        yield { line: 5, swap: [j, j + 1], vars: { n, i, j, swapped } };
                        swapped = true;
                    }
                }
                if (!swapped) break;
            }
            yield { line: 14, vars: { n } };
            return arr;
        }`
    }],
    ["selection_sort", {
        id: "selection_sort",
        name: "Selection Sort",
        complexity: { best: "O(n^2)", average: "O(n^2)", worst: "O(n^2)" },
        runtime_behavior: {
            sorted: "Best case: O(n^2). Must scan remaining unsorted workspace entirely to confirm choice.",
            random: "Average case: O(n^2). Consistently isolation scans element sizes.",
            reversed: "Worst case: O(n^2). Identical work profiles across configurations."
        },
        description: "Repeatedly isolates the minimum element from the unsorted region and places it up front.",
        display_code: [
            "function selectionSort(arr) {",
            "  let n = arr.length;",
            "  for (let i = 0; i < n - 1; i++) {",
            "    let minIdx = i;",
            "    for (let j = i + 1; j < n; j++) {",
            "      if (arr[j] < arr[minIdx]) {",
            "        minIdx = j;",
            "      }",
            "    }",
            "    if (minIdx !== i) {",
            "      let temp = arr[i];",
            "      arr[i] = arr[minIdx];",
            "      arr[minIdx] = temp;",
            "    }",
            "  }",
            "  return arr;",
            "}"
        ],
        generator_code: `function* selectionSort(arr) {
            let n = arr.length;
            for (let i = 0; i < n - 1; i++) {
                let minIdx = i;
                for (let j = i + 1; j < n; j++) {
                    yield { line: 5, compare: [j, minIdx], vars: { n, i, minIdx, j } };
                    if (arr[j] < arr[minIdx]) { minIdx = j; }
                }
                if (minIdx !== i) {
                    let temp = arr[i]; arr[i] = arr[minIdx]; arr[minIdx] = temp;
                    yield { line: 11, swap: [i, minIdx], vars: { n, i, minIdx } };
                }
            }
            yield { line: 15, vars: { n } };
            return arr;
        }`
    }],
    ["heap_sort", {
        id: "heap_sort",
        name: "Heap Sort",
        complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
        runtime_behavior: {
            sorted: "Best case: O(n log n). Building max-heap and sifting requires full logarithmic actions.",
            random: "Average case: O(n log n). Highly predictable, robust workspace balancing patterns.",
            reversed: "Worst case: O(n log n). Structured heap formation ensures smooth predictable load shapes."
        },
        description: "Structures the array into a max-heap, extracting roots sequentially.",
        display_code: [
            "function heapSort(arr) {",
            "  let n = arr.length;",
            "  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {",
            "    heapify(arr, n, i);",
            "  }",
            "  for (let i = n - 1; i > 0; i--) {",
            "    swap(arr, 0, i);",
            "    heapify(arr, i, 0);",
            "  }",
            "}",
            "",
            "function heapify(arr, size, root) {",
            "  let largest = root;",
            "  let left = 2 * root + 1;",
            "  let right = 2 * root + 2;",
            "  if (left < size && arr[left] > arr[largest]) largest = left;",
            "  if (right < size && arr[right] > arr[largest]) largest = right;",
            "  if (largest !== root) {",
            "    swap(arr, root, largest);",
            "    heapify(arr, size, largest);",
            "  }",
            "}"
        ],
        generator_code: `function* heapSort(arr) {
            let n = arr.length;
            for (let i = Math.floor(n / 2) - 1; i >= 0; i--) { yield* heapify(arr, n, i); }
            for (let i = n - 1; i > 0; i--) {
                let temp = arr[0]; arr[0] = arr[i]; arr[i] = temp;
                yield { line: 6, swap: [0, i], vars: { n, i } };
                yield* heapify(arr, i, 0);
            }
            yield { line: 8, vars: { n } };
            function* heapify(arr, size, root) {
                let largest = root; let left = 2 * root + 1; let right = 2 * root + 2;
                if (left < size) {
                    yield { line: 15, compare: [left, largest], vars: { size, root, largest } };
                    if (arr[left] > arr[largest]) largest = left;
                }
                if (right < size) {
                    yield { line: 16, compare: [right, largest], vars: { size, root, largest } };
                    if (arr[right] > arr[largest]) largest = right;
                }
                if (largest !== root) {
                    let temp = arr[root]; arr[root] = arr[largest]; arr[largest] = temp;
                    yield { line: 18, swap: [root, largest], vars: { size, root, largest } };
                    yield* heapify(arr, size, largest);
                }
            }
        }`
    }],
    ["quick_sort", {
        id: "quick_sort",
        name: "Quick Sort (Lomuto)",
        complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n^2)" },
        runtime_behavior: {
            sorted: "Worst case: O(n^2) if Lomuto pivots choose maximum items recursively.",
            random: "Average case: O(n log n). Highly optimized partitioning structures.",
            reversed: "Worst case: O(n^2). Imbalance matches fully reversed sorting workspaces."
        },
        description: "Divide-and-conquer strategy creating partitions around pivot indexes recursively.",
        display_code: [
            "function quickSort(arr, low, high) {",
            "  if (low < high) {",
            "    let pivot = arr[high];",
            "    let i = low - 1;",
            "    for (let j = low; j < high; j++) {",
            "      if (arr[j] < pivot) {",
            "        i++;",
            "        swap(arr, i, j);",
            "      }",
            "    }",
            "    swap(arr, i + 1, high);",
            "    let pi = i + 1;",
            "    quickSort(arr, low, pi - 1);",
            "    quickSort(arr, pi + 1, high);",
            "  }",
            "}"
        ],
        generator_code: `function* quickSort(arr) {
            function* quickSortHelper(low, high) {
                if (low < high) {
                    let pivot = arr[high]; let i = low - 1;
                    for (let j = low; j < high; j++) {
                        yield { line: 5, compare: [j, high], vars: { low, high, pivot, i, j } };
                        if (arr[j] < pivot) {
                            i++; let temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
                            yield { line: 7, swap: [i, j], vars: { low, high, pivot, i, j } };
                        }
                    }
                    let temp = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = temp;
                    yield { line: 10, swap: [i + 1, high], vars: { low, high, pivot, i } };
                    let pi = i + 1;
                    yield* quickSortHelper(low, pi - 1);
                    yield* quickSortHelper(pi + 1, high);
                }
            }
            yield* quickSortHelper(0, arr.length - 1);
            yield { line: 15, vars: {} };
        }`
    }],
    ["merge_sort", {
        id: "merge_sort",
        name: "Merge Sort (In-Place)",
        complexity: { best: "O(n log n)", average: "O(n^2)", worst: "O(n^2)" },
        runtime_behavior: {
            sorted: "Best case: O(n log n). In-place shifting bypasses operations cleanly.",
            random: "Average case: O(n^2). Memory optimization tradeoff forces array shifts.",
            reversed: "Worst case: O(n^2). Maximum shifts required inside individual partitions."
        },
        description: "Variant that merges partitions without extra array allocations.",
        display_code: [
            "function mergeSort(arr, start, end) {",
            "  if (start < end) {",
            "    let mid = Math.floor((start + end) / 2);",
            "    mergeSort(arr, start, mid);",
            "    mergeSort(arr, mid + 1, end);",
            "    let p1 = start, p2 = mid + 1;",
            "    while (p1 <= mid && p2 <= end) {",
            "      if (arr[p1] <= arr[p2]) { p1++; }",
            "      else {",
            "        let val = arr[p2], idx = p2;",
            "        while (idx > p1) {",
            "          arr[idx] = arr[idx - 1];",
            "          idx--;",
            "        }",
            "        arr[p1] = val;",
            "        p1++; mid++; p2++;",
            "      }",
            "    }",
            "  }",
            "}"
        ],
        generator_code: `function* mergeSort(arr) {
            function* sort(start, end) {
                if (start < end) {
                    let mid = Math.floor((start + end) / 2);
                    yield* sort(start, mid);
                    yield* sort(mid + 1, end);
                    let p1 = start; let p2 = mid + 1;
                    while (p1 <= mid && p2 <= end) {
                        yield { line: 7, compare: [p1, p2], vars: { start, end, mid, p1, p2 } };
                        if (arr[p1] <= arr[p2]) { p1++; }
                        else {
                            let val = arr[p2]; let idx = p2;
                            while (idx > p1) {
                                arr[idx] = arr[idx - 1];
                                yield { line: 11, assign: [idx, arr[idx-1]], vars: { start, end, mid, p1, p2, val, idx } };
                                idx--;
                            }
                            arr[p1] = val;
                            yield { line: 14, assign: [p1, val], vars: { start, end, mid, p1, p2, val } };
                            p1++; mid++; p2++;
                        }
                    }
                }
            }
            yield* sort(0, arr.length - 1);
            yield { line: 19, vars: {} };
        }`
    }]
]);