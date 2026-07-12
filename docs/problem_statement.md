# Problem Statement: Sorts of Sorts Visualizer

## Educational Context
Sorting algorithms are a fundamental concept in computer science. For many students, understanding how algorithms like Shell Sort, Quick Sort, or Merge Sort operate is difficult because they are abstract and mathematical. Static code listings or mathematical complexity formulas (like $O(n \log n)$) do not easily translate into intuition about how elements move and how comparisons and swaps are performed.

## The Goal
The **Sorts of Sorts** visualizer is a learning asset designed to bridge this gap. By showing a visual, animated, step-by-step representation of sorting algorithms running, students can visually trace:
1. **Comparisons**: Which elements are currently being examined (highlighted in distinct colors).
2. **Swaps and Movements**: How elements shift, exchange positions, or are inserted.
3. **Execution State**: Exactly which line of the algorithm is currently executing (highlighted code panel) and how the counts of operations (comparisons and swaps) increment.
4. **Data Configurations**: How different algorithm complexities behave when run on different types of data input (Sorted, Random, Reversed).

## Key Features
- **Configurable Input**: Students can control the speed, number of items, value ranges, and initial ordering of elements.
- **Code Execution Control**: Play, pause, step forward, and breakpoint capabilities allow students to trace the code at their own pace.
- **Dynamic Configuration**: A modular architecture reads algorithms dynamically from configuration files (e.g. YAML), allowing new algorithms to be added simply by dropping a new file in the folder.
