# Constant Value Types type system strategy

This document describes with an high-level view how a type system implementer could implement those proposals.

## Parser

The type system should be able to assimilate the grammar described in the main proposal document to be available in the type system's AST:

- _ConstExpression_
- _ConstClassExpression_
- _ConstClassDeclaration_
- _ConstAssignment_
- _ConstCall_
- _ConstUpdatePart_
- _ConstUpdateExpresion_

## TBD

(I do not have suffient knowledge about how a JS type system works to be useful here, contributions are welcome!)
