// virtual_machine.js - Virtual State Generator and Execution Controller

export class VirtualMachine {
    constructor() {
        this.array = [];
        this.generator = null;
        this.currentState = null;
        
        // Metrics
        this.compares = 0;
        this.swaps = 0;
        
        // Breakpoints (Set of 0-indexed line numbers)
        this.breakpoints = new Set();
        
        // VM State
        this.isDone = false;
        this.activeLine = -1;
        this.vars = {};
        this.activeCompare = []; // indices currently compared
        this.activeAssign = [];  // indices currently assigned/swapped
    }

    /**
     * Initialize the VM with a sorting generator and a copy of the data
     * @param {Array<number>} array - The array of numbers to sort
     * @param {Function} generatorFunc - The generator function of the algorithm
     */
    init(array, generatorFunc) {
        this.array = [...array];
        this.generator = generatorFunc(this.array);
        this.currentState = null;
        this.compares = 0;
        this.swaps = 0;
        this.isDone = false;
        this.activeLine = -1;
        this.vars = {};
        this.activeCompare = [];
        this.activeAssign = [];
    }

    /**
     * Toggle a breakpoint on a specific line of code
     * @param {number} lineIndex 
     */
    toggleBreakpoint(lineIndex) {
        if (this.breakpoints.has(lineIndex)) {
            this.breakpoints.delete(lineIndex);
            return false;
        } else {
            this.breakpoints.add(lineIndex);
            return true;
        }
    }

    /**
     * Clear all breakpoints
     */
    clearBreakpoints() {
        this.breakpoints.clear();
    }

    /**
     * Executes a single step of the algorithm
     * @returns {Object} State after the step
     */
    step() {
        if (this.isDone || !this.generator) {
            return { done: true };
        }

        const res = this.generator.next();
        if (res.done) {
            this.isDone = true;
            this.activeLine = -1;
            this.activeCompare = [];
            this.activeAssign = [];
            return { done: true, array: this.array };
        }

        const state = res.value;
        this.currentState = state;
        
        // Update line highlight
        this.activeLine = state.line;
        
        // Update variables
        this.vars = state.vars || {};

        // Reset active visual indices
        this.activeCompare = [];
        this.activeAssign = [];

        // Parse operations for metrics and visualization
        if (state.compare) {
            this.activeCompare = state.compare;
            this.compares++;
        }
        
        if (state.assign) {
            this.activeAssign = [state.assign[0]];
            this.swaps++; // Incremented for array modification (assign/swap)
        }

        if (state.swap) {
            this.activeAssign = state.swap;
            this.swaps++;
        }

        return {
            done: false,
            line: this.activeLine,
            array: [...this.array],
            compares: this.compares,
            swaps: this.swaps,
            vars: this.vars,
            activeCompare: this.activeCompare,
            activeAssign: this.activeAssign
        };
    }
}
