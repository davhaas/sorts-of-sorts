#!/usr/bin/env python
import os

# Configuration
OUTPUT_FILE = "project_snapshot.txt"
INCLUDE_EXTENSIONS = {
    ".py",
    ".js",
    ".json",
    ".yaml",
    ".html",
    ".css",
    ".md",
}
# Explicitly skip legacy binary clutter and the script's own text output
EXCLUDE_DIRS = {"legacy", ".git", "__pycache__"}
# ONLY exclude the output text file itself to prevent the inception loop
EXCLUDE_FILES = {OUTPUT_FILE}

def generate_snapshot():
    with open(OUTPUT_FILE, "w", encoding="utf-8") as outfile:
        outfile.write("# Project Snapshot\n")
        outfile.write(
            "This file contains the structural text source code for the sorting visualizer project.\n\n"
        )

        for root, dirs, files in os.walk("."):
            # Modify dirs in-place to skip excluded directories
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

            for file in sorted(files):
                if file in EXCLUDE_FILES:
                    continue

                ext = os.path.splitext(file)[1].lower()
                if ext in INCLUDE_EXTENSIONS:
                    relative_path = os.path.relpath(
                        os.path.join(root, file), "."
                    )
                    print(f"Packing: {relative_path}")

                    outfile.write(f"## File: {relative_path}\n")
                    # Specify codeblock language for easier markdown reading
                    lang = ext.lstrip(".")
                    if lang == "md":
                        lang = "markdown"

                    outfile.write(f"```{lang}\n")
                    try:
                        with open(
                            os.path.join(root, file), "r", encoding="utf-8"
                        ) as infile:
                            outfile.write(infile.read())
                    except Exception as e:
                        outfile.write(f"[Error reading file: {e}]\n")
                    outfile.write("\n```\n\n---\n\n")

    print(f"\nSuccess! Snapshot saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    generate_snapshot()
