// app.js - Main Application Coordinator

import { VirtualMachine } from './virtual_machine.js';
import { fallbackAlgorithms } from './fallbacks.js';
import * as dom from './dom_helpers.js';
import { drawWorkspace } from './canvas_renderer.js';

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
        
        // Benchmarking & Run History State
        this.historyLog = [];

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
        this.btnClearBreakpoints = document.getElementById('btn-clear-breakpoints');
        
        // History Sidebar Elements
        this.btnToggleHistory = document.getElementById('btn-toggle-history');
        this.btnClearHistory = document.getElementById('btn-clear-history');
        this.btnCloseHistory = document.getElementById('btn-close-history');
        this.historySidebar = document.getElementById('history-sidebar');
        this.historyTableBody = document.getElementById('history-table-body');

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

        this.btnPlay.addEventListener('click', () => {
            this.togglePlay();
        });

        this.btnStep.addEventListener('click', () => {
            this.stepVM();
        });

        this.btnFinish.addEventListener('click', () => {
            this.finishVM();
        });

        if (this.btnGenerate) {
            this.btnGenerate.addEventListener('click', () => {
                this.generateNewData();
            });
        }

        if (this.btnClearBreakpoints) {
            this.btnClearBreakpoints.addEventListener('click', () => {
                this.vm.clearBreakpoints();
                this.renderCodePanel();
            });
        }

        if (this.btnToggleHistory) {
            this.btnToggleHistory.addEventListener('click', () => {
                this.historySidebar.classList.toggle('open');
                setTimeout(() => {
                    if (this.handleResize) this.handleResize();
                }, 300);
            });
        }

        if (this.btnClearHistory) {
            this.btnClearHistory.addEventListener('click', () => {
                this.historyLog = [];
                dom.updateHistoryTable(this.historyTableBody, this.historyLog);
            });
        }

        if (this.btnCloseHistory) {
            this.btnCloseHistory.addEventListener('click', () => {
                this.historySidebar.classList.remove('open');
                setTimeout(() => {
                    if (this.handleResize) this.handleResize();
                }, 300);
            });
        }

        const accordion = document.getElementById('controls-accordion');
        const toggle = document.getElementById('accordion-toggle');
        const arrow = toggle.querySelector('.accordion-arrow');

        toggle.addEventListener('click', () => {
            accordion.classList.toggle('collapsed');
            arrow.innerText = accordion.classList.contains('collapsed') ? '▼' : '▲';
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

            this.width = rect.width;
            this.height = rect.height;

            this.canvas.style.width = `${rect.width}px`;
            this.canvas.style.height = `${rect.height}px`;

            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;

            this.ctx.scale(dpr, dpr);
            this.draw();
        };
        window.addEventListener('resize', this.handleResize);
        setTimeout(this.handleResize, 100);
    }

    /**
     * Load sorting algorithms from Registry, falling back to local defaults module
     */
    async loadAlgorithms() {
        try {
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
            console.warn("Could not fetch algorithms dynamically (CORS block). Loading fallbacks module.", e);
            this.algorithms = fallbackAlgorithms;
        }

        this.populateAlgoSelect();
    }

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

        const firstId = this.algorithms.keys().next().value;
        this.algoSelect.value = firstId;
        this.selectAlgorithm(firstId);
    }

    selectAlgorithm(id) {
        this.stopPlay();
        
        // Clear active breakpoints when switching algorithms to prevent line mismatch issues
        this.vm.clearBreakpoints();

        this.currentAlgorithm = this.algorithms.get(id);

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

        this.renderCodePanel();
        this.generateNewData();
    }

    renderCodePanel() {
        dom.updateCodePanel(this.codeDisplay, this.currentAlgorithm, this.vm, (idx) => {
            return this.vm.toggleBreakpoint(idx);
        });
    }

    generateNewData() {
        this.stopPlay();
        this.sortedAnimationProgress = -1;
        this.sortedAnimationActive = false;

        const size = this.arraySize;
        const tempArray = Array.from({ length: size }, (_, i) => i + 1);

        if (this.initialOrder === 'random') {
            for (let i = tempArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [tempArray[i], tempArray[j]] = [tempArray[j], tempArray[i]];
            }
        } else if (this.initialOrder === 'reversed') {
            tempArray.reverse();
        }

        this.array = tempArray;
        this.originalArray = [...this.array];

        const generatorFunc = new Function(`return (${this.currentAlgorithm.generator_code})`)();
        this.vm.init(this.array, generatorFunc);

        this.countCompares.innerText = '0';
        this.countSwaps.innerText = '0';
        
        this.variablesDisplay.innerHTML = `
            <div style="grid-column: 1 / -1; color: var(--text-muted); font-size: 12px; text-align: center;">
                Click Play or Step to inspect variables
            </div>
        `;

        this.overlayTitle.innerText = "Sorts of Sorts Visualizer";
        this.overlayDesc.innerText = `Created ${size} items in ${this.initialOrder} order. Press Play/Step to begin!`;
        this.overlay.classList.remove('hidden');

        dom.updateCodePanel(this.codeDisplay, this.currentAlgorithm, this.vm, (idx) => this.vm.toggleBreakpoint(idx));
        this.draw();
    }

    togglePlay() {
        if (this.isPlaying) {
            this.stopPlay();
        } else {
            if (this.vm.isDone) {
                this.generateNewData();
            }
            this.isPlaying = true;
            this.btnPlay.innerText = 'Pause';
            this.btnPlay.classList.replace('primary', 'secondary');
            this.overlay.classList.add('hidden');
            this.playLoop();
        }
    }

    stopPlay() {
        this.isPlaying = false;
        this.btnPlay.innerText = 'Play';
        this.btnPlay.classList.replace('secondary', 'primary');
        if (this.playTimeoutId) {
            clearTimeout(this.playTimeoutId);
            this.playTimeoutId = null;
        }
    }

    playLoop() {
        if (!this.isPlaying) return;

        const delay = this.speedDelay;
        let stepsToRun = 1;
        let scheduleDelay = delay;

        if (delay < 50) {
            scheduleDelay = 16;
            stepsToRun = (delay === 0) ? 30 : Math.max(1, Math.floor(50 / delay));
        }

        let state;
        for (let i = 0; i < stepsToRun; i++) {
            state = this.stepVM(false);

            if (state.done) {
                this.stopPlay();
                this.draw();
                this.countCompares.innerText = this.vm.compares;
                this.countSwaps.innerText = this.vm.swaps;
                dom.updateVariablesDisplay(this.variablesDisplay, {});
                this.logRunToHistory();
                this.triggerSortedAnimation();
                return;
            }

            if (this.vm.breakpoints.has(state.line)) {
                this.stopPlay();
                this.draw();
                this.countCompares.innerText = this.vm.compares;
                this.countSwaps.innerText = this.vm.swaps;
                this.highlightActiveLine(state.line);
                dom.updateVariablesDisplay(this.variablesDisplay, state.vars);

                this.overlayTitle.innerText = "Paused at Breakpoint";
                this.overlayDesc.innerText = `Execution hit breakpoint on line ${state.line + 1}.`;
                this.overlay.classList.remove('hidden');
                return;
            }
        }

        this.draw();
        this.countCompares.innerText = this.vm.compares;
        this.countSwaps.innerText = this.vm.swaps;
        this.highlightActiveLine(state.line);
        dom.updateVariablesDisplay(this.variablesDisplay, state.vars);

        this.playTimeoutId = setTimeout(() => this.playLoop(), scheduleDelay);
    }

    stepVM(shouldDraw = true) {
        if (this.vm.isDone) {
            this.generateNewData();
            return { done: false };
        }

        if (shouldDraw) this.overlay.classList.add('hidden');

        const state = this.vm.step();

        if (state.done) {
            this.array = [...this.vm.array];
            if (shouldDraw) {
                this.highlightActiveLine(-1);
                dom.updateVariablesDisplay(this.variablesDisplay, {});
                this.logRunToHistory();
                this.triggerSortedAnimation();
            }
            return state;
        }

        this.array = [...this.vm.array];

        if (shouldDraw) {
            this.countCompares.innerText = state.compares;
            this.countSwaps.innerText = state.swaps;
            this.highlightActiveLine(state.line);
            dom.updateVariablesDisplay(this.variablesDisplay, state.vars);
            this.draw();
        }

        return state;
    }

    finishVM() {
        this.overlay.classList.add('hidden');
        if (this.vm.isDone) this.generateNewData();
        this.stopPlay();

        let state = { done: false };
        while (!state.done) {
            state = this.vm.step();
            if (state.done) break;

            if (this.vm.breakpoints.has(state.line)) {
                this.array = [...this.vm.array];
                this.countCompares.innerText = this.vm.compares;
                this.countSwaps.innerText = this.vm.swaps;
                this.highlightActiveLine(state.line);
                dom.updateVariablesDisplay(this.variablesDisplay, state.vars);
                this.draw();

                this.overlayTitle.innerText = "Paused at Breakpoint";
                this.overlayDesc.innerText = `Finish execution hit breakpoint on line ${state.line + 1}.`;
                this.overlay.classList.remove('hidden');
                return;
            }
        }

        this.array = [...this.vm.array];
        this.countCompares.innerText = this.vm.compares;
        this.countSwaps.innerText = this.vm.swaps;
        this.highlightActiveLine(-1);
        dom.updateVariablesDisplay(this.variablesDisplay, {});
        this.draw();
        this.logRunToHistory();
        this.triggerSortedAnimation();
    }

    logRunToHistory() {
        this.historyLog.push({
            algo: this.currentAlgorithm.name,
            size: this.arraySize,
            order: this.initialOrder,
            compares: this.vm.compares,
            swaps: this.vm.swaps
        });
        dom.updateHistoryTable(this.historyTableBody, this.historyLog);
    }

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

    triggerSortedAnimation() {
        this.sortedAnimationActive = true;
        this.sortedAnimationProgress = 0;

        const animate = () => {
            if (this.sortedAnimationProgress < this.array.length) {
                this.sortedAnimationProgress += 1.5;
                this.draw();
                requestAnimationFrame(animate);
            } else {
                this.sortedAnimationActive = false;
                this.overlayTitle.innerText = "Sorting Complete!";
                this.overlayDesc.innerText = `Sorted ${this.array.length} items in ${this.vm.compares} compares and ${this.vm.swaps} swaps.`;
                this.overlay.classList.remove('hidden');
            }
        };
        animate();
    }

    draw() {
        drawWorkspace(this);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.App = new VisualizerApp();
});