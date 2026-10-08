"========================================================================
  SHAE Smalltalk GUI Calculator — Core Engine Model
  Dialect: Smalltalk-80 / GNU Smalltalk / Cuis / Squeak / Pharo
  Architecture: Model-View-Controller (MVC) Pure Object Model
  Copyright (c) 2026 spdedsec <legendsatya7272@gmail.com>
  License: MIT
========================================================================"

Object subclass: #ShaeCalculatorEngine
    instanceVariableNames: 'displayValue accumulator pendingOperation lastOperand lastOperation memory history angleMode numberBase state enteringNewNumber hasError errorMessage undoStack redoStack'
    classVariableNames: ''
    poolDictionaries: ''
    category: 'Shae-Calculator-Core'!

!ShaeCalculatorEngine class methodsFor: 'instance creation'!

new
    "Create and initialize a new SHAE Calculator Engine instance."
    ^ super new initialize!
!

example
    "A quick operational example demonstrating message passing."
    | calc |
    calc := self new.
    calc inputDigit: 5.
    calc add.
    calc inputDigit: 7.
    calc equals.
    ^ calc display!
! !

!ShaeCalculatorEngine methodsFor: 'initialization'!

initialize
    "Reset all calculator registers, history, and evaluation state."
    displayValue := '0'.
    accumulator := 0.
    pendingOperation := nil.
    lastOperand := 0.
    lastOperation := nil.
    memory := 0.
    history := OrderedCollection new.
    angleMode := #degree. "or #radian"
    numberBase := #dec.   "or #hex, #bin, #oct"
    state := #initial.
    enteringNewNumber := true.
    hasError := false.
    errorMessage := ''.
    undoStack := OrderedCollection new.
    redoStack := OrderedCollection new.!
! !

!ShaeCalculatorEngine methodsFor: 'accessing'!

display
    "Return the current string shown on the calculator LCD display."
    hasError ifTrue: [ ^ errorMessage ].
    ^ displayValue!

rawDisplayValue
    "Return the numeric value of the current display string."
    ^ [ displayValue asNumber ] on: Error do: [ 0 ]!

accumulator
    ^ accumulator!

memory
    ^ memory!

hasMemory
    "Returns true if a non-zero value is stored in the memory register."
    ^ memory ~= 0!

history
    "Return the audit tape of completed calculations."
    ^ history copy!

angleMode
    ^ angleMode!

numberBase
    ^ numberBase!

hasError
    ^ hasError!

errorMessage
    ^ errorMessage!
! !

!ShaeCalculatorEngine methodsFor: 'digit input'!

inputDigit: aDigitCharacterOrInteger
    "Append a single digit (0-9, or A-F in hex mode) to the current operand."
    | char |
    hasError ifTrue: [ self clear ].
    self saveStateForUndo.
    char := aDigitCharacterOrInteger asString.

    enteringNewNumber
        ifTrue: [
            displayValue := (char = '0') ifTrue: [ '0' ] ifFalse: [ char ].
            enteringNewNumber := false ]
        ifFalse: [
            (displayValue = '0')
                ifTrue: [ displayValue := char ]
                ifFalse: [ displayValue := displayValue , char ] ].
    state := #inputting.!

inputDecimalPoint
    "Add a decimal point if one is not already present in the active number."
    hasError ifTrue: [ self clear ].
    self saveStateForUndo.

    numberBase = #dec ifFalse: [ ^ self ]. "Decimals only valid in decimal mode"

    enteringNewNumber
        ifTrue: [
            displayValue := '0.'.
            enteringNewNumber := false ]
        ifFalse: [
            (displayValue includes: $.)
                ifFalse: [ displayValue := displayValue , '.' ] ].
    state := #inputting.!

inputSignToggle
    "Toggle between positive and negative sign for the current operand."
    hasError ifTrue: [ ^ self ].
    self saveStateForUndo.

    (displayValue = '0' or: [ displayValue = '0.' ]) ifTrue: [ ^ self ].
    (displayValue beginsWith: '-')
        ifTrue: [ displayValue := displayValue allButFirst ]
        ifFalse: [ displayValue := '-' , displayValue ].!

