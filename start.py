#!/usr/bin/env python3
"""
Sorts of Sorts Launcher Script
=============================
This script starts a lightweight local HTTP server and automatically opens
the visualizer in your default web browser.

Development Environment Context:
- Developed on a Windows PC.
- Requirements: Git for Windows (providing Git Bash) and Python 3.x installed.

How to Run:
From your Git Bash, Command Prompt, or terminal, run:
    python start.py
"""

import http.server
import socketserver
import webbrowser
import threading
import time
import sys

PORT = 8000
DIRECTORY = "."

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def start_server(httpd):
    print(f"Starting server on http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except Exception as e:
        print(f"Server stopped: {e}")

def main():
    # Configure socket reuse to prevent port busy issues on frequent restarts
    socketserver.TCPServer.allow_reuse_address = True
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            # Start server in a background daemon thread
            server_thread = threading.Thread(target=start_server, args=(httpd,), daemon=True)
            server_thread.start()
            
            # Give the server a moment to start
            time.sleep(0.5)
            
            # Open the default web browser pointing to the visualizer
            url = f"http://localhost:{PORT}/index.html"
            print(f"Opening default browser at {url}...")
            webbrowser.open(url)
            
            print("\nServer is running! Press Ctrl+C to stop.")
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\nShutting down server...")
                httpd.shutdown()
                print("Server stopped. Goodbye!")
    except OSError as e:
        print(f"Error starting server: {e}")
        print(f"Port {PORT} might already be in use. Try closing other server processes.")
        sys.exit(1)

if __name__ == "__main__":
    main()
