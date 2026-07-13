# Sorts of Sorts - Documentation Master Directory

Welcome to the documentation for **Sorts of Sorts**, an interactive sorting algorithm visualizer.

## Table of Contents

1. [Problem Statement](problem_statement.md) - Context and educational goals of the visualizer.
2. [Implementation Plan](implementation_plan.md) - The architectural and design blueprint for this project.
3. [How It Works](how_it_works.md) - Architectural deep-dive into execution loops and visual state machines.
4. [Changelog](../changelog.md) - Record of project milestones and features implemented.

For instructions on running the project, please refer to the main [README.md](../README.md).

---

## Workspace Structure

The project layout is structured as follows:

*   `/algorithms/` - Contains the algorithm plugin definitions.
    *   `algorithms.json` - **Algorithm Registry**. This index file tells the web application which algorithms to download on startup.
    *   `*.yaml` - Individual algorithm definitions containing descriptions, complexity specs, and visual code/generator mappings (e.g., `bubble_sort.yaml`, `shell_sort.yaml`).
*   `/docs/` - Contains project documentation.
    *   `index.md` - Master documentation directory (this file).
    *   `problem_statement.md` - Educational context and requirements.
    *   `implementation_plan.md` - Technical specification and architecture plan.
    *   `how_it_works.md` - Deep-dive into internal application machinery.
    *   `future_work.md` - Roadmap for future enhancements.
*   `/legacy/` - Stores the 24-year-old legacy project files, website extraction screenshots, and validation media.
*   `/src/` - Core application source code.
    *   `app.js` - **Main Controller**. Orchestrates initialization, hooks up UI controls, and manages asynchronous algorithm fetching transitions.
    *   `canvas_renderer.js` - **Graphics Engine**. Handles low-level 2D graphics rendering, color configurations, vector grids, and real-time array visualizations.
    *   `dom_helpers.js` - **UI Utilities**. Manages manual document fragment builders, safe code panel row generation, and analytics view refreshes.
    *   `virtual_machine.js` - **Virtual Execution Machine**. Steps through algorithms, updates variable scopes, tracks metrics, and manages breakpoints.
    *   `fallbacks.js` - **Offline Data Fallbacks**. Bundles hardcoded, static algorithmic profiles to ensure seamless operations if network fetching encounters sandbox or CORS limits.
    *   `index.css` - **Design System stylesheet**. Contains layout layouts, responsive CSS grids, tokens, and visual transitions.
*   `index.html` - The web entry point containing the split-pane viewport layouts.
*   `start.py` - **Launcher Script**. Boots a local HTTP server on port 8000 and automatically opens the application in the system browser.

---

## How to Add a New Algorithm

To add a new sorting algorithm to the visualizer, follow these steps:

### Step 1: Create a YAML configuration file
Create a new `.yaml` file inside the `/algorithms/` directory (e.g. `algorithms/insertion_sort.yaml`). Use the structure below as a template:

```yaml
id: "insertion_sort"
name: "Insertion Sort"
complexity:
  best: "O(n)"
  average: "O(n^2)"
  worst: "O(n^2)"
runtime_behavior:
  sorted: "Best case: O(n). Inner loop terminates instantly on every item."
  random: "Average case: O(n^2). Shifting elements takes quadratic time on average."
  reversed: "Worst case: O(n^2). Maximum comparisons and shifts required."
description: >
  Builds the final sorted array one item at a time by comparing and inserting elements into their correct positions.
display_code:
  - "function insertionSort(arr) {"
  - "  let n = arr.length;"
  - "  for (let i = 1; i < n; i++) {"
  - "    let key = arr[i];"
  - "    let j = i - 1;"
  - "    while (j >= 0 && arr[j] > key) {"
  - "      arr[j + 1] = arr[j];"
  - "      j = j - 1;"
  - "    }"
  - "    arr[j + 1] = key;"
  - "  }"
  - "  return arr;"
  - "}"
generator_code: >
  function* insertionSort(arr) {
    let n = arr.length;
    yield { line: 1, vars: { n } };
    for (let i = 1; i < n; i++) {
      yield { line: 2, vars: { n, i } };
      let key = arr[i];
      yield { line: 3, vars: { n, i, key } };
      let j = i - 1;
      yield { line: 4, vars: { n, i, key, j } };
      while (j >= 0) {
        yield { line: 5, compare: [j, i], vars: { n, i, key, j } };
        if (arr[j] > key) {
          arr[j + 1] = arr[j];
          yield { line: 6, assign: [j + 1, arr[j]], vars: { n, i, key, j } };
          j = j - 1;
          yield { line: 7, vars: { n, i, key, j } };
        } else {
          break;
        }
      }
      arr[j + 1] = key;
      yield { line: 9, assign: [j + 1, key], vars: { n, i, key, j } };
    }
    yield { line: 12, vars: { n } };
    return arr;
  }
```

### Step 2: Register in `algorithms.json`
Add the filename of the new YAML file to the array in `/algorithms/algorithms.json`:
```json
[
  "shell_sort.yaml",
  "insertion_sort.yaml"
]
```
Reloading the app over a local web server will now automatically fetch, parse, and list the new algorithm in the UI dropdown.

### Step 3: Register as fallback in `fallbacks.js` (Optional but Recommended)
To support running the app out-of-the-box locally via `file:///` scheme (which blocks HTTP fetches of local files due to CORS browser restrictions), add the parsed object directly into the fallback collections inside `src/fallbacks.js`.