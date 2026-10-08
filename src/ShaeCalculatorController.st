"========================================================================
  SHAE Smalltalk GUI Calculator — MVC Controller & Event Dispatcher
  Dialect: Smalltalk-80 / Cuis / Squeak / Pharo
  Copyright (c) 2026 spdedsec <legendsatya7272@gmail.com>
  License: MIT
========================================================================"

Object subclass: #ShaeCalculatorController
    instanceVariableNames: 'model view keyboardBindings'
    classVariableNames: ''
    poolDictionaries: ''
    category: 'Shae-Calculator-GUI'!

!ShaeCalculatorController class methodsFor: 'instance creation'!

on: aModel
    ^ self new setModel: aModel!

on: aModel view: aView
    ^ self new setModel: aModel; setView: aView; yourself!
!

!ShaeCalculatorController methodsFor: 'initialization'!

initialize
    super initialize.
    self setupKeyboardBindings.!

setModel: aModel
    model := aModel.!

setView: aView
    view := aView.!

setupKeyboardBindings
    keyboardBindings := Dictionary new.
    $0 to: $9 do: [ :c | keyboardBindings at: c put: [ model inputDigit: c ] ].
    keyboardBindings at: $. put: [ model inputDecimalPoint ].
    keyboardBindings at: $+ put: [ model add ].
    keyboardBindings at: $- put: [ model subtract ].
    keyboardBindings at: $* put: [ model multiply ].
    keyboardBindings at: $/ put: [ model divide ].
    keyboardBindings at: $= put: [ model equals ].
    keyboardBindings at: Character cr put: [ model equals ].
    keyboardBindings at: Character backspace put: [ model backspace ].
    keyboardBindings at: Character escape put: [ model clear ].
    keyboardBindings at: $% put: [ model percentage ].
    keyboardBindings at: $^ put: [ model power ].!
!

!ShaeCalculatorController methodsFor: 'event handling'!

handleKeystroke: anEvent
    | char action |
    char := anEvent keyCharacter.
    action := keyboardBindings at: char ifAbsent: [ nil ].
    action ifNotNil: [
        action value.
        view ifNotNil: [ view update: #keystroke ] ].!

handleAction: aString
    "Route button labels and commands to corresponding model methods."
    ('0123456789' includesSubstring: aString) ifTrue: [
        model inputDigit: aString. ^ self ].

    aString = '.' ifTrue: [ model inputDecimalPoint. ^ self ].
    aString = '+/-' ifTrue: [ model inputSignToggle. ^ self ].
    aString = '+' ifTrue: [ model add. ^ self ].
    aString = '-' ifTrue: [ model subtract. ^ self ].
    aString = '*' ifTrue: [ model multiply. ^ self ].
    aString = '/' ifTrue: [ model divide. ^ self ].
    aString = '%' ifTrue: [ model percentage. ^ self ].
    aString = '^' ifTrue: [ model power. ^ self ].
    aString = 'sqrt' ifTrue: [ model squareRoot. ^ self ].
    aString = 'sqr' ifTrue: [ model square. ^ self ].
    aString = '1/x' ifTrue: [ model reciprocal. ^ self ].
    aString = 'fact' ifTrue: [ model factorial. ^ self ].
    aString = 'sin' ifTrue: [ model sin. ^ self ].
    aString = 'cos' ifTrue: [ model cos. ^ self ].
    aString = 'tan' ifTrue: [ model tan. ^ self ].
    aString = 'ln' ifTrue: [ model ln. ^ self ].
    aString = 'log' ifTrue: [ model log10. ^ self ].
    aString = 'pi' ifTrue: [ model inputPi. ^ self ].
    aString = 'e' ifTrue: [ model inputE. ^ self ].
    aString = '=' ifTrue: [ model equals. ^ self ].
    aString = 'C' ifTrue: [ model clear. ^ self ].
    aString = 'CE' ifTrue: [ model clearEntry. ^ self ].
    aString = 'Bk' ifTrue: [ model backspace. ^ self ].
    aString = 'MC' ifTrue: [ model memoryClear. ^ self ].
    aString = 'MR' ifTrue: [ model memoryRecall. ^ self ].
    aString = 'M+' ifTrue: [ model memoryAdd. ^ self ].
    aString = 'M-' ifTrue: [ model memorySubtract. ^ self ].
    aString = 'MS' ifTrue: [ model memoryStore. ^ self ].
    aString = 'Undo' ifTrue: [ model undo. ^ self ].
    aString = 'Redo' ifTrue: [ model redo. ^ self ].
!
