# Changelog - Sorts of Sorts Visualizer

All notable changes to this project will be documented in this file.

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
