# ========================================================================
# SHAE Smalltalk GUI Calculator — Makefile
# Copyright (c) 2026 spdedsec <legendsatya7272@gmail.com>
# License: MIT
# ========================================================================

.PHONY: all test repl build clean web lint

all: test build

test:
	@echo "==> Running SUnit Test Suite..."
	@node tests/test_runner.js

repl:
	@echo "==> Launching interactive Smalltalk CLI REPL..."
	@node scripts/repl.js

build:
	@echo "==> Building distribution packages..."
	@bash scripts/build.sh

web:
	@echo "==> Serving live web calculator on http://localhost:8080..."
	@python3 -m http.server 8080 -d web

clean:
	@echo "==> Cleaning build artifacts..."
	@rm -rf dist
