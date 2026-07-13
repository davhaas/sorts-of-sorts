# Changelog - Sorts of Sorts Visualizer

All notable changes to this project will be documented in this file.

> **Maintenance Rule**: Always append new entries to the **top** of the list (below this header) so that the most recent changes are seen first. Never delete old entries; they provide the historical context of the project.

## [1.1.1] - 2026-07-12
### Added
- **UI Navigation Enhancements**: Added a dedicated "Close" button directly to the Laboratory Run Log sidebar header, solving a UI overlay overlap issue where the opened history panel completely blocked the main activation button.
- **Dynamic Local Storage Favicon**: Integrated an ultra-lightweight, high-DPI inline SVG favicon into the application header representing randomized, ascending unsorted data points matching the project's custom dark-mode design system color palette.

### Fixed
- **Local Network and Privacy Console Warnings**: Eliminated browser Tracking Prevention warnings caused by loading the JS-YAML script from an external Content Delivery Network by mirroring the script library locally inside the workspace asset directory.
- **Added** a persistent performance benchmarking log system (`historyLog`) that automatically captures execution metrics including element size, initial sorting order, total comparisons, and swap counts upon completion of any sorting algorithm.
- **Added** an expanding lab history sidebar UI drawer layout component, wired up to slide into place and trigger dynamic canvas scale container recalibrations (`handleResize`) after layout recalculation.
- **Added** a structural historical run dataset renderer (`renderHistoryTable`) designed to display recent algorithm statistics dynamically in an easy-to-compare reverse-chronological data table layout.
- **Added** structural code line detection inside `renderCodePanel()` using a regex validation pattern to scan for non-executable lines (e.g., closing braces, standalone opening braces, empty lines, and syntax comments).
- **Added** the `.non-executable` CSS hooks to structural elements to visually flag them differently from active operational code.
- **Heap Sort**: Implemented a complete, completely in-place binary max-heap sorting option.
- **Granular Heapify Tracking**: Integrated recursive visual `heapify` steps to track every child-parent comparison and root swap directly inside the visualization pipeline.

### Fixed
- **Changelog Timeline Adjustment**: Corrected an out-of-order date stamp listed on a previous development entry.
- **Fixed** line numbering layouts by explicitly rendering an empty space column (`&nbsp;`) for non-executable rows, stabilizing code snippet indentation alignments without creating invalid numeric rows.
- **Fixed** event listener click bindings to completely bypass breakpoint registration logic for structural blocks, preventing users from mistakenly placing active breakpoints on empty code wrappers.
- **Fixed** a reset state engine bug in `togglePlay()` and `stepVM()` by intercepting triggers on fully finished sorts, automatically enforcing data re-generation rules so that subsequent playback loops start cleanly without needing manual re-order commands.

## [1.1.0] - 2026-07-12
### Added
- **Merge Sort (In-Place)**: Implemented a recursive Merge Sort variant that operates directly on the array without auxiliary storage.
- **Merge Logic Transparency**: Included the full shifting and comparison logic in the display code, allowing users to visualize how the "merge" actually happens step-by-step.
- **Metrics Tracking**: Enhanced the generator to track every comparison and shift-assignment, providing accurate performance metrics for the algorithm.

## [1.0.1] - 2026-07-12
### Added
- **New Data Shortcut**: Added a secondary "New Data" shortcut button next to "Clear Breakpoints" to quickly regenerate values without expanding settings.

### Fixed
- **Code Trace Line Numbers Clipping**: Added `flex-shrink: 0` to code panel line numbers and set the tracing viewport to scroll horizontally on long lines, resolving alignment overlap bugs.

### Optimized
- **Line Rendering Disabled**: Commented out vertical connecting line rendering under the balls in `draw()` to speed up graphics execution.

## [1.0.0] - 2026-07-12
### Added
- **Interactive Visualizer Core**: Reconstructed the original 24-year-old sorting visualizer as a modern, single-page client-side web application.
- **Dynamic 3D Balls View**: HTML5 Canvas rendering of elements as 3D-shaded balls connected by lines to their respective index cells at the bottom, adjusting ball radius dynamically depending on the input size.
- **Modular Algorithm Architecture**: Added support for configuration-driven sorting algorithms (e.g. YAML definitions specifying complexity, description, pseudo-code, and executable ES6 generators).
- **Virtual Execution Environment**: Step-by-step iterator execution tracking comparisons, swaps, local scope variables watch, and line highlighting.
- **Breakpoints**: Interactive breakpoint toggling (red stop points) by clicking line numbers in the code panel.
- **Documentation**:
  - `problem_statement.md` detailing educational goals and problem context.
  - `index.md` acting as a master directory index.
  - Local `file://` fallback registry mapping to ensure the code executes cleanly out-of-the-box by double-clicking `index.html`.

### Setup History
- Installed Antigravity IDE.
- Defined problem using Gemini.
- Created initial version with Shell Sort via conversation with Antigravity.