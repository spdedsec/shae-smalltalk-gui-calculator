/**
 * ========================================================================
 * SHAE Smalltalk GUI Calculator — UI Orchestrator & Controller
 * Architecture: Model-View-Controller (MVC) Client Controller
 * Copyright (c) 2026 spdedsec <legendsatya7272@gmail.com>
 * License: MIT
 * ========================================================================
 */

(function () {
    'use strict';

    // Global Smalltalk engine instance accessible from console and workspace
    window.calc = new ShaeCalculatorEngine();

    // DOM Elements
    const mainDisplay = document.getElementById('main-display');
    const subDisplay = document.getElementById('sub-display');
    const annBase = document.getElementById('ann-base');
    const annAngle = document.getElementById('ann-angle');
    const annMem = document.getElementById('ann-mem');
    const tapeContainer = document.getElementById('tape-container');
    const transcriptLog = document.getElementById('transcript-log');
    const wsInput = document.getElementById('ws-input');
    const btnWsEval = document.getElementById('btn-ws-eval');
    const btnClearTape = document.getElementById('btn-clear-tape');
    const btnClearLog = document.getElementById('btn-clear-log');
    const toggleAngle = document.getElementById('toggle-angle');
    const toggleAudio = document.getElementById('toggle-audio');
    const btnWinReset = document.getElementById('btn-win-reset');

    const gridScientific = document.getElementById('grid-scientific');
    const gridProgrammer = document.getElementById('grid-programmer');
    const modeButtons = document.querySelectorAll('.mode-btn');

    // Sync View with Model State
    function renderDisplay() {
        const text = window.calc.display();
        mainDisplay.textContent = text;
        if (window.calc.hasError) {
            mainDisplay.classList.add('error-state');
        } else {
            mainDisplay.classList.remove('error-state');
        }

        // Secondary sub-display shows pending operation if any
        if (window.calc.pendingOperation && !window.calc.hasError) {
            subDisplay.textContent = `${window.calc.formatNumber(window.calc.accumulator)} ${window.calc.pendingOperation}`;
        } else {
            subDisplay.innerHTML = '&nbsp;';
        }

        // Annunciator bar flags
        annBase.textContent = `BASE: ${window.calc.numberBase.toUpperCase()}`;
        annAngle.textContent = window.calc.angleMode.toUpperCase();
        annMem.textContent = window.calc.hasMemoryRegister() ? 'MEM: ON' : 'MEM: OFF';
        if (window.calc.hasMemoryRegister()) {
            annMem.classList.add('active');
        } else {
            annMem.classList.remove('active');
        }

        renderTape();
    }

    // Render Tape Entries
    function renderTape() {
        const history = window.calc.history;
        if (!history || history.length === 0) {
            tapeContainer.innerHTML = '<div class="tape-empty">Audit tape empty. Perform operations to record calculations.</div>';
            return;
        }

        let html = '';
        for (let i = 0; i < history.length; i++) {
            const entry = history[i];
            html += `
                <div class="tape-entry" data-index="${i}">
                    <div class="tape-meta">
                        <span>#${history.length - i}</span>
                        <span>${entry.timestamp}</span>
                    </div>
                    <div class="tape-calc">
                        <span>${entry.expression} =</span>
                        <span class="tape-result">${entry.result}</span>
                    </div>
                </div>
            `;
        }
        tapeContainer.innerHTML = html;

        // Clicking a tape entry recalls its result into the calculator
        tapeContainer.querySelectorAll('.tape-entry').forEach((el) => {
            el.addEventListener('click', () => {
                const idx = parseInt(el.getAttribute('data-index'), 10);
                const item = window.calc.history[idx];
                if (item) {
                    window.calc.displayValue = item.result;
                    window.calc.enteringNewNumber = true;
                    if (window.soundFx) window.soundFx.playClick('action');
                    renderDisplay();
                    appendTranscript(`Tape recall: ${item.result}`);
                }
            });
        });
    }

    // Append output to Smalltalk Transcript
    function appendTranscript(msg) {
        const timestamp = new Date().toLocaleTimeString();
        transcriptLog.textContent += `\n[${timestamp}] ${msg}`;
        transcriptLog.scrollTop = transcriptLog.scrollHeight;
    }

    // Action Router
    function handleAction(action) {
        switch (action) {
            case 'C':
                window.calc.clear();
                if (window.soundFx) window.soundFx.playClick('clear');
                break;
            case 'CE':
                window.calc.clearEntry();
                if (window.soundFx) window.soundFx.playClick('clear');
                break;
            case 'Bk':
                window.calc.backspace();
                if (window.soundFx) window.soundFx.playClick('normal');
                break;
            case '+':
                window.calc.add();
                if (window.soundFx) window.soundFx.playClick('operator');
                break;
            case '-':
                window.calc.subtract();
                if (window.soundFx) window.soundFx.playClick('operator');
                break;
            case '*':
                window.calc.multiply();
                if (window.soundFx) window.soundFx.playClick('operator');
                break;
            case '/':
                window.calc.divide();
                if (window.soundFx) window.soundFx.playClick('operator');
                break;
            case '%':
                window.calc.percentage();
                if (window.soundFx) window.soundFx.playClick('operator');
                break;
            case '^':
                window.calc.power();
                if (window.soundFx) window.soundFx.playClick('operator');
                break;
            case '=':
                window.calc.equals();
                if (window.soundFx) window.soundFx.playClick('equals');
                break;
            case '+/-':
                window.calc.inputSignToggle();
                if (window.soundFx) window.soundFx.playClick('normal');
                break;
            case '.':
                window.calc.inputDecimalPoint();
                if (window.soundFx) window.soundFx.playClick('normal');
                break;
            // Scientific Actions
            case 'sqrt':
                window.calc.squareRoot();
                if (window.soundFx) window.soundFx.playClick('operator');
                break;
            case 'sqr':
                window.calc.square();
                if (window.soundFx) window.soundFx.playClick('operator');
                break;
            case 'cube':
                window.calc.cube();
                if (window.soundFx) window.soundFx.playClick('operator');
                break;
            case '1/x':
                window.calc.reciprocal();
                if (window.soundFx) window.soundFx.playClick('operator');
                break;
            case 'fact':
                window.calc.factorial();
                if (window.soundFx) window.soundFx.playClick('operator');
                break;
            case 'sin':
                window.calc.sin();
                if (window.soundFx) window.soundFx.playClick('operator');
                break;
            case 'cos':
                window.calc.cos();
                if (window.soundFx) window.soundFx.playClick('operator');
                break;
            case 'tan':
                window.calc.tan();
                if (window.soundFx) window.soundFx.playClick('operator');
                break;
            case 'ln':
                window.calc.ln();
                if (window.soundFx) window.soundFx.playClick('operator');
                break;
            case 'log':
                window.calc.log10();
                if (window.soundFx) window.soundFx.playClick('operator');
                break;
            case 'pi':
                window.calc.inputPi();
                if (window.soundFx) window.soundFx.playClick('normal');
                break;
            case 'e':
                window.calc.inputE();
                if (window.soundFx) window.soundFx.playClick('normal');
                break;
            // Memory Actions
            case 'MC':
                window.calc.memoryClear();
                if (window.soundFx) window.soundFx.playClick('action');
                break;
            case 'MR':
                window.calc.memoryRecall();
                if (window.soundFx) window.soundFx.playClick('action');
                break;
            case 'M+':
                window.calc.memoryAdd();
                if (window.soundFx) window.soundFx.playClick('action');
                break;
            case 'M-':
                window.calc.memorySubtract();
                if (window.soundFx) window.soundFx.playClick('action');
                break;
            case 'MS':
                window.calc.memoryStore();
                if (window.soundFx) window.soundFx.playClick('action');
                break;
            // Programmer Actions
            case 'AND':
                window.calc.bitwiseAnd();
                if (window.soundFx) window.soundFx.playClick('operator');
                break;
            case 'OR':
                window.calc.bitwiseOr();
                if (window.soundFx) window.soundFx.playClick('operator');
                break;
            case 'XOR':
                window.calc.bitwiseXor();
                if (window.soundFx) window.soundFx.playClick('operator');
                break;
            case 'NOT':
                window.calc.bitwiseNot();
                if (window.soundFx) window.soundFx.playClick('operator');
                break;
            case '<<':
                window.calc.shiftLeft();
                if (window.soundFx) window.soundFx.playClick('operator');
                break;
            case '>>':
                window.calc.shiftRight();
                if (window.soundFx) window.soundFx.playClick('operator');
                break;
            case 'Undo':
                window.calc.undo();
                if (window.soundFx) window.soundFx.playClick('action');
                break;
            case 'Redo':
                window.calc.redo();
                if (window.soundFx) window.soundFx.playClick('action');
                break;
            default:
                break;
        }
        renderDisplay();
    }

    // Bind Button Click Events
    document.querySelectorAll('.key').forEach((btn) => {
        btn.addEventListener('click', () => {
            const digit = btn.getAttribute('data-digit');
            const action = btn.getAttribute('data-action');
            const base = btn.getAttribute('data-base');

            if (digit !== null) {
                const char = (digit === 'C_HEX') ? 'C' : digit;
                window.calc.inputDigit(char);
                if (window.soundFx) window.soundFx.playClick('normal');
                renderDisplay();
            } else if (action !== null) {
                handleAction(action);
            } else if (base !== null) {
                window.calc.setBase(base.toLowerCase());
                if (window.soundFx) window.soundFx.playClick('action');
                renderDisplay();
                appendTranscript(`Number base switched to: ${base}`);
            }
        });
    });

    // Mode Switcher (Standard, Scientific, Programmer)
    modeButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            modeButtons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            const mode = btn.getAttribute('data-mode');

            if (mode === 'standard') {
                gridScientific.style.display = 'none';
                gridProgrammer.style.display = 'none';
            } else if (mode === 'scientific') {
                gridScientific.style.display = 'grid';
                gridProgrammer.style.display = 'none';
            } else if (mode === 'programmer') {
                gridScientific.style.display = 'none';
                gridProgrammer.style.display = 'grid';
            }
            if (window.soundFx) window.soundFx.playClick('action');
            appendTranscript(`UI Mode toggled to: ${mode.toUpperCase()}`);
        });
    });

    // Quick Toggles
    toggleAngle.addEventListener('click', () => {
        if (window.calc.isDegreeMode()) {
            window.calc.setRadianMode();
            toggleAngle.textContent = 'RAD';
        } else {
            window.calc.setDegreeMode();
            toggleAngle.textContent = 'DEG';
        }
        if (window.soundFx) window.soundFx.playClick('action');
        renderDisplay();
        appendTranscript(`Angle mode switched to: ${window.calc.angleMode.toUpperCase()}`);
    });

    toggleAudio.addEventListener('click', () => {
        const state = window.soundFx.toggle();
        toggleAudio.textContent = state ? 'AUDIO: ON' : 'AUDIO: OFF';
        appendTranscript(`Audio synthesiser: ${state ? 'ENABLED' : 'DISABLED'}`);
    });

    btnWinReset.addEventListener('click', () => {
        window.calc.clear();
        window.calc.clearHistory();
        renderDisplay();
        appendTranscript('System window hard reset executed.');
    });

    btnClearTape.addEventListener('click', () => {
        window.calc.clearHistory();
        renderTape();
        appendTranscript('Paper audit tape wiped.');
    });

    btnClearLog.addEventListener('click', () => {
        transcriptLog.textContent = '"Smalltalk Transcript Cleared"\n';
    });

    // Smalltalk Workspace "DO IT" Evaluator
    function evaluateWorkspaceCode() {
        const code = wsInput.value.trim();
        if (!code) return;
        appendTranscript(`> ${code}`);

        try {
            // Emulate Smalltalk message sends on the calc object
            let res;
            if (code.startsWith('calc evaluate:')) {
                const match = code.match(/calc\s+evaluate:\s*['"]([^'"]+)['"]/);
                if (match) {
                    res = window.calc.evaluate(match[1]);
                } else {
                    res = 'Syntax error in Smalltalk evaluate message';
                }
            } else if (code.startsWith('calc memoryStore:')) {
                const match = code.match(/calc\s+memoryStore:\s*(\d+(\.\d+)?)/);
                if (match) {
                    window.calc.displayValue = match[1];
                    window.calc.memoryStore();
                    res = `Memory stored: ${match[1]}`;
                }
            } else if (code === 'calc inspect' || code === 'calc status') {
                res = JSON.stringify({
                    display: window.calc.display(),
                    accumulator: window.calc.accumulator,
                    pendingOp: window.calc.pendingOperation,
                    memory: window.calc.memory,
                    base: window.calc.numberBase,
                    angle: window.calc.angleMode
                }, null, 2);
            } else {
                // Fallback direct JS execution for flexible exploration
                res = eval(code);
            }
            appendTranscript(`=> ${res}`);
            renderDisplay();
        } catch (err) {
            appendTranscript(`! Error: ${err.message}`);
        }
    }

    btnWsEval.addEventListener('click', evaluateWorkspaceCode);
    wsInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            evaluateWorkspaceCode();
        }
    });

    // Keyboard Shortcuts Multiplexer
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key >= '0' && e.key <= '9') {
            window.calc.inputDigit(e.key);
            if (window.soundFx) window.soundFx.playClick('normal');
            renderDisplay();
        } else if (e.key === '.') {
            window.calc.inputDecimalPoint();
            if (window.soundFx) window.soundFx.playClick('normal');
            renderDisplay();
        } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/' || e.key === '%' || e.key === '^') {
            handleAction(e.key);
        } else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            handleAction('=');
        } else if (e.key === 'Backspace') {
            handleAction('Bk');
        } else if (e.key === 'Escape') {
            handleAction('C');
        }
    });

    // Initial render
    renderDisplay();
})();
