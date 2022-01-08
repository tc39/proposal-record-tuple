# Constant Value Types

ECMAScript proposal for constant and value types (also known as immutable types).

**Authors:** Robin Ricard (Bloomberg), Philipp Dunkel (Bloomberg)

**Champions:** TBD

**Stage:** 0

## Overview

The goal of this proposal is to introduce constant/immutable value types to JavaScript. It has multiple objectives:

- Introducing efficient data structures that makes copying and changing them cheap and will allow programs avoiding mutation of data to run faster (pattern heavily used in Redux for instance).
- Add guarantees in strict equality when comparing data. This is only possible because those data structures are deeply constant (comparing props fast is essential for efficient virtual dom reconciliation in React apps for instance)
- Be easily understood by external typesystem supersets such as TypeScript or Flow.
- Remove the need for structured cloning while sending messages to web workers since values are deeply const and immutable.

This proposal presents 3 main additions to the language:

- Const Objects
- Const Arrays
- Const Classes

Once you create one of those structures, the only accepted sub-structures will only be one of those const structures and normal value types such as `number`, `string`, `symbol` or `null`.

### Prior work on immutable data structures in JavaScript

As of today, a few libraries are actually implementing similar concepts such as [Immutable.js](https://immutable-js.github.io/immutable-js/) or [Immer](https://github.com/mweststrate/immer). However, the main influence to that proposal is [constant.js](https://github.com/bloomberg/constant.js/) that forces data structures to be deeply constant.

Using libraries to handle those types has multiple issues: we have multiple ways of doing the same thing that do not interoperate with each other, the syntax is not as expressive as it could be if it was integrated in the language and finally, it can be very challenging for a type system to pick up what the library is doing.

## Examples

#### Simple map

```js
const map1 = @const {
    a: 1,
    b: 2,
    c: 3,
};

const map2 = map1 with .b = 5;

assert(map1 !== map2);
assert(map2 === @const { a: 1, b: 5, c: 3});
```

#### Simple array

```js
const array1 = @const [1, 2, 3];

const array2 = array1 with .[0] = 2;

assert(array1 !== array2);
assert(array1 === @const [2, 2, 3]);
```

#### Computed access

```js
const map = @const { a: 1, b: 2, c: 3 };
const array = @const [1, 2, 3];

const k = "b";
const i = 0;

assert((map with .[k] = 5) === @const { a: 1, b: 5, c: 3});
assert((array with .[i] = 2) === @const [2, 2, 3]);
```

#### Nested structures

```js
const marketData = @const [
    { ticker: "AAPL", lastPrice: 195.855 },
    { ticker: "SPY", lastPrice: 286.53 },
];

const updatedData = marketData
    with .[0].lastPrice = 195.891,
         .[1].lastPrice = 286.61;

assert(updatedData === @const [
    { ticker: "AAPL", lastPrice: 195.891 },
    { ticker: "SPY", lastPrice: 286.61 },
]);
```

#### Forbidden cases

```js
const instance = new MyClass();
const immutableContainer = @const {
    instance: instance
};
// TypeError: Can't use a non-immutable type in an immutable declaration

const immutableContainer = @const {
    instance: null,
};
immutableContainer with .instance = new MyClass();
// TypeError: Can't use a non-immutable type in an immutable operation

const array = @const [1, 2, 3];

array.map(x => new MyClass(x));
// TypeError: Can't use a non-immutable type in an immutable operation

// The following should work:
Array.from(array).map(x => new MyClass(x))
```

#### Defining a const class

```js
@const
class Tick {
    #ticker;
    #lastPrice = Math.random();
    #priceHistory = [];
    name;
    @call constructor(ticker, lastPrice) {
        const base = @const Tick {
            name: ticker,
            #ticker: ticker,
        };
        if (lastPrice) {
            return base with .#lastPrice = lastPrice;
        }
        return base;
    }

    withNewPrice(price) {
        return this
            with .#priceHistory.push(this.#lastPrice),
                 .#lastPrice = price;
    }

    toString() {
        const history = this.#priceHistory.map(price => `- $${price}`).join("\n");
        return `${this.name} (Ticker: ${this.#ticker}): $${this.#lastPrice}\n\nHistory:\n${history}`;
    }
}

let aaplTick = @const Tick("AAPL", 195.855);
aaplTick = aaplTick.withNewPrice(195.891);
aaplTick = aaplTick with .name = "Apple";
aaplTick.toString();
/*
Apple (Ticker: AAPL): $195.891

History:
- $195.855
*/
```

#### More assertions

```js
assert(@const [] with .push(1), .push(2) === @const [1, 2]);
assert((@const {} with .a = 1, .b = 2) === @const { a: 1, b: 2 });
assert((@const []).push(1).push(2) === @const [1, 2]);
assert((@const [1, 2]).pop().pop() === @const []);
assert((@const [ {} ] with .[0].a = 1) === @const [ { a: 1 } ]);
assert((x = 0, @const [ {} ] with [x].a = 1) === @const [ { a: 1 } ]);
```

## Syntax

This defines the new pieces of syntax being added to the language with this proposal.

### Const expressions and declarations

We define _ConstExpression_, _ConstClassExpression_ and _ConstClassDeclaration_ by using the `@const` modifier in front of otherwise normal expressions and declarations.

_ConstExpression_:

> `@const` _ObjectExpression_

> `@const` _ArrayExpression_

> `@const` _CallExpression_

> `@const` _Identifier_ _ObjectExpression_

> `@const` _CallExpression_ _ObjectExpression_

_ConstClassExpression_:

> `@const` _ClassExpression_

_ConstClassDeclaration_:

> `@const` _ClassDeclaration_

#### Examples

```js
@const {}
@const { a: 1, b: 2 }
@const { a: 1, b: [2, 3, { c: 4 }] }
@const []
@const [1, 2]
@const [1, 2, { a: 3 }]
@const MyConstClass(1)
@const MyConstClass(1) { b = 2 }
@const MyConstClass { b = 2 }
@const class MyConstClass {
    #a;
    b = Math.random();
    @call constructor(a) {
        return @const MyConstClass { #a: a };
    }
}
```

#### Runtime verification

At runtime, if a non-const data structure is passed in a const expression, it is a Type Error. That means that the object or array expressions can't contain a Reference Type or call a function that returns a Reference Type. Same goes for the call expression that has to return a Value Type. Calling a const class is considered as returning a value type.

### Const update expression

_ConstAssignment_:

> `.`_Identifier_ `=` _Expression_

> `.`_Literal_ `=` _Expression_

> `.`_MemberExpression_ `=` _Expression_

_ConstCall_:

> `.`_CallExpression_

_ConstUpdatePart_:

> _ConstAssignment_

> _ConstCall_

> _ConstUpdatePart_`,` _ConstUpdatePart_

_ConstUpdateExpression_:

> _Identifier_ `with` _ConstUpdatePart_

#### Examples

```js
constObj with .a = 1
constObj with .a = 1, .b = 2
constArr with .push(1), .push(2)
constArr with .[0] = 1
constObj with .a.b = 1
constObj with .["a"]["b"] = 1
constObj with .arr.push(1)
```

#### Runtime verification

The same runtime verification will apply. It is a Type Error when a const type gets updated with a reference type in it.

## Prototypes

### Const object prototype

In order to keep this new structure as simple as possible, the const object prototype is `null`. The `Object` namespace and the `in` should however be able to work with const objects and return const values. For instance:

```js
assert(Object.keys(@const { a: 1, b: 2 }) === @const ["a", "b"]);
assert("a" in @const { a: 1, b: 2 });
```

### Const array prototype

The const array prototype is a const object that contains the same methods as Array with a few changes:

- `ConstArray.prototype.pop()` and `ConstArray.prototype.shift()` do not return the removed element, they return the result of the change
- `ConstArray.prototype.first()` and `ConstArray.prototype.last()` are added to return the first and last element of the const array

## Const classes

Const classes are mostly constant struct types with the possibility to attach methods to them.

None of the methods in a const class can mutate `this`, a method can however derive a new value of `this` with `with` and return it.

Const classes can't be extended or extend something. The syntax to do such thing is still unclear and might appear in a followup proposal.

## FAQ

### `const` vs `@const` ?

`const` variable declarations and `@const` value types are completely orthogonal features.

`const` variable declarations force the reference or value type to stay constant for a given identifier in a given lexical scope.

`@const` value types makes the value deeply constant and unchangeable.

Using both at the same time is possible, but using a non-const variable declaration is also possible:

```js
const obj = @const { a: 1, b: 2 };
let obj2 = obj with .c = 3;
obj2 = obj2 with .a = 3, .b = 3;
```

### Const equality vs normal equality

```js
assert(@const { a: 1 } === @const { a: 1 });
assert(Object(@const { a: 1 }) !== Object(@const { a: 1 }));
assert({ a: 1 } !== { a: 1 });
```

Since we established that value types are completely and deeply constant, if they have the same values stored, they will be considered strictly equal.

It is not the case with normal objects, those objects are instantiated in memory and strict comparison will see that both objects are located at different addresses, they are not strictly equal.

### Relation to the [Decorator Proposal](https://github.com/tc39/proposal-decorators)

`@const` is not a decorator and can't be used to create a new decorator declaration.

`@call` is a necessary decorator to make the constructor callable.

### Are there any follow up proposals being considered?

As this proposal adds a new concept to the language, we expect that other proposals might use this proposal to extend an another orthogonal feature.

We consider exploring the following proposals once this one gets considered for higher stages:

- ConstSet and ConstMap, the const versions of [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) and [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- There is some intersection with the [Temporal Proposal](https://github.com/tc39/proposal-temporal) which might be able to express its types using const classes
- As said before, we might want to handle const class inheritance in a followup proposal

## Glossary

#### Immutable Data Structure

A Data Structure that doesn't accept operations that change it internally, it has operations that return a new value type that is the result of applying that operation on it.

In this proposal `@const object`, `@const array` and `@const class` are immutable data structures.

#### Strict Equality

In this proposal we define strict equality as it is broadly defined in JavaScript. The operator `===` is a strict equality operator.

#### Structural Sharing

Structural sharing is a technique used to limit the memory footprint of immutable data structures. In a nutshell, when applying an operation to derive a new version of an immutable structure, structural sharing will attempt to keep most of the internal structure instinct and used by both the old and derived versions of that structure. This greatly limits the amount to copy to derive the new structure.

#### Value type

In this proposal it defines any of those: `boolean`, `number`, `symbol`, `undefined`, `null`, `@const object`, `@const array` and `@const class`.

Value types can only contain other value types: because of that, two value types with the same contents are strictly equal.
