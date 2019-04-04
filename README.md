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

Const structures will require to contain const substructures and values such as `number`, `string`, `symbol` and [Temporal's Instant](https://github.com/tc39/proposal-temporal)

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

const aaplTick1 = new Tick("AAPL", 195.855);
const aaplTick2 = aaplTick1.withNewPrice(195.891);
const appleTick2 = aaplTick2 with name = "Apple";
appleTick2.toString();
/*
Apple (Ticker: AAPL): $195.891

History:
- $195.855
*/
```
