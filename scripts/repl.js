#!/usr/bin/env node
/**
 * ========================================================================
 * SHAE Smalltalk GUI Calculator — Interactive CLI REPL
 * Smalltalk-80 interactive terminal workspace
 * Copyright (c) 2026 spdedsec <legendsatya7272@gmail.com>
 * License: MIT
 * ========================================================================
 */

const readline = require('readline');
const { ShaeCalculatorEngine } = require('../web/js/smalltalk_engine.js');

const calc = new ShaeCalculatorEngine();

console.log('====================================================================');
console.log('  SHAE Smalltalk-80 Interactive CLI Workspace');
console.log('  calc := ShaeCalculatorEngine new.');
console.log('  Type mathematical expressions, Smalltalk commands, or "help".');
console.log('  Press Ctrl+C or type "exit" to quit.');
console.log('====================================================================\n');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Smalltalk> '
});

rl.prompt();

rl.on('line', (line) => {
    const input = line.trim();
    if (!input) {
        rl.prompt();
        return;
    }

    if (input === 'exit' || input === 'quit') {
        console.log('Transcript: session terminated.');
        process.exit(0);
    }

    if (input === 'help') {
        console.log('\nSupported Commands:');
        console.log('  <expression>          Evaluate infix expression (e.g., 3 + 4 * 2, sqrt(16), 2^8)');
        console.log('  calc display          Show LCD display string');
        console.log('  calc clear            Reset accumulator and display');
        console.log('  calc mem <n>          Store number <n> into memory register');
        console.log('  calc mr               Recall memory register');
        console.log('  calc tape             Print history audit tape');
        console.log('  calc inspect          Print full internal state dictionary\n');
        rl.prompt();
        return;
    }

    if (input === 'calc display') {
        console.log(`Display: [ ${calc.display()} ]`);
    } else if (input === 'calc clear') {
        calc.clear();
        console.log('Display: [ 0 ] (cleared)');
    } else if (input.startsWith('calc mem ')) {
        const val = parseFloat(input.substring(9).trim());
        calc.displayValue = String(val);
        calc.memoryStore();
        console.log(`Memory stored: ${calc.memory}`);
    } else if (input === 'calc mr') {
        calc.memoryRecall();
        console.log(`Recalled memory: [ ${calc.display()} ]`);
    } else if (input === 'calc tape') {
        console.log('\n--- History Audit Tape ---');
        calc.history.forEach((h, i) => {
            console.log(`  #${calc.history.length - i} [${h.timestamp}] ${h.expression} = ${h.result}`);
        });
        console.log('--------------------------\n');
    } else if (input === 'calc inspect') {
        console.log(JSON.stringify({
            display: calc.display(),
            accumulator: calc.accumulator,
            pendingOp: calc.pendingOperation,
            lastOperand: calc.lastOperand,
            memory: calc.memory,
            angleMode: calc.angleMode,
            numberBase: calc.numberBase,
            hasError: calc.hasError
        }, null, 2));
    } else {
        // Treat as expression evaluation
        try {
            const res = calc.evaluate(input);
            console.log(`=> ${res}`);
        } catch (err) {
            console.log(`! Error: ${err.message}`);
        }
    }

    rl.prompt();
}).on('close', () => {
    console.log('\nSession closed.');
    process.exit(0);
});
