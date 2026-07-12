// app.js - Main Application Coordinator

import { VirtualMachine } from './virtual_machine.js';

class VisualizerApp {
    constructor() {
        this.canvas = document.getElementById('visualizer-canvas');
        this.ctx = this.canvas.getContext('2d');

        // App State
        this.algorithms = new Map(); // id -> parsed yaml object
        this.currentAlgorithm = null;
        this.array = [];
        this.originalArray = [];
        this.isPlaying = false;
        this.playTimeoutId = null;

        // Parameters
        this.arraySize = parseInt(document.getElementById('slider-size').value);
        this.initialOrder = document.getElementById('select-order').value;
        this.speedDelay = parseInt(document.getElementById('slider-speed').value);

        // VM instance
        this.vm = new VirtualMachine();

        // Animation State
        this.sortedAnimationProgress = -1; // -1 means no animation
        this.sortedAnimationActive = false;

        // Initialize Core Operations
        this.initDOM();
        this.initCanvasResize();
        this.loadAlgorithms();
    }

    /**
     * Bind DOM elements and event listeners
     */
    initDOM() {
        // Inputs & Controls
        this.sizeSlider = document.getElementById('slider-size');
        this.sizeValue = document.getElementById('val-size');
        this.orderSelect = document.getElementById('select-order');
        this.speedSlider = document.getElementById('slider-speed');
        this.speedValue = document.getElementById('val-speed');

        this.algoSelect = document.getElementById('select-algo');

        // Buttons
        this.btnPlay = document.getElementById('btn-play');
        this.btnStep = document.getElementById('btn-step');
        this.btnFinish = document.getElementById('btn-finish');
        this.btnGenerate = document.getElementById('btn-generate');
        this.btnGenerateShortcut = document.getElementById('btn-generate-shortcut');
        this.btnClearBreakpoints = document.getElementById('btn-clear-breakpoints');

        // Metrics
        this.countCompares = document.getElementById('count-compares');
        this.countSwaps = document.getElementById('count-swaps');
        this.variablesDisplay = document.getElementById('variables-display');

        // Overlays & Descriptions
        this.overlay = document.getElementById('canvas-overlay');
        this.overlayTitle = document.getElementById('overlay-title');
        this.overlayDesc = document.getElementById('overlay-desc');

        this.algoTitle = document.getElementById('algo-title');
        this.algoBest = document.getElementById('val-best');
        this.algoAvg = document.getElementById('val-avg');
        this.algoWorst = document.getElementById('val-worst');
        this.algoDesc = document.getElementById('algo-desc');
        this.algoPerformance = document.getElementById('algo-performance');
        this.codeDisplay = document.getElementById('code-display');

        // Event Listeners
        this.sizeSlider.addEventListener('input', (e) => {
            this.arraySize = parseInt(e.target.value);
            this.sizeValue.innerText = this.arraySize;
            this.generateNewData();
        });

        this.orderSelect.addEventListener('change', (e) => {
            this.initialOrder = e.target.value;
            this.generateNewData();
        });

        this.speedSlider.addEventListener('input', (e) => {
            this.speedDelay = parseInt(e.target.value);
            if (this.speedDelay === 0) {
                this.speedValue.innerText = "Turbo (0 ms)";
            } else {
                this.speedValue.innerText = `${this.speedDelay} ms`;
            }
        });

        this.algoSelect.addEventListener('change', (e) => {
            this.selectAlgorithm(e.target.value);
        });

        this.btnGenerate.addEventListener('click', () => {
            this.generateNewData();
        });

        this.btnGenerateShortcut.addEventListener('click', () => {
            this.generateNewData();
        });

        this.btnPlay.addEventListener('click', () => {
            this.togglePlay();
        });

        this.btnStep.addEventListener('click', () => {
            this.stepVM();
        });

        this.btnFinish.addEventListener('click', () => {
            this.finishVM();
        });

        this.btnClearBreakpoints.addEventListener('click', () => {
            this.vm.clearBreakpoints();
            this.renderCodePanel();
        });

        // Collapsible Accordion Setup
        const accordion = document.getElementById('controls-accordion');
        const toggle = document.getElementById('accordion-toggle');
        const arrow = toggle.querySelector('.accordion-arrow');

        toggle.addEventListener('click', () => {
            accordion.classList.toggle('collapsed');
            if (accordion.classList.contains('collapsed')) {
                arrow.innerText = '▼';
            } else {
                arrow.innerText = '▲';
            }
            // Trigger canvas resize after the CSS toggle completes (350ms transition)
            setTimeout(() => {
                if (this.handleResize) this.handleResize();
            }, 360);
        });
    }

