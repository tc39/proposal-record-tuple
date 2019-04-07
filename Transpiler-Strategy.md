# Constant Value Types transpiler strategy

This document describes with an high-level view how a transpiler implementer could implement those proposals.

## Parser

The transpiler should be able to assimilate the grammar described in the main proposal document to be available in the transpiler's AST:

- _ConstExpression_
- _ConstClassExpression_
- _ConstClassDeclaration_
- _ConstAssignment_
- _ConstCall_
- _ConstUpdatePart_
- _ConstUpdateExpresion_

## Helpers

The helpers that are going to be called by the transforms should implement a full immutable data structure manipulation library and make sure that none of the deeply constant rules are violated.

[constant.js](https://github.com/bloomberg/constant.js/) looks promising as such library.

## Transforms

The new added AST Node Types should be translatable to helper calls:

- _ConstExpression_ should be able to be converted to a call to a constant object or array creation helper
- _ConstClassExpression_ and _ConstClassDeclaration_ should be able to be converted to a _ClassExpression_ or _ClassDeclaration_ extending an helper `ConstClass`
- _ConstUpdateExpresion_ should be translated to a series of function calls to a mutate helper.

## Loose/Strict mode

The strict mode should perform const checks as much as it can while the loose mode should not do any of them.
