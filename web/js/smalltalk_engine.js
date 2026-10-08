/**
 * ========================================================================
 * SHAE Smalltalk GUI Calculator — Embedded Smalltalk-80 Engine
 * Direct JavaScript compilation of ShaeCalculatorEngine.st
 * Architecture: Model-View-Controller (MVC) Pure Object Model
 * Copyright (c) 2026 spdedsec <legendsatya7272@gmail.com>
 * License: MIT
 * ========================================================================
 */

class ShaeCalculatorEngine {
    constructor() {
        this.initialize();
    }

    initialize() {
        this.displayValue = '0';
        this.accumulator = 0;
        this.pendingOperation = null;
        this.lastOperand = 0;
        this.lastOperation = null;
        this.memory = 0;
        this.history = [];
        this.angleMode = 'degree'; // 'degree' or 'radian'
        this.numberBase = 'dec';   // 'dec', 'hex', 'bin', 'oct'
        this.state = 'initial';
        this.enteringNewNumber = true;
        this.hasError = false;
        this.errorMessage = '';
        this.undoStack = [];
        this.redoStack = [];
    }

    // --- Accessing ---

    display() {
        if (this.hasError) return this.errorMessage;
        return this.formatForBase(this.displayValue, this.numberBase);
    }

    rawDisplayValue() {
        if (this.numberBase !== 'dec') {
            const intVal = parseInt(this.displayValue, this.getBaseRadix());
            return isNaN(intVal) ? 0 : intVal;
        }
        const val = parseFloat(this.displayValue);
        return isNaN(val) ? 0 : val;
    }

    getBaseRadix() {
        switch (this.numberBase) {
            case 'hex': return 16;
            case 'bin': return 2;
            case 'oct': return 8;
            default: return 10;
        }
    }

    formatForBase(valStr, base) {
        if (base === 'dec') return valStr;
        const num = parseFloat(valStr);
        if (isNaN(num)) return valStr;
        const intVal = Math.trunc(num);
        switch (base) {
            case 'hex': return intVal.toString(16).toUpperCase();
            case 'bin': return intVal.toString(2);
            case 'oct': return intVal.toString(8);
            default: return valStr;
        }
    }

    hasMemoryRegister() {
        return this.memory !== 0;
    }

    // --- Digit & Character Input ---

    inputDigit(digitChar) {
        if (this.hasError) this.clear();
        this.saveStateForUndo();
        const char = String(digitChar).toUpperCase();

        // Validate digit for active number base
        if (this.numberBase === 'bin' && !'01'.includes(char)) return;
        if (this.numberBase === 'oct' && !'01234567'.includes(char)) return;
        if (this.numberBase === 'dec' && !'0123456789'.includes(char)) return;
        if (this.numberBase === 'hex' && !'0123456789ABCDEF'.includes(char)) return;

        if (this.enteringNewNumber) {
            this.displayValue = (char === '0') ? '0' : char;
            this.enteringNewNumber = false;
        } else {
            if (this.displayValue === '0') {
                this.displayValue = char;
            } else {
                this.displayValue += char;
            }
        }
        this.state = 'inputting';
    }

    inputDecimalPoint() {
        if (this.hasError) this.clear();
        this.saveStateForUndo();

        if (this.numberBase !== 'dec') return; // Decimals only supported in base 10

        if (this.enteringNewNumber) {
            this.displayValue = '0.';
            this.enteringNewNumber = false;
        } else {
            if (!this.displayValue.includes('.')) {
                this.displayValue += '.';
            }
        }
        this.state = 'inputting';
    }

    inputSignToggle() {
        if (this.hasError) return;
        this.saveStateForUndo();

        if (this.displayValue === '0' || this.displayValue === '0.') return;
        if (this.displayValue.startsWith('-')) {
            this.displayValue = this.displayValue.substring(1);
        } else {
            this.displayValue = '-' + this.displayValue;
        }
    }