    /**
     * Handle responsive canvas resizing with High-DPI support
     */
    initCanvasResize() {
        this.handleResize = () => {
            const rect = this.canvas.parentElement.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            // Logical CSS dimensions
            this.width = rect.width;
            this.height = rect.height;

            this.canvas.style.width = `${rect.width}px`;
            this.canvas.style.height = `${rect.height}px`;

            // Physical pixels backing resolution
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;

            // Scale context to match logical dimensions
            this.ctx.scale(dpr, dpr);
            this.draw();
        };
        window.addEventListener('resize', this.handleResize);
        // Execute initially once sizing is resolved
        setTimeout(this.handleResize, 100);
    }

    /**
     * Load sorting algorithms from YAML registry, falling back to local defaults if blocked by CORS
     */
    async loadAlgorithms() {
        try {
            // Try fetching algorithms.json first
            const res = await fetch('algorithms/algorithms.json');
            if (!res.ok) throw new Error('Could not fetch algorithm index');
            const fileList = await res.json();

            for (const file of fileList) {
                const fileRes = await fetch(`algorithms/${file}`);
                if (!fileRes.ok) continue;
                const yamlText = await fileRes.text();
                const parsed = jsyaml.load(yamlText);
                this.algorithms.set(parsed.id, parsed);
            }
        } catch (e) {
            console.warn("Could not fetch algorithms dynamically (likely local file:/// scheme CORS block). Loading fallback algorithms.", e);
            this.loadFallbackAlgorithms();
        }

        this.populateAlgoSelect();
    }

    /**
     * Hardcoded fallback algorithms for running the app directly via file:// scheme
     */
    loadFallbackAlgorithms() {
        const shellSortFallback = {
            id: "shell_sort",
            name: "Shell Sort",
            complexity: {
                best: "O(n log n)",
                average: "O(n^(7/6))",
                worst: "O(n^2)"
            },
            runtime_behavior: {
                sorted: "Best case: O(n log n). The elements are already in order, so the inner insertion loops terminate immediately, resulting in minimal shifts.",
                random: "Average case: O(n^(7/6)) to O(n^(5/4)) depending on the gap sequence used.",
                reversed: "Worst case: O(n^2). Every insertion step has to shift elements across the full length of the gap, causing maximum work."
            },
            description: "An extension of insertion sort that allows the exchange of far-apart elements. It compares elements separated by a gap that decreases over time, significantly reducing the total amount of shifting required.",
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
                    yield { line: 1, vars: { n } };
                    for (let gap = Math.floor(n/2); gap > 0; gap = Math.floor(gap/2)) {
                        yield { line: 2, vars: { n, gap } };
                        for (let i = gap; i < n; i += 1) {
                            yield { line: 3, vars: { n, gap, i } };
                            let temp = arr[i];
                            yield { line: 4, vars: { n, gap, i, temp } };
                            let j;
                            yield { line: 5, vars: { n, gap, i, temp, j } };
                            for (j = i; j >= gap; j -= gap) {
                                yield { line: 6, compare: [j - gap, i], vars: { n, gap, i, temp, j } };
                                if (arr[j - gap] > temp) {
                                    arr[j] = arr[j - gap];
                                    yield { line: 7, assign: [j, arr[j - gap]], vars: { n, gap, i, temp, j } };
                                } else {
                                    break;
                                }
                            }
                            arr[j] = temp;
                            yield { line: 9, assign: [j, temp], vars: { n, gap, i, temp, j } };
                        }
                    }
                    yield { line: 12, vars: { n } };
                    return arr;
                }
            `
        };


        const insertionSortFallback = {
            id: "insertion_sort",
            name: "Insertion Sort",
            complexity: { best: "O(n)", average: "O(n^2)", worst: "O(n^2)" },
            runtime_behavior: {
                sorted: "Best case: O(n). The inner loop terminates instantly for every item since no shifting is needed.",
                random: "Average case: O(n^2). Shifting elements takes quadratic time on average.",
                reversed: "Worst case: O(n^2). Maximum comparisons and shifts required as every element travels to index 0."
            },
            description: "Builds the final sorted array one item at a time by comparing each new element against the sorted section and inserting it into its correct position.",
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
                return arr;
            }`
        };

