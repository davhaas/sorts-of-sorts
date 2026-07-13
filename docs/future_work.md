# Future Updates & Edge Case Mitigations

This document tracks potential bugs, architectural edge cases, and robustness updates for the application. These items focus on handling state changes during execution and ensuring visual/rendering stability.

---

## 1. Execution State & UI Synchronization
* **Issue:** Modifying application state (changing algorithms, adjusting parameters, or altering inputs) while the execution is **Paused** can leave the internal generator out of sync. The generator (`this.activeGenerator`) retains the old state, while the UI displays the new configuration.
* **Impact:** Resuming execution after making changes can cause unpredictable behavior, visual glitches, or application crashes.
* **Proposed Update:** 
  * Explicitly nullify or reset the active generator (`this.activeGenerator = null;`) whenever a disruptive UI change occurs.
  * Disable or lock input parameters during an active execution session unless a full "Reset" is triggered.

## 2. Canvas Context Lifecycle Management
* **Issue:** The `initCanvasResize()` function correctly handles Device Pixel Ratio (`dpr`) adjustments, but modifying a canvas's `.width` or `.height` properties automatically clears the rendering context state.
* **Impact:** Custom canvas states—such as `ctx.lineWidth`, `ctx.fillStyle`, `ctx.font`, or transformations—are wiped out upon window resizing, causing rendering styles to break.
* **Proposed Update:**
  * Create a centralized `applyCanvasStyles(ctx)` configuration helper.
  * Invoke this helper at the very end of the resize event handler immediately after updating the dimensions.

## 3. Main-Thread Execution Budgets
* **Issue:** When the execution speed is set below `50ms`, `stepsToRun` scales up to execute multiple virtual machine cycles per frame. If a cycle encounters a heavy loop or dense logic inside `virtual_machine.js`, it will block the browser's main thread.
* **Impact:** The UI will stutter, canvas animations will freeze, and responsive inputs (like clicking the **Pause** button) will suffer from noticeable latency.
* **Proposed Update:**
  * Implement a performance budget check inside the step execution loop using `performance.now()`.
  * Break out of the frame's execution early if total execution time for that frame exceeds a safe threshold (e.g., `8ms`), ensuring the UI remains responsive.

## 4. Code Panel Line Mapping Integrity
* **Issue:** The regex filters out non-executable lines (empty space, isolated brackets, comments) so they do not receive line counters in the UI.
* **Impact:** If `virtual_machine.js` references execution by absolute line number rather than tracking an explicit instruction index map, a misalignment will occur between the highlighted UI row and the actual executing code.
* **Proposed Update:**
  * Verify that the VM maps its active execution pointer to a structural line-number lookup table rather than relying on dense sequential array matching.
