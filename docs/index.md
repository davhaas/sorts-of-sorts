# Sorts of Sorts - Documentation Master Directory

Welcome to the documentation for **Sorts of Sorts**, an interactive sorting algorithm visualizer.

## Table of Contents

1. [Problem Statement](problem_statement.md) - Context and educational goals of the visualizer.
2. [Implementation Plan](implementation_plan.md) - The architectural and design blueprint for this project.
3. [How It Works](how_it_works.md) - Architectural deep-dive into execution loops and visual state machines.
4. [Changelog](changelog.md) - Record of project milestones and features implemented.

For instructions on running the project, please refer to the main [README.md](../README.md).

---

## Workspace Structure

The project layout is structured as follows:

*   `/algorithms/` - Contains the algorithm plugin definitions.
    *   [algorithms.json](file:///g:/GitHub/sorts-of-sorts/algorithms/algorithms.json) - **Algorithm Registry**. This index file tells the web application which algorithms to download on startup.
    *   [shell_sort.yaml](file:///g:/GitHub/sorts-of-sorts/algorithms/shell_sort.yaml) - **Shell Sort Definition**. The description, complexity, visual code representation, and VM execution generator for Shell Sort.
*   `/docs/` - Contains project documentation.
    *   [index.md](file:///g:/GitHub/sorts-of-sorts/docs/index.md) - Master documentation directory (this file).
    *   [problem_statement.md](file:///g:/GitHub/sorts-of-sorts/docs/problem_statement.md) - Educational context and requirements.
    *   [how_it_works.md](file:///g:/GitHub/sorts-of-sorts/docs/how_it_works.md) - Deep-dive into internal application machinery.
    *   [changelog.md](file:///g:/GitHub/sorts-of-sorts/docs/changelog.md) - Project history.
*   `/legacy/` - Stores the 24-year-old legacy project files, website extraction screenshots, and `.mp4` video showing the visualizer working.
*   `/src/` - Core application source code.
    *   [app.js](file:///g:/GitHub/sorts-of-sorts/src/app.js) - **Main Controller**. Initializes layout, canvas sizing, binds control sliders, and coordinates the drawing engine.
    *   [index.css](file:///g:/GitHub/sorts-of-sorts/src/index.css) - **Design System stylesheet**. Contains styling guidelines, colors, fonts, and animation properties.
    *   [virtual_machine.js](file:///g:/GitHub/sorts-of-sorts/src/virtual_machine.js) - **Virtual Execution Machine**. Steps through algorithms, updates scopes, tracks metrics, and manages breakpoints.
*   [index.html](file:///g:/GitHub/sorts-of-sorts/index.html) - The web entry point containing the split pane grid container.
*   [start.py](file:///g:/GitHub/sorts-of-sorts/start.py) - **Launcher Script**. A Python script that boots a local server on port 8000 and opens the browser. Used in Windows/Git Bash environments.

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
        // Compare index j and original index i (visualized by key value)
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
Reloading the page in a web server environment will now automatically fetch, parse, and list the new algorithm in the dropdown.

### Step 3: Register as fallback in `app.js` (Optional but Recommended)
To support running the app out-of-the-box locally via `file:///` scheme (which blocks HTTP fetches of local YAML files due to CORS), add the parsed object directly into the `loadFallbackAlgorithms()` function inside [src/app.js](file:///g:/GitHub/sorts-of-sorts/src/app.js):

```javascript
loadFallbackAlgorithms() {
    // ... shellSortFallback ...
    
    const insertionSortFallback = {
        id: "insertion_sort",
        name: "Insertion Sort",
        // ... (copy YAML field values here)
    };
    
    this.algorithms.set(insertionSortFallback.id, insertionSortFallback);
}
```

