# How It Works: Sorts of Sorts Visualizer Architecture

This document details the underlying execution mechanics, data structures, and state loop of the **Sorts of Sorts** interactive sorting visualizer. The application operates as a client-side Single Page Application (SPA) driven by a custom ES6 Virtual State Generator and a Canvas 2D drawing pipeline.

---

## 1. High-Level Architectural Flow

The application splits responsibilities cleanly between state evaluation and rendering output:

```
[ Algorithmic Engine ]                  [ Coordination layer ]               [ User Interface ]
  Generator Functions                     VirtualMachine (VM)                VisualizerApp (DOM/Canvas)
     (Plugins/YAML)                             (src/vm.js)                         (src/app.js)
           │                                         │                                    │
           │  1. Yields operational states           │                                    │
           ├────────────────────────────────────────>│                                    │
           │     (compare, assign, swap, line)       │                                    │
           │                                         │  2. Translates metrics / updates   │
           │                                         ├───────────────────────────────────>│
           │                                         │     internal local data pointer    │
           │                                         │                                    │
           │                                         │                                    │  3. Clears & redraws
           │                                         │                                    │     canvas geometry
           │                                         │                                    │  4. Highlights line numbers
           │                                         │                                    │     & maps variable scope
           │                                         │                                    │<─────────────────────┘
```

1. **Algorithm Definition (The Blueprint):** Algorithms are declared using JavaScript generator functions (`function*`) loaded dynamically from YAML scripts.
2. **Virtual Machine (The Engine):** Controls execution frame-by-frame by advancing the generator iterator, updating performance statistics, mapping variables, and flagging breakpoints.
3. **Application Coordinator (The Renderer):** Captures user inputs, configures timer delays, and renders active data indices visually as multi-colored spheres and canvas layouts.

---

## 2. The Algorithmic Engine: Generators as Co-routines

Traditional visualizers rely on wrapping sorting loops inside complex `async/await` statements paired with arbitrary timeouts. This application isolates execution timing from algorithm design by leveraging **JavaScript Generator Functions (`function*`)**.

### How Code Interleaving Works
When an algorithm runs, it executes inside a generator environment. Instead of completing instantly, it spits out precise visual states back to the virtual machine at key points using the `yield` keyword:

```javascript
// Example representation of an internal loop step
yield { 
    line: 5,                       // Highlight index in the user's visible code view
    compare: [j, j + 1],          // Array indices to colorize as 'Comparing' (Amber)
    vars: { n, i, j, swapped }     // Local scoped state to map inside the live debugger panel
};
```

This approach creates a clean co-routine architecture: the algorithm yields control, the UI renders the frame, and execution remains suspended until the engine requests the next chunk.

---

## 3. The Execution Machine (`VirtualMachine`)

The `VirtualMachine` handles state progression, metadata calculations, and breakpoint evaluation.

### State Transitions per Step (`.step()`)
Every execution tick prompts a call to `vm.step()`, which evaluates the generator iterator:
* **Metrics Ingestion:** If the state contains a `.compare` array, the global comparisons accumulator (`compares`) increments. If an `.assign` or `.swap` attribute is detected, the modifications counter (`swaps`) increments.
* **Tracking Visual Highlights:** Active operations update tracking states (`activeCompare` or `activeAssign`), which the canvas pipeline reads directly to isolate rendering highlights.
* **Breakpoint Matching:** Prior to passing control back to the UI, the VM cross-references the current line index with its local `breakpoints` integer `Set`. If a match is discovered, execution instantly stops, and the UI triggers an overlay warning.

---

## 4. The Drawing Pipeline & Visual Feedback Loops

Rendering relies on standard HTML5 Canvas 2D methods initialized dynamically based on the device pixel ratio (`window.devicePixelRatio`). This removes blurriness on High-DPI screens.

### Core Rendering Passes within `draw()`
The canvas drawing loop executes top-to-bottom sequentially on every tick:
1. **Clear and Guideline Pass:** Flashes the viewport to deep space black (`#0a0a0f`) and casts thin horizontal division references across the workflow field.
2. **Array Box & Index Sub-system:** Calculates horizontal spacing constraints (`colWidth = width / N`). If space allows, it draws bottom grid cells, rendering exact data values and matching index markers (`i:0`).
3. **Dynamic Interaction Lines (Conflict Indicators):** Iterates across indices to search for active evaluations. If an index matches `activeCompare`, an amber line runs upward to the item. If it matches `activeAssign`, a red line draws. These lines automatically vanish the microsecond the operation terminates.
4. **Specular Sphere Elements:** Renders tracking items as floating spheres. Color gradients shift dynamically to project state information:
   * **Indigo/Violet (`#818cf8`):** Unmodified, standard idle elements.
   * **Amber (`#fbbf24`):** Active comparison index.
   * **Red (`#f87171`):** Active structural modification/assignment.
   * **Emerald Green (`#34d399`):** Fully sorted element.

---

## 5. Execution Loops and Variable Speed Profiles

When a user clicks "Play", the app starts a looping cycle using `setTimeout` intervals dictated by the speed slider (`speedDelay`).

### High-Speed Optimization Engine
When execution speeds are set below `50ms`, passing frames via individual event-loops becomes bottlenecked. The visualizer circumvents this via dynamic batching:

```javascript
if (delay < 50) {
    scheduleDelay = 16; // Fix the physical frame cycle to a smooth 60fps refresh target
    if (delay === 0) {
        stepsToRun = 30; // Turbo Mode: Evaluate 30 abstract code lines sequentially per frame
    } else {
        stepsToRun = Math.max(1, Math.floor(50 / delay));
    }
}
```

This hybrid engine executes multiple background calculation ticks within the VM sequentially before pushing a final graphic update to the canvas. This keeps the application running smoothly at hyper-speed without crashing or locking up the browser.