    backspace() {
        if (this.hasError) {
            this.clear();
            return;
        }
        if (this.enteringNewNumber) return;
        this.saveStateForUndo();

        if (this.displayValue.length <= 1) {
            this.displayValue = '0';
            this.enteringNewNumber = true;
        } else {
            this.displayValue = this.displayValue.slice(0, -1);
            if (this.displayValue === '-' || this.displayValue === '') {
                this.displayValue = '0';
                this.enteringNewNumber = true;
            }
        }
    }

    // --- Basic Binary Operations ---

    add() { this.applyBinaryOperator('+', '+'); }
    subtract() { this.applyBinaryOperator('-', '-'); }
    multiply() { this.applyBinaryOperator('*', '*'); }
    divide() { this.applyBinaryOperator('/', '/'); }
    modulo() { this.applyBinaryOperator('%', '%'); }
    power() { this.applyBinaryOperator('^', '^'); }

    applyBinaryOperator(opSymbol, opName) {
        if (this.hasError) return;
        this.saveStateForUndo();

        const currentNum = this.rawDisplayValue();

        if (this.pendingOperation === null) {
            this.accumulator = currentNum;
        } else {
            if (!this.enteringNewNumber) {
                this.executePendingOperationWith(currentNum);
            }
        }

        this.pendingOperation = opSymbol;
        this.lastOperation = opSymbol;
        this.lastOperand = currentNum;
        this.enteringNewNumber = true;
        this.state = 'operatorPending';
    }

    executePendingOperationWith(secondOperand) {
        if (this.pendingOperation === '/' && secondOperand === 0) {
            this.signalError('Error: Div by Zero');
            return;
        }

        let result;
        switch (this.pendingOperation) {
            case '+': result = this.accumulator + secondOperand; break;
            case '-': result = this.accumulator - secondOperand; break;
            case '*': result = this.accumulator * secondOperand; break;
            case '/': result = this.accumulator / secondOperand; break;
            case '%': result = this.accumulator % secondOperand; break;
            case '^': result = Math.pow(this.accumulator, secondOperand); break;
            case '&': result = (this.accumulator & secondOperand); break;
            case '|': result = (this.accumulator | secondOperand); break;
            case '^bit': result = (this.accumulator ^ secondOperand); break;
            default: result = secondOperand;
        }

        this.accumulator = result;
        this.displayValue = this.formatNumber(result);
    }

    equals() {
        if (this.hasError) return;
        this.saveStateForUndo();

        const currentNum = this.rawDisplayValue();

        if (this.pendingOperation !== null) {
            this.lastOperand = currentNum;
            this.lastOperation = this.pendingOperation;
            const expressionDesc = `${this.formatNumber(this.accumulator)} ${this.pendingOperation} ${this.formatNumber(this.lastOperand)}`;

            if (this.pendingOperation === '/' && this.lastOperand === 0) {
                this.signalError('Error: Div by Zero');
                return;
            }

            let result;
            switch (this.pendingOperation) {
                case '+': result = this.accumulator + this.lastOperand; break;
                case '-': result = this.accumulator - this.lastOperand; break;
                case '*': result = this.accumulator * this.lastOperand; break;
                case '/': result = this.accumulator / this.lastOperand; break;
                case '%': result = this.accumulator % this.lastOperand; break;
                case '^': result = Math.pow(this.accumulator, this.lastOperand); break;
                case '&': result = (this.accumulator & this.lastOperand); break;
                case '|': result = (this.accumulator | this.lastOperand); break;
                case '^bit': result = (this.accumulator ^ this.lastOperand); break;
                default: result = this.lastOperand;
            }

            this.accumulator = result;
            this.displayValue = this.formatNumber(result);
            this.recordTape(expressionDesc, this.displayValue);
            this.pendingOperation = null;
        } else if (this.lastOperation !== null) {
            // Repeat last operation on repeated press of equals
            const expressionDesc = `${this.formatNumber(currentNum)} ${this.lastOperation} ${this.formatNumber(this.lastOperand)}`;
            let result;
            switch (this.lastOperation) {
                case '+': result = currentNum + this.lastOperand; break;
                case '-': result = currentNum - this.lastOperand; break;
                case '*': result = currentNum * this.lastOperand; break;
                case '/':
                    if (this.lastOperand === 0) { this.signalError('Error: Div by Zero'); return; }
                    result = currentNum / this.lastOperand; break;
                case '%': result = currentNum % this.lastOperand; break;
                case '^': result = Math.pow(currentNum, this.lastOperand); break;
                default: result = currentNum;
            }
            this.displayValue = this.formatNumber(result);
            this.recordTape(expressionDesc, this.displayValue);
        }

        this.enteringNewNumber = true;
        this.state = 'evaluated';
    }

