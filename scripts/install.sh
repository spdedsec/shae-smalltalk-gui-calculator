#!/usr/bin/env bash
# ========================================================================
# SHAE Smalltalk GUI Calculator — Installation Script
# Purpose: Copy project to web directory or open index.html in browser
# Copyright (c) 2026 spdedsec <legendsatya7272@gmail.com>
# License: MIT
# ========================================================================

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="${PROJECT_ROOT}/../web"

echo "🔧 SHAE Smalltalk GUI Calculator Installation Script"
echo "========================================================"

# Option 1: Copy to web directory (if web dir exists)
if [ -d "${WEB_DIR}" ]; then
    echo "✅ Web directory found at ${WEB_DIR}"
    echo "📋 Copying files to web directory..."
    cp -r "${PROJECT_ROOT}/"* "${WEB_DIR}/" 2>/dev/null || echo "⚠️  No files to copy (web directory is source)"
    echo "✅ Installation complete. You can now run 'make web' to serve the application."
else
    echo "❌ Web directory not found at ${WEB_DIR}"
    echo "💡 Options:"
    echo "  1. Run 'make web' to start local development server"
    echo "  2. Deploy to GitHub Pages using 'make build' and release workflow"
    echo "  3. Open index.html directly in browser (if web directory is separate)"
fi

# Option 2: Open in browser if index.html exists
if [ -f "${WEB_DIR}/index.html" ]; then
    echo "🌐 Opening index.html in default browser..."
    xdg-open "${WEB_DIR}/index.html" 2>/dev/null || echo "⚠️  Could not open browser (Linux environment)"
    echo "✅ Installation complete. You can also run 'make web' to serve locally."
fi

echo ""
echo "💡 Next steps:"
echo "  - Run 'make web' to start local development server (http://localhost:8080)"
echo "  - Run 'make test' to execute SUnit test suite"
echo "  - Run 'make build' to create distribution packages"
echo "  - Visit https://github.com/spdedsec/shae-smalltalk-gui-calculator for release details"