"========================================================================
  SHAE Smalltalk GUI Calculator — SUnit Test Suite
  Dialect: SUnit Standard (GNU Smalltalk, Cuis, Squeak, Pharo)
  Copyright (c) 2026 spdedsec <legendsatya7272@gmail.com>
  License: MIT
========================================================================"

TestCase subclass: #ShaeCalculatorTest
    instanceVariableNames: 'calc'
    classVariableNames: ''
    poolDictionaries: ''
    category: 'Shae-Calculator-Tests'!

!ShaeCalculatorTest methodsFor: 'running'!

setUp
    calc := ShaeCalculatorEngine new.!

tearDown
    calc := nil.!
!

!ShaeCalculatorTest methodsFor: 'tests - input'!

testInitialState
    self assert: calc display equals: '0'.
    self assert: calc accumulator equals: 0.
    self assert: calc memory equals: 0.
    self deny: calc hasMemory.
    self deny: calc hasError.
    self assert: calc angleMode equals: #degree.
    self assert: calc numberBase equals: #dec.!

testDigitEntry
    calc inputDigit: 4.
    self assert: calc display equals: '4'.
    calc inputDigit: 2.
    self assert: calc display equals: '42'.!

testDecimalEntry
    calc inputDigit: 3.
    calc inputDecimalPoint.
    calc inputDigit: 1.
    calc inputDigit: 4.
    self assert: calc display equals: '3.14'.
    "Multiple decimals should be ignored"
    calc inputDecimalPoint.
    calc inputDigit: 1.
    self assert: calc display equals: '3.141'.!

testLeadingZeroes
    calc inputDigit: 0.
    self assert: calc display equals: '0'.
    calc inputDigit: 0.
    self assert: calc display equals: '0'.
    calc inputDigit: 7.
    self assert: calc display equals: '7'.!

testSignToggle
    calc inputDigit: 8.
    calc inputSignToggle.
    self assert: calc display equals: '-8'.
    calc inputSignToggle.
    self assert: calc display equals: '8'.!

testBackspace
    calc inputDigit: 1.
    calc inputDigit: 2.
    calc inputDigit: 3.
    self assert: calc display equals: '123'.
    calc backspace.
    self assert: calc display equals: '12'.
    calc backspace.
    self assert: calc display equals: '1'.
    calc backspace.
    self assert: calc display equals: '0'.!
!

!ShaeCalculatorTest methodsFor: 'tests - arithmetic'!

testAddition
    calc inputDigit: 1; inputDigit: 5.
    calc add.
    calc inputDigit: 2; inputDigit: 7.
    calc equals.
    self assert: calc display equals: '42'.!

testSubtraction
    calc inputDigit: 5; inputDigit: 0.
    calc subtract.
    calc inputDigit: 8.
    calc equals.
    self assert: calc display equals: '42'.!

testMultiplication
    calc inputDigit: 6.
    calc multiply.
    calc inputDigit: 7.
    calc equals.
    self assert: calc display equals: '42'.!

testDivision
    calc inputDigit: 8; inputDigit: 4.
    calc divide.
    calc inputDigit: 2.
    calc equals.
    self assert: calc display equals: '42'.!

testDivisionByZero
    calc inputDigit: 9.
    calc divide.
    calc inputDigit: 0.
    calc equals.
    self assert: calc hasError.
    self assert: calc display equals: 'Error: Div by Zero'.!

testOperatorChaining
    "3 + 4 * 2 = should compute (3 + 4) * 2 = 14 in immediate execution mode"
    calc inputDigit: 3.
    calc add.
    calc inputDigit: 4.
    calc multiply.
    self assert: calc display equals: '7'.
    calc inputDigit: 2.
    calc equals.
    self assert: calc display equals: '14'.!

testRepeatEquals
    "5 + 3 = 8, then = should repeat + 3 => 11"
    calc inputDigit: 5.
    calc add.
    calc inputDigit: 3.
    calc equals.
    self assert: calc display equals: '8'.
    calc equals.
    self assert: calc display equals: '11'.
    calc equals.
    self assert: calc display equals: '14'.!