backspace
    "Delete the trailing character from the input buffer."
    hasError ifTrue: [ self clear. ^ self ].
    enteringNewNumber ifTrue: [ ^ self ].
    self saveStateForUndo.

    displayValue size <= 1
        ifTrue: [
            displayValue := '0'.
            enteringNewNumber := true ]
        ifFalse: [
            displayValue := displayValue allButLast.
            (displayValue = '-' or: [ displayValue isEmpty ])
                ifTrue: [
                    displayValue := '0'.
                    enteringNewNumber := true ] ].!
! !

!ShaeCalculatorEngine methodsFor: 'basic operations'!

add
    self applyBinaryOperator: #+ symbol: '+'!

subtract
    self applyBinaryOperator: #- symbol: '-'!

multiply
    self applyBinaryOperator: #* symbol: '*'!

divide
    self applyBinaryOperator: #/ symbol: '/'!

modulo
    self applyBinaryOperator: #\\ symbol: '%'!

power
    self applyBinaryOperator: #raisedTo: symbol: '^'!

applyBinaryOperator: aSelector symbol: aSymbolString
    "Set the pending binary operation, chaining previous operations if active."
    | currentNum |
    hasError ifTrue: [ ^ self ].
    self saveStateForUndo.

    currentNum := self rawDisplayValue.

    pendingOperation isNil
        ifTrue: [
            accumulator := currentNum ]
        ifFalse: [
            enteringNewNumber ifFalse: [
                self executePendingOperationWith: currentNum ] ].

    pendingOperation := aSelector.
    lastOperation := aSelector.
    lastOperand := currentNum.
    enteringNewNumber := true.
    state := #operatorPending.!

