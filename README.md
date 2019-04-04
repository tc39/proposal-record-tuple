# Immutable types

ECMAScript proposal and reference implementation for Immutable types.

**Author:** Robin Ricard (Bloomberg)

**Champion:** Philipp Dunkel (Bloomberg)

**Stage:** 0

## Overview and motivation

The goal of this proposal is to introduce immutable data structures to JavaScript. Immutable data structures are very useful while writing programs in a functional programming style since they make comparing deep data structures fast and easy. They also introduce safety on what the value is and make concurrent programming easier.

As of today, a few libraries are actually implementing that concept such as [Immutable.js](https://immutable-js.github.io/immutable-js/) or [Immer](https://github.com/mweststrate/immer). However, those libraries are lacking the ability to use language idioms to express operations on those data structures.

2 JS Immutable data structures are going to be introduced:

- Const Object
- Const Array

On top of that, this proposal will give you the ability to define const classes.

Const structures will require to contain only const substructures and values such as `number`, `string`, `symbol` and [Temporal's Instant](https://github.com/tc39/proposal-temporal).

## Syntax

You can declare a new const data structure using `@const` before an object or array expresssion, for instance:

- `@const {}` is the empty const object expression
- `@const []` is the empty const array expression

In order to return a derived const data structure expression, you will need to use the `with` keyword and pass a mutating operation on an attribute of the structure, for instance:

- `@const [] with push(1) with push(2)` will be equal to `@const [1, 2]`
- `@const {} with a = 1 with b = 2` will be equal to `@const { a: 1, b: 2 }`

You can also use mutating operations on the const structure directly for it to return the derived const structure:

- `(@const []).push(1).push(2)` will be equal to `@const [1, 2]`
- `(@const [1, 2]).pop().pop()` will be equal to `@const []`

This means that `.pop()` or `.shift()` will return the new array instead of the extracted value, in order to extract the value, we're going to introduce `.last()` and `.first()` on the const array.

## Immutable prototype chain and classes

Since const objects can only contain other const values, the prototype chain will be const as well.

- `(@const {}).__proto__` is a const object with keys such as `__defineGetter__`, `hasOwnProperty`, `toString` etc...
- `(@const []).__proto__` is a const object with keys such as `map`, `push`, etc...

Since prototypes can be manipulated classes are the same, they can be const themselves and the object that they instantiate will end up being const:

- `(@const class {})` is a const object
- `new (@const class {})()` is a const object

One thing is important here, the constructor and the class field initializers can assume that the fields are mutable.

## Examples

Simple map:

```js
const map1 = @const {
    a: 1,
    b: 2,
    c: 3,
};

const map2 = map1 with b = 5;

assert(map1 !== map2);
assert(map2 === @const { a: 1, b: 5, c: 3});
```

Simple array:

```js
const array1 = @const [1, 2, 3];

const array2 = array1 with 0 = 2;

assert(array1 !== array2);
assert(array1 === @const [2, 2, 3]);
```

Computed access:

```js
const map = @const { a: 1, b: 2, c: 3 };
const array = @const [1, 2, 3];

const k = "b";
const i = 0;

assert((map with [k] = 5) === @const { a: 1, b: 5, c: 3});
assert((array with [i] = 2) === @const [2, 2, 3]);
```

Nested structures:

```js
const marketData = @const [
    { ticker: "AAPL", lastPrice: 195.855 },
    { ticker: "SPY", lastPrice: 286.53 },
];

const updatedData = marketData
    with 0.lastPrice = 195.891
    with 1.lastPrice = 286.61;

assert(updatedData === @const [
    { ticker: "AAPL", lastPrice: 195.891 },
    { ticker: "SPY", lastPrice: 286.61 },
]);
```

Forbidden cases:

```js
const instance = new MyClass();
const immutableContainer = @const {
    instance: instance
};
// TypeError: Can't use a non-immutable type in an immutable declaration

const immutableContainer = @const {
    instance: null,
};
immutableContainer with instance = new MyClass();
// TypeError: Can't use a non-immutable type in an immutable operation

const array = @const [1, 2, 3];

array.map(x => new MyClass(x));
// TypeError: Can't use a non-immutable type in an immutable operation

// The following should work:
Array.from(array).map(x => new MyClass(x))
```

Handle mutable references:

```js
const map = new WeakMap();
const reference = @const { uniqueTag: Symbol() };
map.set(reference, new MyClass());
```

Defining a const class

```js
@const
class Tick {
    #ticker;
    #lastPrice = Math.random();
    #priceHistory = [];
    name;
    constructor(ticker, lastPrice) {
        // The constructor and field initializers are the only places where you can do "free" assignments
        this.name = ticker;
        this.#ticker = ticker;
        if (lastPrice) {
            this.#lastPrice = lastPrice;
        }
    }

    withNewPrice(price) {
        return this
            with #priceHistory.push(this.#lastPrice)
            with #lastPrice = price;
    }

    toString() {
        const history = this.#priceHistory.map(price => `- $${price}`).join("\n");
        return `${this.name} (Ticker: ${this.#ticker}): $${this.#lastPrice}\n\nHistory:\n${history}`;
    }
}

let aaplTick = new Tick("AAPL", 195.855);
aaplTick = aaplTick.withNewPrice(195.891);
aaplTick = aaplTick with name = "Apple";
aaplTick.toString();
/*
Apple (Ticker: AAPL): $195.891

History:
- $195.855
*/
```

Prototype chain changes:

```js
const aapl = @const {
    ticker: "AAPL",
    price: 195.855,
    __proto__: {
        tick() {
            return this with price = 195.891;
        }
    }
};

const aapl2 = aapl.tick();

const aapl3 = with __proto__.tick = function() {
    return this with price = 200;
};

const aapl4 = aapl3.tick();

assert(aapl.__proto__ !== aapl3.__proto__);
assert(aapl3.__proto__ === aapl4.__proto__);
```
