# Sorts of Sorts: Interactive Sorting Algorithm Visualizer

A modern JavaScript SPA visualizer for classic sorting algorithms, reconstructed from a legacy Visual Basic project. It helps students understand how algorithms operate by stepping through code lines and observing operations (compares and swaps) on elements (rendered as visual balls and array indices).

## Documentation
- Master Index: [docs/index.md](docs/index.md)
- Project Changelog: [changelog.md](changelog.md)
- Problem Statement: [docs/problem_statement.md](docs/problem_statement.md)
- Architecture Blueprint & How It Works: [docs/how_it_works.md](docs/how_it_works.md)
- Architecture Plan: [docs/implementation_plan.md](docs/implementation_plan.md)

## Getting Started
This project was developed on a Windows PC with Git for Windows (Git Bash) and Python 3 installed.

### Option 1: Run with Python Server (Recommended for full YAML loading features)
Running a local server avoids browser security blocks (`CORS`) on local file accesses, allowing dynamic algorithm loading.
1. Open Git Bash in the repository root.
2. Run:
   ```bash
   python start.py
   ```
3. This starts an HTTP server at `http://localhost:8000` and automatically opens it in your default browser.

### Option 2: Open File Directly
1. Double-click `index.html` or open it directly in a web browser.
2. Note: Dynamic algorithm fetching from folders will be disabled by the browser due to local file security restrictions, but the app will automatically fall back to loading the pre-bundled Shell Sort algorithm.

---

## Copyright & License
**Copyright © 2026 Dav Haas. All Rights Reserved.**

This software and associated documentation files are proprietary. No part of this project may be copied, modified, distributed, or used without explicit written permission from the copyright owner.
