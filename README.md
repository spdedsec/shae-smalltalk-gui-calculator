# SHAE Smalltalk GUI Calculator

<div align="center">

```
   ____  _   _    _    _____     ____    _    _     ____ 
  / ___|| | | |  / \  | ____|   / ___|  / \  | |   / ___|
  \___ \| |_| | / _ \ |  _|    | |     / _ \ | |  | |    
   ___) |  _  |/ ___ \| |___   | |___ / ___ \| |__| |___ 
  |____/|_| |_/_/   \_\_____|   \____/_/   \_\_____\____|
                                                         
      Smalltalk-80 Pure Object-Oriented GUI Architecture
```

> **A high-precision, pedagogical Smalltalk-80 GUI calculator implementing the Xerox PARC Model-View-Controller (MVC) and Morphic paradigms, accompanied by an interactive zero-dependency web runtime and SUnit test suite.**

[![Dialect](https://img.shields.io/badge/Dialect-Smalltalk--80%20%2F%20Cuis%20%2F%20Pharo-blue.svg)](#)
[![Architecture](https://img.shields.io/badge/Architecture-MVC%20%26%20Morphic-orange.svg)](#)
[![Tests](https://img.shields.io/badge/Tests-SUnit%20100%25%20Passing-brightgreen.svg)](#)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-cyan.svg)](https://spdedsec.github.io/shae-smalltalk-gui-calculator/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

</div>

---

## 🌐 Live Interactive Web Runtime

Experience the Smalltalk GUI Calculator immediately in your browser with zero installation:
👉 **[Launch Live Smalltalk Calculator](https://spdedsec.github.io/shae-smalltalk-gui-calculator/)**

Includes:
- **Interactive Morphic Canvas**: Swiss Brutalist × 1-Bit Ditherpunk Xerox Alto aesthetic.
- **Live Smalltalk-80 Workspace & Transcript**: Execute messages dynamically against the calculator engine in real time (`calc evaluate: '3 + 4 * 2'`, `calc memoryStore: 50`).
- **Audit Paper Tape**: Synchronous chronological record of all operations with instant recall.
- **Synthesized Mechanical Audio**: Haptic tactile click synthesis powered by the Web Audio API.

---

## Table of Contents

1. [Architectural Overview & Philosophy](#1-architectural-overview--philosophy)
2. [Component Architecture (MVC & Morphic)](#2-component-architecture-mvc--morphic)
3. [Smalltalk-80 Core Engine (`ShaeCalculatorEngine.st`)](#3-smalltalk-80-core-engine)
4. [Feature Matrix](#4-feature-matrix)
5. [SUnit Automated Test Suite](#5-sunit-automated-test-suite)
6. [Interactive Terminal REPL](#6-interactive-terminal-repl)
7. [Repository File Map](#7-repository-file-map)
8. [Building & Deployment](#8-building--deployment)
9. [License](#9-license)

---

## 1. Architectural Overview & Philosophy

Smalltalk is not merely a programming language; it is the historical foundation of modern object-oriented computing, graphical user interfaces, windowing environments, and test-driven development. Created by Alan Kay, Dan Ingalls, Adele Goldberg, and the Learning Research Group at Xerox PARC in the 1970s, Smalltalk introduced the axiom: **Everything is an Object, and computation proceeds entirely by sending messages.**

The **SHAE Smalltalk GUI Calculator** is engineered to celebrate this heritage at the highest standard:
- **Pure Message-Passing Semantics**: Arithmetic operations (`+`, `-`, `*`, `/`, `raisedTo:`) are dispatched via polymorphic Smalltalk message sends rather than static operators.
- **Strict MVC Separation**:
  - **Model (`ShaeCalculatorEngine`)**: Pure state machine, expression tokenizer, Shunting-Yard evaluator, memory registers, and audit tape. Free from UI dependencies.
  - **View (`ShaeCalculatorView`)**: Morphic-based visual hierarchy, brutalist high-contrast LCD annunciators, button grids, and paper tape.
  - **Controller (`ShaeCalculatorController`)**: Central input multiplexer binding keyboard events and user actions to model commands.
- **Fail-Safe Robustness**: Division by zero, negative square roots, and domain math errors are caught and surfaced via graceful annunciators without halting the environment.
- **Xerox Alto meets Swiss Brutalism**: Strict `0px` border-radius, hairline 1px grids, high-contrast monospace typography, and dither textures.

---

## 2. Component Architecture (MVC & Morphic)

```
+-------------------------------------------------------------------------+
|                              USER INPUT                                 |
|               (Physical Keyboard / NumPad / Mouse Clicks)               |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                       ShaeCalculatorController                          |
|             • Keycode to selector dispatch table ($0-$9, $+)            |
|             • Command execution & Undo/Redo stack management            |
+------------------------------------+------------------------------------+
                                     | sends messages
                                     v
+-------------------------------------------------------------------------+
|                         ShaeCalculatorEngine                            |
|             • Accumulator, Pending Operator, Last Operand               |
|             • Memory Registers (MC, MR, M+, M-, MS)                     |
|             • Shunting-Yard Infix Expression Evaluator                  |
|             • Base Conversion (DEC, HEX, BIN, OCT)                      |
|             • Scientific Functions (Trig, Logs, Powers, Roots)          |
|             • Chronological Audit History Tape                          |
+------------------------------------+------------------------------------+
                                     | state notifications
                                     v
+-------------------------------------------------------------------------+
|                          ShaeCalculatorView                             |
|             • Primary LCD Readout & Sub-Expression Display              |
|             • Status Annunciator Flags (BASE, DEG/RAD, MEM)             |
|             • Interactive Keypad Matrix                                 |
|             • Scrolling Paper Tape Drawer                               |
|             • Smalltalk-80 Live Transcript & Workspace                  |
+-------------------------------------------------------------------------+
```

---

## 3. Smalltalk-80 Core Engine

The engine is distributed in standard Smalltalk chunk format (`.st`), completely compatible with GNU Smalltalk, Cuis, Squeak, and Pharo:

```smalltalk
"Example: Evaluating arithmetic and inspecting memory in pure Smalltalk"
| calc |
calc := ShaeCalculatorEngine new.
calc inputDigit: 5.
calc add.
calc inputDigit: 7.
calc equals.
Transcript show: 'Result: ' , calc display; cr. "Result: 12"

"Expression evaluation via Shunting-Yard algorithm"
calc evaluate: '3 + 4 * 2'.
Transcript show: 'Expression Result: ' , calc display; cr. "Expression Result: 11"

"Store into memory"
calc memoryStore.
calc clear.
calc memoryRecall.
Transcript show: 'Recalled: ' , calc display; cr. "Recalled: 11"
```

---

## 4. Feature Matrix

| Domain | Capabilities |
| :--- | :--- |
| **Arithmetic** | Addition (`+`), Subtraction (`-`), Multiplication (`×`), Division (`÷`), Modulo (`%`), Power (`x^y`), Percentage (`%`) |
| **Scientific** | Square Root (`√`), Square (`x²`), Cube (`x³`), Reciprocal (`1/x`), Factorial (`n!`), Sine (`sin`), Cosine (`cos`), Tangent (`tan`), Natural Log (`ln`), Base-10 Log (`log`), Euler's constant (`e`), Pi (`π`) |
| **Programmer** | Decimal (`DEC`), Hexadecimal (`HEX`), Binary (`BIN`), Octal (`OCT`), Bitwise AND, OR, XOR, NOT, Bit-shifts (`<<`, `>>`) |
| **Memory** | Memory Clear (`MC`), Memory Recall (`MR`), Memory Add (`M+`), Memory Subtract (`M-`), Memory Store (`MS`) |
| **Audit Tape** | Real-time chronological paper tape with timestamps, expression tracking, and single-click recall into calculator |
| **State Handling** | Chained operations, repeat equals execution, 50-step Undo / Redo history stack, soft-clear (`CE`), hard-clear (`C`) |

---

## 5. SUnit Automated Test Suite

The engine is verified with 30 unit tests validating mathematical correctness, operator precedence, base conversion, and error handling.

To execute the test suite:
```bash
npm test
# or
make test
```

### Test Suite Output:
```
===========================================================
SHAE Smalltalk SUnit Test Suite
TestCase subclass: #ShaeCalculatorTest
===========================================================

  ✓ testInitialState
  ✓ testDigitEntry
  ✓ testDecimalEntry
  ✓ testLeadingZeroes
  ✓ testSignToggle
  ✓ testBackspace
  ✓ testAddition
  ✓ testSubtraction
  ✓ testMultiplication
  ✓ testDivision
  ✓ testDivisionByZero
  ✓ testOperatorChaining
  ✓ testRepeatEquals
  ✓ testModulo
  ✓ testPower
  ✓ testSquareRoot
  ✓ testNegativeSquareRootError
  ✓ testSquareAndCube
  ✓ testReciprocal
  ✓ testFactorial
  ✓ testPercentage
  ✓ testTrigonometryDegrees
  ✓ testLogarithms
  ✓ testMemoryOperations
  ✓ testHistoryTape
  ✓ testUndoRedo
  ✓ testExpressionEvaluation
  ✓ testBaseConversionHex
  ✓ testBaseConversionBinary
  ✓ testBitwiseOperations

===========================================================
Results: 30 passed, 0 failed (30 total tests)
===========================================================
All Smalltalk SUnit test assertions passed 100%!
```

---

## 6. Interactive Terminal REPL

Launch the standalone Smalltalk CLI interactive workspace:
```bash
make repl
# or
node scripts/repl.js
```

### REPL Usage Example:
```
Smalltalk> 3 + 4 * 2
=> 11
Smalltalk> (100 - 20) / 4
=> 20
Smalltalk> calc mem 42
Memory stored: 42
Smalltalk> calc mr
Recalled memory: [ 42 ]
Smalltalk> calc tape
--- History Audit Tape ---
  #2 [16:21:05] (100 - 20) / 4 = 20
  #1 [16:21:00] 3 + 4 * 2 = 11
--------------------------
```

---

## 7. Repository File Map

```
shae-smalltalk-gui-calculator/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Automated SUnit tests on PR / push
│       └── deploy.yml             # Automatic deployment to GitHub Pages
├── src/
│   ├── ShaeCalculatorEngine.st    # Pure Smalltalk-80 Model (arithmetic, AST, tape)
│   ├── ShaeCalculatorView.st      # Pure Smalltalk-80 View (Morphic window and grid)
│   ├── ShaeCalculatorController.st# Pure Smalltalk-80 Controller (event routing)
│   └── ShaeCalculatorPackage.st   # Unified single-file file-in bundle
├── tests/
│   ├── ShaeCalculatorTest.st      # Standard SUnit test suite source
│   └── test_runner.js             # Automated headless test runner
├── web/
│   ├── index.html                 # Xerox Alto / Smalltalk-80 Swiss Brutalist Web GUI
│   ├── style.css                  # Hairline 1px brutalist stylesheet
│   ├── favicon.svg                # 1-bit pixel art icon
│   └── js/
│       ├── smalltalk_engine.js    # Embedded Smalltalk engine & expression evaluator
│       ├── sound_fx.js            # Tactile click synthesizer (Web Audio API)
│       └── app.js                 # UI controller & Smalltalk workspace orchestrator
├── scripts/
│   ├── build.sh                   # Packaging and verification script
│   └── repl.js                    # Interactive Smalltalk CLI REPL
├── Makefile                       # Developer tasks (test, build, repl, web)
├── package.json                   # Zero-dependency manifest
├── LICENSE                        # MIT License
└── README.md                      # Comprehensive architectural documentation
```

---

## 8. Building & Deployment

### Local Development Server
To preview the web calculator locally:
```bash
make web
# Opens web application at http://localhost:8080
```

### Generate Release Archives
```bash
make build
```
Creates tarballs, zip bundles, and SHA256 checksums in `dist/`.

---

## 9. License

MIT © 2026 [spdedsec](https://github.com/spdedsec) `<legendsatya7272@gmail.com>`.  
Developed under the **SHAE** language & systems architecture project.