    // --- Scientific Functions ---

    squareRoot() {
        if (this.hasError) return;
        this.saveStateForUndo();
        const val = this.rawDisplayValue();
        if (val < 0) { this.signalError('Error: Neg Sqrt'); return; }
        this.setDisplayNumber(Math.sqrt(val), 'sqrt');
    }

    square() {
        if (this.hasError) return;
        this.saveStateForUndo();
        const val = this.rawDisplayValue();
        this.setDisplayNumber(val * val, 'sqr');
    }

    cube() {
        if (this.hasError) return;
        this.saveStateForUndo();
        const val = this.rawDisplayValue();
        this.setDisplayNumber(val * val * val, 'cube');
    }

    reciprocal() {
        if (this.hasError) return;
        this.saveStateForUndo();
        const val = this.rawDisplayValue();
        if (val === 0) { this.signalError('Error: Div by Zero'); return; }
        this.setDisplayNumber(1 / val, '1/');
    }

    factorial() {
        if (this.hasError) return;
        this.saveStateForUndo();
        const n = this.rawDisplayValue();
        if (n < 0 || !Number.isInteger(n) || n > 170) {
            this.signalError('Error: Invalid Fact');
            return;
        }
        let acc = 1;
        for (let i = 2; i <= n; i++) acc *= i;
        this.setDisplayNumber(acc, 'fact');
    }

    percentage() {
        if (this.hasError) return;
        this.saveStateForUndo();
        const val = this.rawDisplayValue();
        const result = (this.pendingOperation !== null && this.accumulator !== 0)
            ? this.accumulator * (val / 100)
            : val / 100;
        this.setDisplayNumber(result, '%');
    }

    sin() {
        if (this.hasError) return;
        this.saveStateForUndo();
        const rad = this.toRadians(this.rawDisplayValue());
        const res = Math.sin(rad);
        this.setDisplayNumber(Math.abs(res) < 1e-15 ? 0 : res, 'sin');
    }

    cos() {
        if (this.hasError) return;
        this.saveStateForUndo();
        const rad = this.toRadians(this.rawDisplayValue());
        const res = Math.cos(rad);
        this.setDisplayNumber(Math.abs(res) < 1e-15 ? 0 : res, 'cos');
    }

    tan() {
        if (this.hasError) return;
        this.saveStateForUndo();
        const val = this.rawDisplayValue();
        const rad = this.toRadians(val);
        const cosVal = Math.cos(rad);
        if (Math.abs(cosVal) < 1e-12) {
            this.signalError('Error: Tan Undef');
            return;
        }
        const res = Math.tan(rad);
        this.setDisplayNumber(Math.abs(res) < 1e-15 ? 0 : res, 'tan');
    }

    ln() {
        if (this.hasError) return;
        this.saveStateForUndo();
        const val = this.rawDisplayValue();
        if (val <= 0) { this.signalError('Error: Invalid Log'); return; }
        this.setDisplayNumber(Math.log(val), 'ln');
    }

    log10() {
        if (this.hasError) return;
        this.saveStateForUndo();
        const val = this.rawDisplayValue();
        if (val <= 0) { this.signalError('Error: Invalid Log'); return; }
        this.setDisplayNumber(Math.log10(val), 'log10');
    }

    exp() {
        if (this.hasError) return;
        this.saveStateForUndo();
        const val = this.rawDisplayValue();
        this.setDisplayNumber(Math.exp(val), 'exp');
    }

    inputPi() {
        this.saveStateForUndo();
        this.displayValue = String(Math.PI);
        this.enteringNewNumber = true;
    }

