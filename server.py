#!/usr/bin/env python3
"""
Simple HTTP server for running the attendance tracker locally.
This ensures localStorage works properly by serving files over HTTP instead of file://.

Usage:
1. Run this script: python server.py
2. Open http://localhost:8000 in your browser
3. Access the attendance tracker
"""

import http.server
import socketserver
import webbrowser
import os

# Change to the directory containing this script
os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

print(f"Starting HTTP server on port {PORT}...")
print(f"Open your browser and go to: http://localhost:{PORT}")
print("Press Ctrl+C to stop the server")

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        # Auto-open browser
        webbrowser.open(f'http://localhost:{PORT}')
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped.")
