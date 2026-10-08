#!/usr/bin/env bash
# ========================================================================
# SHAE Smalltalk GUI Calculator — Build & Packaging Automation
# Copyright (c) 2026 spdedsec <legendsatya7272@gmail.com>
# License: MIT
# ========================================================================

set -euo pipefail

VERSION="0.1.0"
DIST_DIR="dist"
ARCHIVE_PREFIX="shae-smalltalk-gui-calculator-v${VERSION}"

echo "===================================================================="
echo "  SHAE Smalltalk GUI Calculator — Build & Release Packaging"
echo "  Version: v${VERSION}"
echo "===================================================================="

# 1. Run unit test suite
echo "==> Running Smalltalk SUnit headless test suite..."
node tests/test_runner.js

# 2. Prepare distribution directory
echo "==> Preparing artifact output directory (${DIST_DIR})..."
rm -rf "${DIST_DIR}"
mkdir -p "${DIST_DIR}/${ARCHIVE_PREFIX}"

# 3. Copy source and web assets into bundle
cp -r src "${DIST_DIR}/${ARCHIVE_PREFIX}/"
cp -r tests "${DIST_DIR}/${ARCHIVE_PREFIX}/"
cp -r web "${DIST_DIR}/${ARCHIVE_PREFIX}/"
cp -r scripts "${DIST_DIR}/${ARCHIVE_PREFIX}/"
cp Makefile package.json README.md LICENSE "${DIST_DIR}/${ARCHIVE_PREFIX}/"

# 4. Generate archives
echo "==> Generating compressed release archives..."
cd "${DIST_DIR}"
tar -czf "${ARCHIVE_PREFIX}.tar.gz" "${ARCHIVE_PREFIX}"
zip -rq "${ARCHIVE_PREFIX}.zip" "${ARCHIVE_PREFIX}"
cd ..

# 5. Checksum generation
echo "==> Generating SHA256 checksums..."
cd "${DIST_DIR}"
sha256sum "${ARCHIVE_PREFIX}.tar.gz" > "${ARCHIVE_PREFIX}.tar.gz.sha256"
sha256sum "${ARCHIVE_PREFIX}.zip" > "${ARCHIVE_PREFIX}.zip.sha256"
cd ..

echo "==> Build complete! Output artifacts in ${DIST_DIR}:"
ls -lh "${DIST_DIR}"/*.tar.gz "${DIST_DIR}"/*.zip