    inputE() {
        this.saveStateForUndo();
        this.displayValue = String(Math.E);
        this.enteringNewNumber = true;
    }

    // --- Bitwise & Programmer Functions ---

    bitwiseAnd() { this.applyBinaryOperator('&', 'AND'); }
    bitwiseOr() { this.applyBinaryOperator('|', 'OR'); }
    bitwiseXor() { this.applyBinaryOperator('^bit', 'XOR'); }

    bitwiseNot() {
        if (this.hasError) return;
        this.saveStateForUndo();
        const val = Math.trunc(this.rawDisplayValue());
        this.setDisplayNumber(~val, 'NOT');
    }

    shiftLeft() {
        if (this.hasError) return;
        this.saveStateForUndo();
        const val = Math.trunc(this.rawDisplayValue());
        this.setDisplayNumber(val << 1, '<<');
    }

    shiftRight() {
        if (this.hasError) return;
        this.saveStateForUndo();
        const val = Math.trunc(this.rawDisplayValue());
        this.setDisplayNumber(val >> 1, '>>');
    }

    // --- Memory Operations ---

    memoryStore() {
        if (this.hasError) return;
        this.memory = this.rawDisplayValue();
        this.enteringNewNumber = true;
    }

    memoryRecall() {
        if (this.hasError) return;
        this.saveStateForUndo();
        this.displayValue = this.formatNumber(this.memory);
        this.enteringNewNumber = true;
    }

    memoryClear() {
        this.memory = 0;
    }

    memoryAdd() {
        if (this.hasError) return;
        this.memory += this.rawDisplayValue();
        this.enteringNewNumber = true;
    }

    memorySubtract() {
        if (this.hasError) return;
        this.memory -= this.rawDisplayValue();
        this.enteringNewNumber = true;
    }

    // --- State and Clear ---

    clear() {
        this.saveStateForUndo();
        this.displayValue = '0';
        this.accumulator = 0;
        this.pendingOperation = null;
        this.lastOperand = 0;
        this.lastOperation = null;
        this.enteringNewNumber = true;
        this.hasError = false;
        this.errorMessage = '';
        this.state = 'cleared';
    }

    clearEntry() {
        this.saveStateForUndo();
        this.displayValue = '0';
        this.enteringNewNumber = true;
        this.hasError = false;
        this.errorMessage = '';
    }

    signalError(msg) {
        this.hasError = true;
        this.errorMessage = msg;
        this.displayValue = msg;
        this.enteringNewNumber = true;
    }

    clearHistory() {
        this.history = [];
    }

    // --- Modes & Formatting ---

    setDegreeMode() { this.angleMode = 'degree'; }
    setRadianMode() { this.angleMode = 'radian'; }
    isDegreeMode() { return this.angleMode === 'degree'; }

    setBase(base) {
        if (['dec', 'hex', 'bin', 'oct'].includes(base)) {
            this.numberBase = base;
        }
    }

    toRadians(angle) {
        return this.angleMode === 'degree' ? angle * (Math.PI / 180) : angle;
    }

    formatNumber(num) {
        if (typeof num !== 'number' || isNaN(num)) return '0';
        if (Number.isInteger(num)) return String(num);
        // Clean float precision representation (e.g. 0.1 + 0.2 -> 0.3)
        const rounded = parseFloat(num.toPrecision(12));
        return String(rounded);
    }

    setDisplayNumber(num, prefix) {
        const orig = this.displayValue;
        const formatted = this.formatNumber(num);
        this.displayValue = formatted;
        this.recordTape(`${prefix}(${orig})`, formatted);
        this.enteringNewNumber = true;
    }

    recordTape(expr, res) {
        const timestamp = new Date().toLocaleTimeString();
        this.history.unshift({ timestamp, expression: expr, result: res });
        if (this.history.length > 100) this.history.pop();
    }

    // --- Undo / Redo ---

    saveStateForUndo() {
        if (this.undoStack.length >= 50) this.undoStack.shift();
        this.undoStack.push(this.captureMemento());
        this.redoStack = [];
    }

