/**
 * ========================================================================
 * SHAE Smalltalk GUI Calculator — SUnit Headless Test Runner
 * Executes unit tests for ShaeCalculatorEngine
 * ========================================================================
 */

const { ShaeCalculatorEngine } = require('../web/js/smalltalk_engine.js');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion Failed: ${message}`);
    }
}

function assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
        throw new Error(`Expected [${expected}] but got [${actual}]. ${message}`);
    }
}

function runTest(testName, testFn) {
    totalTests++;
    try {
        const calc = new ShaeCalculatorEngine();
        testFn(calc);
        passedTests++;
        console.log(`  ✓ ${testName}`);
    } catch (err) {
        failedTests++;
        console.error(`  ✗ ${testName} FAILED: ${err.message}`);
    }
}

console.log('===========================================================');
console.log('SHAE Smalltalk SUnit Test Suite');
console.log('TestCase subclass: #ShaeCalculatorTest');
console.log('===========================================================\n');

// 1. Initial State
runTest('testInitialState', (calc) => {
    assertEqual(calc.display(), '0');
    assertEqual(calc.accumulator, 0);
    assertEqual(calc.memory, 0);
    assert(!calc.hasMemoryRegister(), 'Memory should be clear initially');
    assert(!calc.hasError, 'Should not have error');
    assertEqual(calc.angleMode, 'degree');
    assertEqual(calc.numberBase, 'dec');
});

// 2. Digit Entry
runTest('testDigitEntry', (calc) => {
    calc.inputDigit(4);
    assertEqual(calc.display(), '4');
    calc.inputDigit(2);
    assertEqual(calc.display(), '42');
});

// 3. Decimal Entry
runTest('testDecimalEntry', (calc) => {
    calc.inputDigit(3);
    calc.inputDecimalPoint();
    calc.inputDigit(1);
    calc.inputDigit(4);
    assertEqual(calc.display(), '3.14');
    // Multiple decimals should be ignored
    calc.inputDecimalPoint();
    calc.inputDigit(1);
    assertEqual(calc.display(), '3.141');
});

// 4. Leading Zeroes
runTest('testLeadingZeroes', (calc) => {
    calc.inputDigit(0);
    assertEqual(calc.display(), '0');
    calc.inputDigit(0);
    assertEqual(calc.display(), '0');
    calc.inputDigit(7);
    assertEqual(calc.display(), '7');
});

// 5. Sign Toggle
runTest('testSignToggle', (calc) => {
    calc.inputDigit(8);
    calc.inputSignToggle();
    assertEqual(calc.display(), '-8');
    calc.inputSignToggle();
    assertEqual(calc.display(), '8');
});

// 6. Backspace
runTest('testBackspace', (calc) => {
    calc.inputDigit(1);
    calc.inputDigit(2);
    calc.inputDigit(3);
    assertEqual(calc.display(), '123');
    calc.backspace();
    assertEqual(calc.display(), '12');
    calc.backspace();
    assertEqual(calc.display(), '1');
    calc.backspace();
    assertEqual(calc.display(), '0');
});

// 7. Addition
runTest('testAddition', (calc) => {
    calc.inputDigit(1); calc.inputDigit(5);
    calc.add();
    calc.inputDigit(2); calc.inputDigit(7);
    calc.equals();
    assertEqual(calc.display(), '42');
});

// 8. Subtraction
runTest('testSubtraction', (calc) => {
    calc.inputDigit(5); calc.inputDigit(0);
    calc.subtract();
    calc.inputDigit(8);
    calc.equals();
    assertEqual(calc.display(), '42');
});

// 9. Multiplication
runTest('testMultiplication', (calc) => {
    calc.inputDigit(6);
    calc.multiply();
    calc.inputDigit(7);
    calc.equals();
    assertEqual(calc.display(), '42');
});

// 10. Division
runTest('testDivision', (calc) => {
    calc.inputDigit(8); calc.inputDigit(4);
    calc.divide();
    calc.inputDigit(2);
    calc.equals();
    assertEqual(calc.display(), '42');
});

// 11. Division by Zero
runTest('testDivisionByZero', (calc) => {
    calc.inputDigit(9);
    calc.divide();
    calc.inputDigit(0);
    calc.equals();
    assert(calc.hasError, 'Error flag should be set');
    assertEqual(calc.display(), 'Error: Div by Zero');
});

// 12. Operator Chaining
runTest('testOperatorChaining', (calc) => {
    calc.inputDigit(3);
    calc.add();
    calc.inputDigit(4);
    calc.multiply();
    assertEqual(calc.display(), '7');
    calc.inputDigit(2);
    calc.equals();
    assertEqual(calc.display(), '14');
});

// 13. Repeat Equals
runTest('testRepeatEquals', (calc) => {
    calc.inputDigit(5);
    calc.add();
    calc.inputDigit(3);
    calc.equals();
    assertEqual(calc.display(), '8');
    calc.equals();
    assertEqual(calc.display(), '11');
    calc.equals();
    assertEqual(calc.display(), '14');
});

// 14. Modulo
runTest('testModulo', (calc) => {
    calc.inputDigit(1); calc.inputDigit(7);
    calc.modulo();
    calc.inputDigit(5);
    calc.equals();
    assertEqual(calc.display(), '2');
});

// 15. Power
runTest('testPower', (calc) => {
    calc.inputDigit(2);
    calc.power();
    calc.inputDigit(8);
    calc.equals();
    assertEqual(calc.display(), '256');
});

// 16. Square Root
runTest('testSquareRoot', (calc) => {
    calc.inputDigit(8); calc.inputDigit(1);
    calc.squareRoot();
    assertEqual(calc.display(), '9');
});

// 17. Negative Square Root
runTest('testNegativeSquareRootError', (calc) => {
    calc.inputDigit(9);
    calc.inputSignToggle();
    calc.squareRoot();
    assert(calc.hasError);
    assertEqual(calc.display(), 'Error: Neg Sqrt');
});

// 18. Square and Cube
runTest('testSquareAndCube', (calc) => {
    calc.inputDigit(5);
    calc.square();
    assertEqual(calc.display(), '25');
    calc.clear();
    calc.inputDigit(3);
    calc.cube();
    assertEqual(calc.display(), '27');
});

// 19. Reciprocal
runTest('testReciprocal', (calc) => {
    calc.inputDigit(4);
    calc.reciprocal();
    assertEqual(calc.display(), '0.25');
    calc.clear();
    calc.inputDigit(0);
    calc.reciprocal();
    assert(calc.hasError);
    assertEqual(calc.display(), 'Error: Div by Zero');
});

// 20. Factorial
runTest('testFactorial', (calc) => {
    calc.inputDigit(5);
    calc.factorial();
    assertEqual(calc.display(), '120');
});

// 21. Percentage
runTest('testPercentage', (calc) => {
    calc.inputDigit(2); calc.inputDigit(0); calc.inputDigit(0);
    calc.add();
    calc.inputDigit(1); calc.inputDigit(5);
    calc.percentage();
    assertEqual(calc.display(), '30');
    calc.equals();
    assertEqual(calc.display(), '230');
});

// 22. Trigonometry Degrees
runTest('testTrigonometryDegrees', (calc) => {
    calc.setDegreeMode();
    calc.inputDigit(0);
    calc.sin();
    assertEqual(calc.display(), '0');
    calc.clear();
    calc.inputDigit(0);
    calc.cos();
    assertEqual(calc.display(), '1');
});

// 23. Logarithms
runTest('testLogarithms', (calc) => {
    calc.inputDigit(1);
    calc.ln();
    assertEqual(calc.display(), '0');
    calc.clear();
    calc.inputDigit(1); calc.inputDigit(0); calc.inputDigit(0);
    calc.log10();
    assertEqual(calc.display(), '2');
});

// 24. Memory Operations
runTest('testMemoryOperations', (calc) => {
    calc.inputDigit(5); calc.inputDigit(0);
    calc.memoryStore();
    assert(calc.hasMemoryRegister());
    assertEqual(calc.memory, 50);

    calc.clear();
    assertEqual(calc.display(), '0');
    calc.memoryRecall();
    assertEqual(calc.display(), '50');

    calc.clear();
    calc.inputDigit(2); calc.inputDigit(0);
    calc.memoryAdd();
    assertEqual(calc.memory, 70);

    calc.clear();
    calc.inputDigit(1); calc.inputDigit(5);
    calc.memorySubtract();
    assertEqual(calc.memory, 55);

    calc.memoryClear();
    assert(!calc.hasMemoryRegister());
    assertEqual(calc.memory, 0);
});

// 25. History Tape
runTest('testHistoryTape', (calc) => {
    calc.inputDigit(4);
    calc.add();
    calc.inputDigit(6);
    calc.equals();
    assertEqual(calc.history.length, 1);
    assertEqual(calc.history[0].result, '10');
});

// 26. Undo / Redo
runTest('testUndoRedo', (calc) => {
    calc.inputDigit(5);
    calc.inputDigit(0);
    assertEqual(calc.display(), '50');
    calc.undo();
    assertEqual(calc.display(), '5');
    calc.redo();
    assertEqual(calc.display(), '50');
});

// 27. Expression Evaluation Basic
runTest('testExpressionEvaluation', (calc) => {
    assertEqual(calc.evaluate('3 + 4 * 2'), 11);
    assertEqual(calc.evaluate('(3 + 4) * 2'), 14);
    assertEqual(calc.evaluate('2 ^ 3 + 5'), 13);
    assertEqual(calc.evaluate('100 / (2 + 3)'), 20);
});

// 28. Base Conversion Hexadecimal
runTest('testBaseConversionHex', (calc) => {
    calc.inputDigit(2); calc.inputDigit(5); calc.inputDigit(5);
    calc.setBase('hex');
    assertEqual(calc.display(), 'FF');
});

// 29. Base Conversion Binary
runTest('testBaseConversionBinary', (calc) => {
    calc.inputDigit(1); calc.inputDigit(0);
    calc.setBase('bin');
    assertEqual(calc.display(), '1010');
});

// 30. Bitwise Operations
runTest('testBitwiseOperations', (calc) => {
    calc.inputDigit(1); calc.inputDigit(2); // 12 (0b1100)
    calc.bitwiseAnd();
    calc.inputDigit(1); calc.inputDigit(0); // 10 (0b1010)
    calc.equals();
    assertEqual(calc.display(), '8'); // 0b1000 = 8
});

console.log('\n===========================================================');
console.log(`Results: ${passedTests} passed, ${failedTests} failed (${totalTests} total tests)`);
console.log('===========================================================');

if (failedTests > 0) {
    process.exit(1);
} else {
    console.log('All Smalltalk SUnit test assertions passed 100%!');
}