        const bubbleSortFallback = {
            id: "bubble_sort",
            name: "Bubble Sort",
            complexity: { best: "O(n)", average: "O(n^2)", worst: "O(n^2)" },
            runtime_behavior: {
                sorted: "Best case: O(n). An optimized implementation breaks early if a full pass completes without a single swap.",
                random: "Average case: O(n^2). Repeatedly stepping through the list, comparing adjacent elements, and swapping them.",
                reversed: "Worst case: O(n^2). The array elements are in reverse order, forcing a swap at every single comparison."
            },
            description: "Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. Large values 'bubble' to the top on each pass.",
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
                return arr;
            }`
        };

        const selectionSortFallback = {
            id: "selection_sort",
            name: "Selection Sort",
            complexity: { best: "O(n^2)", average: "O(n^2)", worst: "O(n^2)" },
            runtime_behavior: {
                sorted: "Best case: O(n^2). Even if the array is sorted, it must scan the remaining unsorted elements completely to find the minimum.",
                random: "Average case: O(n^2). Consistently scans the remainder of the array to pull out the absolute smallest item element.",
                reversed: "Worst case: O(n^2). Performs identical comparisons as the other states, though it executes maximum swap actions."
            },
            description: "Divides the input array into a sorted and an unsorted region. It repeatedly isolates the minimum element from the unsorted region and swaps it to the front.",
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
                return arr;
            }`
        };

        const quickSortFallback = {
            id: "quick_sort",
            name: "Quick Sort (Lomuto)",
            complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n^2)" },
            runtime_behavior: {
                sorted: "Worst case: O(n^2) for standard Lomuto partitioning if the pivot picks the minimum or maximum element consistently.",
                random: "Average case: O(n log n). Highly efficient algorithm separating elements cleanly into recursive balances.",
                reversed: "Worst case: O(n^2). Extreme imbalance occurs when the pivot element fails to bisect the data cleanly."
            },
            description: "A divide-and-conquer algorithm. It picks an element as a pivot and partitions the given array around the picked pivot, sorting sub-arrays recursively.",
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
            }`
        };

        this.algorithms.set(shellSortFallback.id, shellSortFallback);
        this.algorithms.set(insertionSortFallback.id, insertionSortFallback);
        this.algorithms.set(bubbleSortFallback.id, bubbleSortFallback);
        this.algorithms.set(selectionSortFallback.id, selectionSortFallback);
        this.algorithms.set(quickSortFallback.id, quickSortFallback);
    };

    /**
     * Populate the algorithm selection dropdown
     */
    populateAlgoSelect() {
        this.algoSelect.innerHTML = '';
        if (this.algorithms.size === 0) {
            this.algoSelect.innerHTML = '<option disabled>No algorithms available</option>';
            return;
        }

        this.algorithms.forEach((algo, id) => {
            const opt = document.createElement('option');
            opt.value = id;
            opt.innerText = algo.name;
            this.algoSelect.appendChild(opt);
        });

        // Auto select first loaded algorithm
        const firstId = this.algorithms.keys().next().value;
        this.algoSelect.value = firstId;
        this.selectAlgorithm(firstId);
    }

    /**
     * Switch to a different algorithm
     * @param {string} id 
     */
    selectAlgorithm(id) {
        this.stopPlay();
        this.currentAlgorithm = this.algorithms.get(id);

        // Update descriptions & badges
        this.algoTitle.innerText = this.currentAlgorithm.name;
        this.algoBest.innerText = this.currentAlgorithm.complexity.best;
        this.algoAvg.innerText = this.currentAlgorithm.complexity.average;
        this.algoWorst.innerText = this.currentAlgorithm.complexity.worst;
        this.algoDesc.innerText = this.currentAlgorithm.description;

        let perfText = '';
        if (this.currentAlgorithm.runtime_behavior) {
            perfText += `• ${this.currentAlgorithm.runtime_behavior.sorted}\n`;
            perfText += `• ${this.currentAlgorithm.runtime_behavior.random}\n`;
            perfText += `• ${this.currentAlgorithm.runtime_behavior.reversed}`;
        } else {
            perfText = 'No specific performance data available.';
        }
        this.algoPerformance.innerText = perfText;

        // Render code panel
        this.renderCodePanel();

        // Generate new data
        this.generateNewData();
    }

    /**
     * Render the algorithm's code line-by-line
     */
    renderCodePanel() {
        this.codeDisplay.innerHTML = '';
        if (!this.currentAlgorithm) return;

        this.currentAlgorithm.display_code.forEach((line, idx) => {
            const row = document.createElement('div');
            row.className = 'code-line';
            row.id = `code-line-${idx}`;
            if (this.vm.breakpoints.has(idx)) {
                row.classList.add('breakpoint');
            }

            const numCol = document.createElement('div');
            numCol.className = 'line-number-col';
            numCol.innerText = idx + 1;

            // Breakpoint toggle click
            numCol.addEventListener('click', (e) => {
                e.stopPropagation();
                const hasBp = this.vm.toggleBreakpoint(idx);
                if (hasBp) {
                    row.classList.add('breakpoint');
                } else {
                    row.classList.remove('breakpoint');
                }
            });

            const codeCol = document.createElement('div');
            codeCol.className = 'line-code-col';
            codeCol.innerText = line;

            row.appendChild(numCol);
            row.appendChild(codeCol);
            this.codeDisplay.appendChild(row);
        });
    }

    /**
     * Generate new data array based on user preferences
     */
    generateNewData() {
        this.stopPlay();
        this.sortedAnimationProgress = -1;
        this.sortedAnimationActive = false;

        const size = this.arraySize;
        const tempArray = [];

        // Create values from 1 to size
        for (let i = 1; i <= size; i++) {
            tempArray.push(i);
        }

        if (this.initialOrder === 'random') {
            // Fisher-Yates Shuffle
            for (let i = tempArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const temp = tempArray[i];
                tempArray[i] = tempArray[j];
                tempArray[j] = temp;
            }
        } else if (this.initialOrder === 'reversed') {
            tempArray.reverse();
        }

        this.array = tempArray;
        this.originalArray = [...this.array];

        // Re-initialize VM
        const generatorFunc = new Function(`return (${this.currentAlgorithm.generator_code})`)();
        this.vm.init(this.array, generatorFunc);

        // Reset metrics UI
        this.countCompares.innerText = '0';
        this.countSwaps.innerText = '0';
        this.variablesDisplay.innerHTML = `
            <div style="grid-column: 1 / -1; color: var(--text-muted); font-size: 12px; text-align: center;">
                Click Play or Step to inspect variables
            </div>
        `;

        // Show start overlay
        this.overlayTitle.innerText = "Sorts of Sorts Visualizer";
        this.overlayDesc.innerText = `Created ${size} items in ${this.initialOrder} order. Press Play/Step to begin!`;
        this.overlay.classList.remove('hidden');

        this.highlightActiveLine(-1);
        this.draw();
    }

    /**
     * Start/Resume execution play loop
     */
    togglePlay() {
        if (this.isPlaying) {
            this.stopPlay();
        } else {
            this.isPlaying = true;
            this.btnPlay.innerText = 'Pause';
            this.btnPlay.classList.remove('primary');
            this.btnPlay.classList.add('secondary');
            this.overlay.classList.add('hidden');
            this.playLoop();
        }
    }

    stopPlay() {
        this.isPlaying = false;
        this.btnPlay.innerText = 'Play';
        this.btnPlay.classList.remove('secondary');
        this.btnPlay.classList.add('primary');
        if (this.playTimeoutId) {
            clearTimeout(this.playTimeoutId);
            this.playTimeoutId = null;
        }
    }

    /**
     * Execution loop that delays between actions
     */
    playLoop() {
        if (!this.isPlaying) return;

        const delay = this.speedDelay;
        let stepsToRun = 1;
        let scheduleDelay = delay;

        if (delay < 50) {
            // Execute multiple steps per frame to increase speed
            scheduleDelay = 16; // Match ~60fps requestAnimationFrame rate
            if (delay === 0) {
                stepsToRun = 30; // Max speed (30 steps per frame)
            } else {
                stepsToRun = Math.max(1, Math.floor(50 / delay));
            }
        }

        let state;
        for (let i = 0; i < stepsToRun; i++) {
            state = this.stepVM(false); // Step without drawing/DOM updates for speed

            if (state.done) {
                this.stopPlay();
                // Final draw and counters update
                this.draw();
                this.countCompares.innerText = this.vm.compares;
                this.countSwaps.innerText = this.vm.swaps;
                this.updateVariablesDisplay({});
                this.triggerSortedAnimation();
                return;
            }

            // Pause if we hit a breakpoint
            if (this.vm.breakpoints.has(state.line)) {
                this.stopPlay();
                this.draw();
                this.countCompares.innerText = this.vm.compares;
                this.countSwaps.innerText = this.vm.swaps;
                this.highlightActiveLine(state.line);
                this.updateVariablesDisplay(state.vars);

                this.overlayTitle.innerText = "Paused at Breakpoint";
                this.overlayDesc.innerText = `Execution hit breakpoint on line ${state.line + 1}.`;
                this.overlay.classList.remove('hidden');
                return;
            }
        }

        // Draw and update DOM elements once per animation frame
        this.draw();
        this.countCompares.innerText = this.vm.compares;
        this.countSwaps.innerText = this.vm.swaps;
        this.highlightActiveLine(state.line);
        this.updateVariablesDisplay(state.vars);

        this.playTimeoutId = setTimeout(() => {
            this.playLoop();
        }, scheduleDelay);
    }

    /**
     * Perform a single step of the virtual machine and sync UI
     * @param {boolean} shouldDraw - If false, skips redrawing and DOM updates (used for fast playback batching)
     */
    stepVM(shouldDraw = true) {
        if (this.vm.isDone) {
            return { done: true };
        }

        if (shouldDraw) {
            this.overlay.classList.add('hidden');
        }

        const state = this.vm.step();

        if (state.done) {
            this.array = [...this.vm.array];
            if (shouldDraw) {
                this.highlightActiveLine(-1);
                this.updateVariablesDisplay({});
                this.triggerSortedAnimation();
            }
            return state;
        }

        // Sync local array from VM internal array
        this.array = [...this.vm.array];

        if (shouldDraw) {
            this.countCompares.innerText = state.compares;
            this.countSwaps.innerText = state.swaps;
            this.highlightActiveLine(state.line);
            this.updateVariablesDisplay(state.vars);
            this.draw();
        }

        return state;
    }

    /**
     * Instantly execute the sorting algorithm until completion or breakpoint is hit
     */
    finishVM() {
        this.stopPlay();
        this.overlay.classList.add('hidden');

        if (this.vm.isDone) return;

        let state = { done: false };
        while (!state.done) {
            state = this.vm.step();
            if (state.done) {
                break;
            }

            // Check breakpoints
            if (this.vm.breakpoints.has(state.line)) {
                this.array = [...this.vm.array];
                this.countCompares.innerText = this.vm.compares;
                this.countSwaps.innerText = this.vm.swaps;
                this.highlightActiveLine(state.line);
                this.updateVariablesDisplay(state.vars);
                this.draw();

                this.overlayTitle.innerText = "Paused at Breakpoint";
                this.overlayDesc.innerText = `Finish execution hit breakpoint on line ${state.line + 1}.`;
                this.overlay.classList.remove('hidden');
                return;
            }
        }

        // Completed successfully
        this.array = [...this.vm.array];
        this.countCompares.innerText = this.vm.compares;
        this.countSwaps.innerText = this.vm.swaps;
        this.highlightActiveLine(-1);
        this.updateVariablesDisplay({});
        this.draw();
        this.triggerSortedAnimation();
    }

    /**
     * Highlights the active execution line in the source code panel
     */
    highlightActiveLine(lineIdx) {
        const activeLines = document.querySelectorAll('.code-line.active');
        activeLines.forEach(l => l.classList.remove('active'));

        if (lineIdx >= 0) {
            const targetLine = document.getElementById(`code-line-${lineIdx}`);
            if (targetLine) {
                targetLine.classList.add('active');
                targetLine.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }

    /**
     * Update the variables inspector list
     */
    updateVariablesDisplay(vars) {
        this.variablesDisplay.innerHTML = '';
        const keys = Object.keys(vars);

        if (keys.length === 0) {
            this.variablesDisplay.innerHTML = `
                <div style="grid-column: 1 / -1; color: var(--text-muted); font-size: 12px; text-align: center;">
                    No variables active in current scope
                </div>
            `;
            return;
        }

        keys.forEach(k => {
            const item = document.createElement('div');
            item.className = 'variable-item';

            const nameEl = document.createElement('div');
            nameEl.className = 'variable-name';
            nameEl.innerText = k;

            const valEl = document.createElement('div');
            valEl.className = 'variable-value';
            valEl.innerText = vars[k] !== undefined && vars[k] !== null ? vars[k] : 'undefined';

            item.appendChild(nameEl);
            item.appendChild(valEl);
            this.variablesDisplay.appendChild(item);
        });
    }

    /**
     * Run green animation sweep upon successful sort
     */
    triggerSortedAnimation() {
        this.sortedAnimationActive = true;
        this.sortedAnimationProgress = 0;

        const animate = () => {
            if (this.sortedAnimationProgress < this.array.length) {
                this.sortedAnimationProgress += 1.5; // step size
                this.draw();
                requestAnimationFrame(animate);
            } else {
                this.sortedAnimationActive = false;
                // Final completion overlay
                this.overlayTitle.innerText = "Sorting Complete!";
                this.overlayDesc.innerText = `Sorted ${this.array.length} items in ${this.vm.compares} compares and ${this.vm.swaps} swaps.`;
                this.overlay.classList.remove('hidden');
            }
        };

        animate();
    }

    /**
     * Drawing Engine: Renders balls, lines, and optional indices at bottom
     */
    draw() {
        const width = this.width || this.canvas.width;
        const height = this.height || this.canvas.height;
        const N = this.array.length;

        // Clear canvas
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, width, height);

        if (N === 0) return;

        // Draw nice background guide lines (e.g. horizontal divisions)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        this.ctx.lineWidth = 1;
        for (let i = 1; i <= 4; i++) {
            const yLine = (height * i) / 5;
            this.ctx.beginPath();
            this.ctx.moveTo(0, yLine);
            this.ctx.lineTo(width, yLine);
            this.ctx.stroke();
        }

        // Layout constants
        const colWidth = width / N;
        const showArrayBoxes = colWidth >= 12; // hide boxes entirely if column is too narrow
        const showArrayNumbers = colWidth >= 28; // only draw numbers if box has enough space

        const arrayAreaHeight = showArrayBoxes ? 45 : 0;
        const topMargin = 30;
        const bottomMargin = 15;
        const ballWorkspaceHeight = height - arrayAreaHeight - topMargin - bottomMargin;
        const useShadows = N <= 100 && this.speedDelay >= 50;

        // Determine drawing state colors
        const compIndices = this.vm.activeCompare;
        const assignIndices = this.vm.activeAssign;

        // RENDER CONFLICT LINES FIRST (So they lay behind balls)
        for (let i = 0; i < N; i++) {
            const val = this.array[i];
            const x = i * colWidth + colWidth / 2;

            // Scaled y position: values are 1-indexed up to N
            const scaleFactor = (N > 1) ? (val - 1) / (N - 1) : 0.5;
            const y = topMargin + ballWorkspaceHeight - (scaleFactor * ballWorkspaceHeight);

            // Check state
            let isComparing = compIndices.includes(i);
            let isAssigning = assignIndices.includes(i);

            // ONLY draw the bar from the bottom if it is actively comparing or swapping/assigning
            if (isComparing || isAssigning) {
                // Select line style
                if (isComparing) {
                    this.ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)'; // Amber line
                    this.ctx.lineWidth = 2;
                } else if (isAssigning) {
                    this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)'; // Red line
                    this.ctx.lineWidth = 2.5;
                }

                const ballRadius = Math.max(3, Math.min(colWidth * 0.35, 20));
                const yLineStart = y + ballRadius;
                const yLineEnd = height - arrayAreaHeight;

                this.ctx.beginPath();
                this.ctx.setLineDash([4, 4]); // Keeps your active element dashed style
                this.ctx.moveTo(x, yLineStart);
                this.ctx.lineTo(x, yLineEnd);
                this.ctx.stroke();
                this.ctx.setLineDash([]); // Reset dash style
            }
        }

        // RENDER ARRAY BOXES
        if (showArrayBoxes) {
            const yBoxStart = height - arrayAreaHeight;

            for (let i = 0; i < N; i++) {
                const val = this.array[i];
                const xStart = i * colWidth;

                // Color array grid cell based on active state
                let isComparing = compIndices.includes(i);
                let isAssigning = assignIndices.includes(i);
                let isSorted = this.vm.isDone && (!this.sortedAnimationActive || i <= this.sortedAnimationProgress);

                if (isComparing) {
                    this.ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
                    this.ctx.strokeStyle = '#f59e0b';
                } else if (isAssigning) {
                    this.ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
                    this.ctx.strokeStyle = '#ef4444';
                } else if (isSorted) {
                    this.ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
                    this.ctx.strokeStyle = '#10b981';
                } else {
                    this.ctx.fillStyle = 'rgba(20, 20, 30, 0.4)';
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
                }

                // Draw cell box
                this.ctx.lineWidth = 1;
                this.ctx.fillRect(xStart + 1, yBoxStart + 1, colWidth - 2, arrayAreaHeight - 12);
                this.ctx.strokeRect(xStart + 1, yBoxStart + 1, colWidth - 2, arrayAreaHeight - 12);

                // Draw Text (Values and Indices)
                if (showArrayNumbers) {
                    this.ctx.fillStyle = (isComparing || isAssigning || isSorted) ? '#fff' : 'rgba(255, 255, 255, 0.7)';
                    this.ctx.font = 'bold 11px sans-serif';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(val.toString(), xStart + colWidth / 2, yBoxStart + (arrayAreaHeight - 12) / 2);

                    // Draw Index value at the very bottom edge of screen
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    this.ctx.font = '9px monospace';
                    this.ctx.fillText(`i:${i}`, xStart + colWidth / 2, height - 5);
                }
            }
        }

        // RENDER BALLS ON TOP
        for (let i = 0; i < N; i++) {
            const val = this.array[i];
            const x = i * colWidth + colWidth / 2;
            const scaleFactor = (N > 1) ? (val - 1) / (N - 1) : 0.5;
            const y = topMargin + ballWorkspaceHeight - (scaleFactor * ballWorkspaceHeight);

            const ballRadius = Math.max(3, Math.min(colWidth * 0.35, 20));

            let isComparing = compIndices.includes(i);
            let isAssigning = assignIndices.includes(i);
            let isSorted = this.vm.isDone && (!this.sortedAnimationActive || i <= this.sortedAnimationProgress);

            // Sphere gradient configuration
            const grad = this.ctx.createRadialGradient(
                x - ballRadius / 3,
                y - ballRadius / 3,
                ballRadius / 10,
                x,
                y,
                ballRadius
            );

            if (isComparing) {
                // Amber Sphere
                grad.addColorStop(0, '#fef3c7'); // extremely light amber
                grad.addColorStop(0.2, '#fbbf24'); // amber-400
                grad.addColorStop(1, '#b45309'); // amber-700
                if (useShadows) {
                    this.ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
                    this.ctx.shadowBlur = 12;
                }
            } else if (isAssigning) {
                // Red Sphere
                grad.addColorStop(0, '#fee2e2'); // extremely light red
                grad.addColorStop(0.2, '#f87171'); // red-400
                grad.addColorStop(1, '#991b1b'); // red-800
                if (useShadows) {
                    this.ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
                    this.ctx.shadowBlur = 12;
                }
            } else if (isSorted) {
                // Green Sphere
                grad.addColorStop(0, '#d1fae5'); // light green
                grad.addColorStop(0.2, '#34d399'); // emerald-400
                grad.addColorStop(1, '#065f46'); // emerald-800
                if (useShadows) {
                    this.ctx.shadowColor = 'rgba(16, 185, 129, 0.3)';
                    this.ctx.shadowBlur = 6;
                }
            } else {
                // Indigo/Violet Sphere
                grad.addColorStop(0, '#e0e7ff'); // light indigo
                grad.addColorStop(0.2, '#818cf8'); // indigo-400
                grad.addColorStop(1, '#3730a3'); // indigo-800
                this.ctx.shadowBlur = 0; // standard balls have no glow shadow for performance
            }

            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            this.ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0; // Reset

            // Subtle specular reflection white dot
            if (ballRadius > 6) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                this.ctx.beginPath();
                this.ctx.arc(x - ballRadius / 3, y - ballRadius / 3, ballRadius / 6, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
}

// Instantiate visualizer app when DOM loaded
window.addEventListener('DOMContentLoaded', () => {
    window.App = new VisualizerApp();
});