executePendingOperationWith: secondOperand
    "Execute accumulator <pendingOperation> secondOperand with error protection."
    | result |
    [
        (pendingOperation = #/ and: [ secondOperand = 0 ])
            ifTrue: [ self signalError: 'Error: Div by Zero'. ^ self ].
        
        result := accumulator perform: pendingOperation with: secondOperand.
        accumulator := result.
        displayValue := self formatNumber: result.
    ] on: Error do: [ :ex |
        self signalError: 'Error: Overflow / Math'.
    ]!

equals
    "Finalize the current calculation or repeat the last operation."
    | currentNum result expressionDesc |
    hasError ifTrue: [ ^ self ].
    self saveStateForUndo.

    currentNum := self rawDisplayValue.

    pendingOperation notNil
        ifTrue: [
            lastOperand := currentNum.
            lastOperation := pendingOperation.
            expressionDesc := (self formatNumber: accumulator) , ' ' , 
                              (self symbolForSelector: pendingOperation) , ' ' , 
                              (self formatNumber: lastOperand).

            (pendingOperation = #/ and: [ lastOperand = 0 ])
                ifTrue: [ self signalError: 'Error: Div by Zero'. ^ self ].

            [
                result := accumulator perform: pendingOperation with: lastOperand.
                accumulator := result.
                displayValue := self formatNumber: result.
                self recordTape: expressionDesc result: displayValue.
                pendingOperation := nil.
            ] on: Error do: [ :ex |
                self signalError: 'Error: Math Fault'.
                ^ self ].
        ]
        ifFalse: [
            lastOperation notNil ifTrue: [
                "Repeated equals press applies the last operator and operand"
                expressionDesc := (self formatNumber: currentNum) , ' ' , 
                                  (self symbolForSelector: lastOperation) , ' ' , 
                                  (self formatNumber: lastOperand).
                [
                    result := currentNum perform: lastOperation with: lastOperand.
                    displayValue := self formatNumber: result.
                    self recordTape: expressionDesc result: displayValue.
                ] on: Error do: [ :ex |
                    self signalError: 'Error: Math Fault'.
                    ^ self ].
            ]
        ].

    enteringNewNumber := true.
    state := #evaluated.!
! !

!ShaeCalculatorEngine methodsFor: 'scientific operations'!

squareRoot
    "Calculate the square root of the display value."
    | val |
    hasError ifTrue: [ ^ self ].
    self saveStateForUndo.
    val := self rawDisplayValue.
    val < 0 ifTrue: [ self signalError: 'Error: Neg Sqrt'. ^ self ].
    self setDisplayNumber: val sqrt tapePrefix: 'sqrt'.!

square
    "Calculate display value squared (x^2)."
    | val |
    hasError ifTrue: [ ^ self ].
    self saveStateForUndo.
    val := self rawDisplayValue.
    self setDisplayNumber: (val * val) tapePrefix: 'sqr'.!

cube
    "Calculate display value cubed (x^3)."
    | val |
    hasError ifTrue: [ ^ self ].
    self saveStateForUndo.
    val := self rawDisplayValue.
    self setDisplayNumber: (val * val * val) tapePrefix: 'cube'.!

reciprocal
    "Calculate 1 / x."
    | val |
    hasError ifTrue: [ ^ self ].
    self saveStateForUndo.
    val := self rawDisplayValue.
    val = 0 ifTrue: [ self signalError: 'Error: Div by Zero'. ^ self ].
    self setDisplayNumber: (1.0 / val) tapePrefix: '1/'.!

factorial
    "Calculate n! for positive integers (n <= 170)."
    | n acc |
    hasError ifTrue: [ ^ self ].
    self saveStateForUndo.
    n := self rawDisplayValue.
    (n < 0 or: [ n isInteger not or: [ n > 170 ] ])
        ifTrue: [ self signalError: 'Error: Invalid Fact'. ^ self ].
    acc := 1.
    2 to: n do: [ :i | acc := acc * i ].
    self setDisplayNumber: acc tapePrefix: 'fact'.!

percentage
    "Convert display value to percentage of accumulator or 1/100."
    | val result |
    hasError ifTrue: [ ^ self ].
    self saveStateForUndo.
    val := self rawDisplayValue.
    result := (pendingOperation notNil and: [ accumulator ~= 0 ])
        ifTrue: [ accumulator * (val / 100.0) ]
        ifFalse: [ val / 100.0 ].
    self setDisplayNumber: result tapePrefix: '%'.!

sin
    | rad |
    hasError ifTrue: [ ^ self ].
    self saveStateForUndo.
    rad := self toRadians: self rawDisplayValue.
    self setDisplayNumber: rad sin tapePrefix: 'sin'.!

cos
    | rad |
    hasError ifTrue: [ ^ self ].
    self saveStateForUndo.
    rad := self toRadians: self rawDisplayValue.
    self setDisplayNumber: rad cos tapePrefix: 'cos'.!

tan
    | val rad cosVal |
    hasError ifTrue: [ ^ self ].
    self saveStateForUndo.
    val := self rawDisplayValue.
    rad := self toRadians: val.
    cosVal := rad cos.
    cosVal abs < 1.0e-12 ifTrue: [ self signalError: 'Error: Tan Undef'. ^ self ].
    self setDisplayNumber: rad tan tapePrefix: 'tan'.!

ln
    "Natural logarithm ln(x)."
    | val |
    hasError ifTrue: [ ^ self ].
    self saveStateForUndo.
    val := self rawDisplayValue.
    val <= 0 ifTrue: [ self signalError: 'Error: Invalid Log'. ^ self ].
    self setDisplayNumber: val ln tapePrefix: 'ln'.!

log10
    "Base-10 logarithm log10(x)."
    | val |
    hasError ifTrue: [ ^ self ].
    self saveStateForUndo.
    val := self rawDisplayValue.
    val <= 0 ifTrue: [ self signalError: 'Error: Invalid Log'. ^ self ].
    self setDisplayNumber: (val ln / 10.0 ln) tapePrefix: 'log10'.!

exp
    "e^x"
    | val |
    hasError ifTrue: [ ^ self ].
    self saveStateForUndo.
    val := self rawDisplayValue.
    self setDisplayNumber: (val exp) tapePrefix: 'exp'.!

inputPi
    "Set display to Pi constant."
    self saveStateForUndo.
    displayValue := (Float pi) asString.
    enteringNewNumber := true.!

inputE
    "Set display to Euler's number (e)."
    self saveStateForUndo.
    displayValue := (1.0 exp) asString.
    enteringNewNumber := true.!
! !

!ShaeCalculatorEngine methodsFor: 'memory operations'!

memoryStore
    "Store the current display value in the memory register (MS)."
    hasError ifTrue: [ ^ self ].
    memory := self rawDisplayValue.
    enteringNewNumber := true.!

memoryRecall
    "Recall stored value from memory to display (MR)."
    hasError ifTrue: [ ^ self ].
    self saveStateForUndo.
    displayValue := self formatNumber: memory.
    enteringNewNumber := true.!

memoryClear
    "Clear memory register to 0 (MC)."
    memory := 0.!

memoryAdd
    "Add current display value to memory (M+)."
    hasError ifTrue: [ ^ self ].
    memory := memory + self rawDisplayValue.
    enteringNewNumber := true.!

memorySubtract
    "Subtract current display value from memory (M-)."
    hasError ifTrue: [ ^ self ].
    memory := memory - self rawDisplayValue.
    enteringNewNumber := true.!
! !

!ShaeCalculatorEngine methodsFor: 'state and clear'!

clear
    "Full reset: wipe display, accumulator, pending operators, errors."
    self saveStateForUndo.
    displayValue := '0'.
    accumulator := 0.
    pendingOperation := nil.
    lastOperand := 0.
    lastOperation := nil.
    enteringNewNumber := true.
    hasError := false.
    errorMessage := ''.
    state := #cleared.!

clearEntry
    "Clear only the active input buffer (CE)."
    self saveStateForUndo.
    displayValue := '0'.
    enteringNewNumber := true.
    hasError := false.
    errorMessage := ''.!

signalError: aMessage
    hasError := true.
    errorMessage := aMessage.
    displayValue := aMessage.
    enteringNewNumber := true.!

clearHistory
    history removeAll.!
! !

!ShaeCalculatorEngine methodsFor: 'modes and formatting'!

setDegreeMode
    angleMode := #degree.!

setRadianMode
    angleMode := #radian.!

isDegreeMode
    ^ angleMode = #degree!

setBase: aBaseSymbol
    "Switch display mode: #dec, #hex, #bin, #oct."
    (#(dec hex bin oct) includes: aBaseSymbol) ifFalse: [ ^ self ].
    numberBase := aBaseSymbol.!

toRadians: anAngle
    angleMode = #degree
        ifTrue: [ ^ anAngle * (Float pi / 180.0) ]
        ifFalse: [ ^ anAngle ]!

formatNumber: aNumber
    "Format numeric result cleanly removing extraneous decimal zeroes."
    | rounded str |
    aNumber isInteger ifTrue: [ ^ aNumber asString ].
    rounded := aNumber roundTo: 1.0e-10.
    rounded isInteger ifTrue: [ ^ rounded asInteger asString ].
    str := rounded asString.
    ^ str!

setDisplayNumber: aNumber tapePrefix: aPrefix
    | origVal formatted |
    origVal := displayValue.
    formatted := self formatNumber: aNumber.
    displayValue := formatted.
    self recordTape: (aPrefix , '(' , origVal , ')') result: formatted.
    enteringNewNumber := true.!

recordTape: anExpression result: aResultString
    history add: (Dictionary new
        at: #timestamp put: (DateAndTime now printString);
        at: #expression put: anExpression;
        at: #result put: aResultString;
        yourself).!

symbolForSelector: aSelector
    aSelector = #+ ifTrue: [ ^ '+' ].
    aSelector = #- ifTrue: [ ^ '-' ].
    aSelector = #* ifTrue: [ ^ '*' ].
    aSelector = #/ ifTrue: [ ^ '/' ].
    aSelector = #\\ ifTrue: [ ^ '%' ].
    aSelector = #raisedTo: ifTrue: [ ^ '^' ].
    ^ aSelector asString!
! !

!ShaeCalculatorEngine methodsFor: 'undo redo'!

saveStateForUndo
    undoStack size >= 50 ifTrue: [ undoStack removeFirst ].
    undoStack add: (self captureMemento).
    redoStack removeAll.!

captureMemento
    ^ Dictionary new
        at: #displayValue put: displayValue;
        at: #accumulator put: accumulator;
        at: #pendingOperation put: pendingOperation;
        at: #lastOperand put: lastOperand;
        at: #lastOperation put: lastOperation;
        at: #memory put: memory;
        at: #enteringNewNumber put: enteringNewNumber;
        at: #hasError put: hasError;
        at: #errorMessage put: errorMessage;
        yourself!

restoreMemento: aMemento
    displayValue := aMemento at: #displayValue.
    accumulator := aMemento at: #accumulator.
    pendingOperation := aMemento at: #pendingOperation.
    lastOperand := aMemento at: #lastOperand.
    lastOperation := aMemento at: #lastOperation.
    memory := aMemento at: #memory.
    enteringNewNumber := aMemento at: #enteringNewNumber.
    hasError := aMemento at: #hasError.
    errorMessage := aMemento at: #errorMessage.!

undo
    undoStack isEmpty ifTrue: [ ^ self ].
    redoStack add: (self captureMemento).
    self restoreMemento: undoStack removeLast.!

redo
    redoStack isEmpty ifTrue: [ ^ self ].
    undoStack add: (self captureMemento).
    self restoreMemento: redoStack removeLast.!
! !

!ShaeCalculatorEngine methodsFor: 'expression evaluation'!

evaluate: anExpressionString
    "Evaluate an infix arithmetic string expression using the Shunting-Yard algorithm."
    | tokens rpn result |
    self saveStateForUndo.
    [
        tokens := self tokenize: anExpressionString.
        rpn := self shuntingYard: tokens.
        result := self evaluateRPN: rpn.
        displayValue := self formatNumber: result.
        self recordTape: anExpressionString result: displayValue.
        accumulator := result.
        pendingOperation := nil.
        enteringNewNumber := true.
        ^ result
    ] on: Error do: [ :ex |
        self signalError: 'Error: Syntax / Eval'.
        ^ nil ]!

tokenize: aString
    | stream tokens char buffer |
    stream := ReadStream on: aString.
    tokens := OrderedCollection new.
    buffer := String new.

    [ stream atEnd ] whileFalse: [
        char := stream next.
        (char isSeparator) ifFalse: [
            ('0123456789.' includes: char)
                ifTrue: [
                    buffer := buffer , (String with: char) ]
                ifFalse: [
                    buffer isEmpty ifFalse: [
                        tokens add: buffer.
                        buffer := String new ].
                    ('+-*/%^()' includes: char)
                        ifTrue: [ tokens add: (String with: char) ]
                        ifFalse: [
                            "Letter token for functions like sin, cos, sqrt"
                            char isLetter ifTrue: [
                                buffer := buffer , (String with: char) ] ] ] ] ].

    buffer isEmpty ifFalse: [ tokens add: buffer ].
    ^ tokens!

shuntingYard: tokens
    | output opStack token prec |
    output := OrderedCollection new.
    opStack := OrderedCollection new.

    tokens do: [ :t |
        (self isNumeric: t)
            ifTrue: [ output add: t asNumber ]
            ifFalse: [
                t = '(' ifTrue: [ opStack add: t ].
                t = ')' ifTrue: [
                    [ opStack notEmpty and: [ opStack last ~= '(' ] ]
                        whileTrue: [ output add: opStack removeLast ].
                    opStack notEmpty ifTrue: [ opStack removeLast ] ].
                ('+-*/%^' includesSubString: t) ifTrue: [
                    prec := self precedenceOf: t.
                    [ opStack notEmpty and: [ 
                        opStack last ~= '(' and: [ 
                            (self precedenceOf: opStack last) >= prec ] ] ]
                        whileTrue: [ output add: opStack removeLast ].
                    opStack add: t ] ] ].

    [ opStack notEmpty ] whileTrue: [
        output add: opStack removeLast ].
    ^ output!

isNumeric: aTokenString
    ^ [ aTokenString asNumber. true ] on: Error do: [ false ]!

precedenceOf: anOp
    anOp = '+' ifTrue: [ ^ 1 ].
    anOp = '-' ifTrue: [ ^ 1 ].
    anOp = '*' ifTrue: [ ^ 2 ].
    anOp = '/' ifTrue: [ ^ 2 ].
    anOp = '%' ifTrue: [ ^ 2 ].
    anOp = '^' ifTrue: [ ^ 3 ].
    ^ 0!

evaluateRPN: rpnQueue
    | stack a b |
    stack := OrderedCollection new.

    rpnQueue do: [ :token |
        token isNumber
            ifTrue: [ stack add: token ]
            ifFalse: [
                stack size < 2 ifTrue: [ self error: 'Malformed expression' ].
                b := stack removeLast.
                a := stack removeLast.
                token = '+' ifTrue: [ stack add: (a + b) ].
                token = '-' ifTrue: [ stack add: (a - b) ].
                token = '*' ifTrue: [ stack add: (a * b) ].
                token = '/' ifTrue: [
                    b = 0 ifTrue: [ self error: 'Division by zero' ].
                    stack add: (a / b asFloat) ].
                token = '%' ifTrue: [ stack add: (a \\ b) ].
                token = '^' ifTrue: [ stack add: (a raisedTo: b) ] ] ].

    stack size = 1 ifFalse: [ self error: 'Invalid expression state' ].
    ^ stack last!
!