    captureMemento() {
        return {
            displayValue: this.displayValue,
            accumulator: this.accumulator,
            pendingOperation: this.pendingOperation,
            lastOperand: this.lastOperand,
            lastOperation: this.lastOperation,
            memory: this.memory,
            enteringNewNumber: this.enteringNewNumber,
            hasError: this.hasError,
            errorMessage: this.errorMessage
        };
    }

    restoreMemento(m) {
        this.displayValue = m.displayValue;
        this.accumulator = m.accumulator;
        this.pendingOperation = m.pendingOperation;
        this.lastOperand = m.lastOperand;
        this.lastOperation = m.lastOperation;
        this.memory = m.memory;
        this.enteringNewNumber = m.enteringNewNumber;
        this.hasError = m.hasError;
        this.errorMessage = m.errorMessage;
    }

    undo() {
        if (this.undoStack.length === 0) return;
        this.redoStack.push(this.captureMemento());
        this.restoreMemento(this.undoStack.pop());
    }

    redo() {
        if (this.redoStack.length === 0) return;
        this.undoStack.push(this.captureMemento());
        this.restoreMemento(this.redoStack.pop());
    }

    // --- Expression Evaluation (Infix Shunting-Yard) ---

    evaluate(exprString) {
        this.saveStateForUndo();
        try {
            const tokens = this.tokenize(exprString);
            const rpn = this.shuntingYard(tokens);
            const result = this.evaluateRPN(rpn);
            this.displayValue = this.formatNumber(result);
            this.recordTape(exprString, this.displayValue);
            this.accumulator = result;
            this.pendingOperation = null;
            this.enteringNewNumber = true;
            return result;
        } catch (e) {
            this.signalError('Error: Syntax / Eval');
            return null;
        }
    }

    tokenize(str) {
        const tokens = [];
        let buffer = '';
        for (let i = 0; i < str.length; i++) {
            const c = str[i];
            if (/\s/.test(c)) continue;
            if (/[\d.]/.test(c)) {
                buffer += c;
            } else {
                if (buffer.length > 0) {
                    tokens.push(buffer);
                    buffer = '';
                }
                if ('+-*/%^()'.includes(c)) {
                    tokens.push(c);
                } else if (/[a-zA-Z]/.test(c)) {
                    buffer += c;
                }
            }
        }
        if (buffer.length > 0) tokens.push(buffer);
        return tokens;
    }

    shuntingYard(tokens) {
        const output = [];
        const opStack = [];
        const prec = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2, '^': 3 };

        for (const token of tokens) {
            if (!isNaN(parseFloat(token))) {
                output.push(parseFloat(token));
            } else if (token === '(') {
                opStack.push(token);
            } else if (token === ')') {
                while (opStack.length > 0 && opStack[opStack.length - 1] !== '(') {
                    output.push(opStack.pop());
                }
                if (opStack.length > 0) opStack.pop();
            } else if (token in prec) {
                while (
                    opStack.length > 0 &&
                    opStack[opStack.length - 1] !== '(' &&
                    prec[opStack[opStack.length - 1]] >= prec[token]
                ) {
                    output.push(opStack.pop());
                }
                opStack.push(token);
            }
        }

        while (opStack.length > 0) {
            output.push(opStack.pop());
        }
        return output;
    }

    evaluateRPN(rpn) {
        const stack = [];
        for (const token of rpn) {
            if (typeof token === 'number') {
                stack.push(token);
            } else {
                if (stack.length < 2) throw new Error('Malformed expression');
                const b = stack.pop();
                const a = stack.pop();
                switch (token) {
                    case '+': stack.push(a + b); break;
                    case '-': stack.push(a - b); break;
                    case '*': stack.push(a * b); break;
                    case '/':
                        if (b === 0) throw new Error('Division by zero');
                        stack.push(a / b);
                        break;
                    case '%': stack.push(a % b); break;
                    case '^': stack.push(Math.pow(a, b)); break;
                    default: throw new Error(`Unknown operator ${token}`);
                }
            }
        }
        if (stack.length !== 1) throw new Error('Invalid stack state');
        return stack[0];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ShaeCalculatorEngine };
}
