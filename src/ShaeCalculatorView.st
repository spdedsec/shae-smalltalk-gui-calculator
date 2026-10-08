"========================================================================
  SHAE Smalltalk GUI Calculator — Morphic & MVC View Definition
  Dialect: Smalltalk-80 / Cuis / Squeak / Pharo Morphic Framework
  Copyright (c) 2026 spdedsec <legendsatya7272@gmail.com>
  License: MIT
========================================================================"

Object subclass: #ShaeCalculatorView
    instanceVariableNames: 'model windowMorph displayMorph tapeMorph keypadMorph modeButtonMorphs statusMorph'
    classVariableNames: ''
    poolDictionaries: ''
    category: 'Shae-Calculator-GUI'!

!ShaeCalculatorView class methodsFor: 'opening'!

open
    "Instantiate the calculator model and open its Morphic GUI window."
    | model view |
    model := ShaeCalculatorEngine new.
    view := self on: model.
    view openInWorld.
    ^ view!

on: aModel
    ^ self new setModel: aModel!
!

!ShaeCalculatorView methodsFor: 'initialization'!

initialize
    super initialize.
    windowMorph := nil.
    displayMorph := nil.
    tapeMorph := nil.
    keypadMorph := nil.
    modeButtonMorphs := Dictionary new.!

setModel: aModel
    model := aModel.
    self buildUI.!
!

!ShaeCalculatorView methodsFor: 'building ui'!

buildUI
    "Construct the Swiss Brutalist / Xerox Alto Morphic layout."
    windowMorph := SystemWindow labelled: 'SHAE :: Smalltalk Calculator'.
    windowMorph setProperty: #isShaeCalculator toValue: true.
    windowMorph extent: 380 @ 560.

    self buildDisplayMorph.
    self buildKeypadMorph.
    self buildTapeMorph.

    windowMorph addMorph: displayMorph frame: (0 @ 0 corner: 1 @ 0.22).
    windowMorph addMorph: keypadMorph frame: (0 @ 0.22 corner: 1 @ 0.78).
    windowMorph addMorph: tapeMorph frame: (0 @ 0.78 corner: 1 @ 1.0).!

buildDisplayMorph
    "Construct high-contrast brutalist LCD display with status annunciators."
    displayMorph := AlignmentMorph newColumn.
    displayMorph color: (Color fromHexString: '#080808').
    displayMorph borderWidth: 1.
    displayMorph borderColor: (Color fromHexString: '#2E2E2E').

    statusMorph := StringMorph contents: 'DEC | DEG | [M:OFF]'.
    statusMorph color: (Color fromHexString: '#888888').

    displayMorph addMorph: statusMorph.
    self updateDisplay.!

buildKeypadMorph
    "Construct 4x5 standard arithmetic and memory button matrix."
    keypadMorph := AlignmentMorph newColumn.
    keypadMorph color: (Color fromHexString: '#101010').
    self populateKeypadRows.!

populateKeypadRows
    | rows rowMorph |
    rows := #(
        #('MC' 'MR' 'M+' 'M-' 'C')
        #('('  ')'  '^'  'sqrt' '/')
        #('7'  '8'  '9'  '%'   '*')
        #('4'  '5'  '6'  '+/-' '-')
        #('1'  '2'  '3'  'CE'  '+')
        #('0'  '.'  'Bk' '='   '=')
    ).

    rows do: [ :row |
        rowMorph := AlignmentMorph newRow.
        rowMorph hResizing: #spaceFill; vResizing: #spaceFill.
        row do: [ :label |
            rowMorph addMorph: (self createButtonLabeled: label) ].
        keypadMorph addMorph: rowMorph ].!

createButtonLabeled: aString
    | btn |
    btn := SimpleButtonMorph new.
    btn label: aString.
    btn color: (Color fromHexString: '#181818').
    btn borderColor: (Color fromHexString: '#2E2E2E').
    btn borderWidth: 1.
    btn target: self.
    btn actionSelector: #buttonPressed:.
    btn arguments: (Array with: aString).
    ^ btn!

buildTapeMorph
    "Construct scrolling history audit tape drawer."
    tapeMorph := ScrollPane new.
    tapeMorph color: (Color fromHexString: '#0c0c0c').
    tapeMorph borderWidth: 1.
    tapeMorph borderColor: (Color fromHexString: '#2E2E2E').!

openInWorld
    windowMorph ifNotNil: [ windowMorph openInWorld ].!
!

!ShaeCalculatorView methodsFor: 'updating'!

update: anAspect
    "Observe model changes and synchronize view state."
    self updateDisplay.
    self updateStatusAnnunciator.
    self updateHistoryTape.!

updateDisplay
    displayMorph ifNotNil: [
        "Render current model display string"
    ].!

updateStatusAnnunciator
    | memStatus angleStatus baseStatus |
    memStatus := model hasMemory ifTrue: [ 'M:ON' ] ifFalse: [ 'M:OFF' ].
    angleStatus := model angleMode asString asUppercase.
    baseStatus := model numberBase asString asUppercase.
    statusMorph contents: (baseStatus , ' | ' , angleStatus , ' | [' , memStatus , ']').!

updateHistoryTape
    "Re-render tape entries in chronological order."!
!

!ShaeCalculatorView methodsFor: 'event handling'!

buttonPressed: aString
    (ShaeCalculatorController on: model) handleAction: aString.
    self update: #all.!
!