testModulo
    calc inputDigit: 1; inputDigit: 7.
    calc modulo.
    calc inputDigit: 5.
    calc equals.
    self assert: calc display equals: '2'.!

testPower
    calc inputDigit: 2.
    calc power.
    calc inputDigit: 8.
    calc equals.
    self assert: calc display equals: '256'.!
!

!ShaeCalculatorTest methodsFor: 'tests - scientific'!

testSquareRoot
    calc inputDigit: 8; inputDigit: 1.
    calc squareRoot.
    self assert: calc display equals: '9'.!

testNegativeSquareRootError
    calc inputDigit: 9.
    calc inputSignToggle.
    calc squareRoot.
    self assert: calc hasError.
    self assert: calc display equals: 'Error: Neg Sqrt'.!

testSquareAndCube
    calc inputDigit: 5.
    calc square.
    self assert: calc display equals: '25'.
    calc clear.
    calc inputDigit: 3.
    calc cube.
    self assert: calc display equals: '27'.!

testReciprocal
    calc inputDigit: 4.
    calc reciprocal.
    self assert: calc display equals: '0.25'.
    calc clear.
    calc inputDigit: 0.
    calc reciprocal.
    self assert: calc hasError.
    self assert: calc display equals: 'Error: Div by Zero'.!

testFactorial
    calc inputDigit: 5.
    calc factorial.
    self assert: calc display equals: '120'.!

testPercentage
    calc inputDigit: 2; inputDigit: 0; inputDigit: 0.
    calc add.
    calc inputDigit: 1; inputDigit: 5.
    calc percentage.
    self assert: calc display equals: '30'.
    calc equals.
    self assert: calc display equals: '230'.!

testTrigonometryDegrees
    calc setDegreeMode.
    calc inputDigit: 0.
    calc sin.
    self assert: calc display equals: '0'.
    calc clear.
    calc inputDigit: 0.
    calc cos.
    self assert: calc display equals: '1'.!

testLogarithms
    calc inputDigit: 1.
    calc ln.
    self assert: calc display equals: '0'.
    calc clear.
    calc inputDigit: 1; inputDigit: 0; inputDigit: 0.
    calc log10.
    self assert: calc display equals: '2'.!
!

!ShaeCalculatorTest methodsFor: 'tests - memory'!

testMemoryOperations
    calc inputDigit: 5; inputDigit: 0.
    calc memoryStore.
    self assert: calc hasMemory.
    self assert: calc memory equals: 50.

    calc clear.
    self assert: calc display equals: '0'.
    calc memoryRecall.
    self assert: calc display equals: '50'.

    calc clear.
    calc inputDigit: 2; inputDigit: 0.
    calc memoryAdd.
    self assert: calc memory equals: 70.

    calc clear.
    calc inputDigit: 1; inputDigit: 5.
    calc memorySubtract.
    self assert: calc memory equals: 55.

    calc memoryClear.
    self deny: calc hasMemory.
    self assert: calc memory equals: 0.!
!

!ShaeCalculatorTest methodsFor: 'tests - history and undo'!

testHistoryTape
    calc inputDigit: 4.
    calc add.
    calc inputDigit: 6.
    calc equals.
    self assert: calc history size equals: 1.
    self assert: ((calc history first at: #result) equals: '10').!

testUndoRedo
    calc inputDigit: 5.
    calc inputDigit: 0.
    self assert: calc display equals: '50'.
    calc undo.
    self assert: calc display equals: '5'.
    calc redo.
    self assert: calc display equals: '50'.!
!

!ShaeCalculatorTest methodsFor: 'tests - expression evaluation'!

testExpressionEvaluation
    self assert: (calc evaluate: '3 + 4 * 2') equals: 11.
    self assert: (calc evaluate: '(3 + 4) * 2') equals: 14.
    self assert: (calc evaluate: '2 ^ 3 + 5') equals: 13.
    self assert: (calc evaluate: '100 / (2 + 3)') equals: 20.!
!
