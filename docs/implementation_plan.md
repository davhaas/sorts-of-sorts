# Implementation Plan - Sorts of Sorts Visualizer (Phase 2: Speed Optimizations & Layout Enhancements)

We are addressing performance bottlenecks, rendering alignment issues, and UI spacing requirements to scale the visualizer up to 250 elements.

## Proposed Changes

### 1. Canvas Alignment (Fixing "Half Off the Screen" Issue)
To resolve clipping and stretching on different resolutions and high-DPI screens (e.g. 125% or 150% OS scaling), we will:
*   Implement standard **High-DPI backing store scaling** using `window.devicePixelRatio`.
*   Separate the logical CSS size of the canvas from its physical pixel resolution.
*   Draw elements using logical CSS dimensions while setting the backing buffer size to match physical display pixels, then scaling the context by the Device Pixel Ratio (`dpr`).
*   Ensure absolute positioning on the canvas inside `#canvas-container` with no default border/padding offsets.

---

### 2. Speed & Rendering Optimizations (Turbo Execution)
JavaScript is highly capable of running sorting algorithms instantly. The current slowdown is caused by redrawing the canvas and updating DOM elements on *every single comparison/swap step* via sequential `setTimeout` ticks (clamped to a minimum of ~4ms by browser specifications). To make it run at extremely high speeds:
*   **Batch Steps Per Frame**: If the speed slider delay is set to small values (e.g., `< 50ms`), we will execute multiple steps of the generator synchronous-loop in a single frame before redrawing the canvas (e.g., if delay is 5ms, execute 20 steps per frame).
*   **Performance-Aware Drawing**: Disable `shadowBlur` and `shadowColor` glow effects when $N > 100$ or when running in high-speed modes, as shadow rendering in HTML5 Canvas uses extremely slow software rasterization filters.
*   **Scale Size Limit**: Change the array size slider range to support up to **250 elements**.

---

### 3. Controls Spacing and Layout (Collapsible Accordion)
To maximize vertical space for the code tracing panel, we will:
*   Wrap all configurations (Select Algorithm, Array Parameters, Speed Slider) inside a **collapsible accordion container**.
*   Move the **Play** and **Step** buttons outside the accordion, positioning them directly above the Code Display panel.
*   Add a new **Finish** button next to the Step button.
*   **Hide the Variables Watch card visually** via CSS `display: none;` (keeping the JavaScript logic active so it updates variables in the background for potential future reinstatement).
*   Use CSS Flexbox layouts so that collapsing the accordion allows the Code Display viewport to expand and take up all remaining vertical height, preventing code scrolling.

---

### 4. "Finish" Button Logic
*   Add a **Finish** button (`#btn-finish`) next to Step.
*   When clicked, it will run a synchronous `while (!vm.isDone)` loop to execute the remaining generator steps instantly without drawing or intermediate DOM updates.
*   It checks for breakpoints during this run: if a breakpoint is hit, it pauses execution at that line and updates the UI.
*   If it runs to completion, it updates the operation counters, draws the final sorted state, and triggers the green sweep success animation.

---

## File Modifications

#### [MODIFY] [index.html](file:///g:/GitHub/sorts-of-sorts/index.html)
*   Increase `#slider-size` maximum to 250.
*   Wrap Select Algorithm, Array Parameters, and Speed Slider in accordion tags.
*   Position Play, Step, and new Finish buttons outside the accordion.
*   Visually hide variables display container.

#### [MODIFY] [index.css](file:///g:/GitHub/sorts-of-sorts/src/index.css)
*   Add styles for the collapsible accordion (transitions, arrows, active status).
*   Hide variables display card (`display: none;`).
*   Optimize canvas container positioning.
*   Style the new **Finish** button.

#### [MODIFY] [app.js](file:///g:/GitHub/sorts-of-sorts/src/app.js)
*   Incorporate High-DPI canvas scaling logic using `window.devicePixelRatio`.
*   Update the `playLoop()` execution controller to batch multiple VM steps per frame when the delay is small.
*   Implement `finishVM()` to execute sorting instantly, handling breakpoints.
*   Add event listeners to toggle the accordion class and collapse/expand heights.

---

## Verification Plan

### Manual Verification
1. Open `index.html` via Python server (`python start.py`).
2. Test the **Accordion**: click the header to collapse it. Confirm the Code Display panel expands vertically.
3. Test **Speed at 250 elements**:
   - Slide size to 250.
   - Adjust speed slider to minimum (e.g. 5ms).
   - Click Play and confirm the sort runs extremely quickly and smoothly (batching steps without frame lag).
4. Test **Finish Button**:
   - Generate new data.
   - Click **Finish**. Confirm the visualizer skips to the sorted state, displays correct operations metrics (compares and swaps), and plays the green completion animation.
   - Toggle a breakpoint in the code, generate data, click **Finish**, and verify it pauses exactly on the breakpoint line.
