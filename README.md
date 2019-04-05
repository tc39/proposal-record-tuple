# Constant value types

ECMAScript proposal for constant and value types (also known as immutable types).

**Authors:** Robin Ricard (Bloomberg), Philipp Dunkel (Bloomberg)

**Champions:** TBD

**Stage:** 0

## Overview

The goal of this proposal is to introduce constant/immutable value types to JavaScript. Immutable data structures are very useful while writing programs in a functional programming style since they make comparing deep data structures fast and easy. They also introduce safety on what the value is and make concurrent programming easier.

As of today, a few libraries are actually implementing that concept such as [Immutable.js](https://immutable-js.github.io/immutable-js/) or [Immer](https://github.com/mweststrate/immer). However, the main influence to that proposal is [Bloomberg's constant.js](https://github.com/bloomberg/constant.js/) that forces data structures to be deeply constant.

Using libraries to handle those types has multiple issues: we have multiple ways of doing the same thing that do not interoperate with each other, the syntax is not as expressive as it could be if it was integrated in the language and finally, it can be very challenging for a type system to pick up what the library is doing.

2 JS Immutable data structures are going to be introduced:

- Const Object
- Const Array

On top of that, this proposal will give you the ability to define const classes.

Const structures will require to contain only const substructures and values such as `number`, `string`, `symbol`, const classes and [Temporal's Instant](https://github.com/tc39/proposal-temporal).

## Motivations

Immutable data structures present the opportunity for implementers to add structural sharing, making operations such as concatenation `O(log n)` instead of `O(n)` and reducing memory footprint for heavily derived data structures.

Thanks to deep immutability, we have guarantees that comparing only the roots will be enough to define equality, this could be extremely useful to write performant components in a library such as React where optimizing performance for components with deep data structures as input can be complex and error-prone. Using this kind of data structure could enable doing a shallow comparison of props to define if the component needs to re-render.

Finally, using immutable datastructures encourages a safer style of programming where all manipulated values are known to be guaranteed during the lifecycle of an application, this would make multi-threaded programming easier as shared values would be guaranteed to be constant.

## Syntax

You can declare a new const data structure using `@const` before an object or array expresssion, for instance:

- `@const {}` is the empty const object expression
- `@const []` is the empty const array expression

In order to return a derived const data structure expression, you will need to use the `with` keyword and pass a mutating operation on an attribute of the structure, for instance:

- `@const [] with .push(1), .push(2)` will be equal to `@const [1, 2]`
- `@const {} with .a = 1, .b = 2` will be equal to `@const { a: 1, b: 2 }`

You can also use mutating operations on the const structure directly for it to return the derived const structure:

- `(@const []).push(1).push(2)` will be equal to `@const [1, 2]`
- `(@const [1, 2]).pop().pop()` will be equal to `@const []`

This means that `.pop()` or `.shift()` will return the new array instead of the extracted value, in order to extract the value, we're going to introduce `.last()` and `.first()` on the const array.

Finally, `with` lets you manipulate your const data structures deeply, you can go to as many levels as you need to change things, for instance:

- `@const [ {} ] with .0.a = 1` will be equal to `@const [ { a: 1 } ]`
- `@const { arr: [] } with .arr.push(0)` will be equal to `@const { arr: [0] }`

Computed access is also supported by using brackets instead of the dot notation:

- `@const [ {} ] with [0].a = 1` will be equal to `@const [ { a: 1 } ]`
- `x = 0, @const [ {} ] with [x].a = 1` will be equal to `@const [ { a: 1 } ]`

## Immutable prototype chain and classes

Since const objects can only contain other const values, the prototype chain will be const as well.

- Const objects have `null` prototypes, there are no built-in functions to operate on them. You will however be able to use `Object.` functions on them such as `Object.keys(@const { a: 1, b: 2}) === @const ["a", "b"]`
- Const arrays have a const object prototype that takes the same functions as an array prototype but also adds `.last()` and `.first()` and changes the behavior of `.pop()` and `.shift()`.

Since prototypes can be manipulated classes are the same, they can be const themselves and the object that they instantiate will end up being const:

- `(@const class {})` is a const object
- `new (@const class {})()` is a const object

Since the classes are now immutable and any of their instances will be as well, using `new` on them will not make sense, so we need to make the constructor callable, we can use the `@call` decorator to do that.

`@const` can now be used to create a value defined by the given class: `@const(MyClass)(constrArg1, constrArg2) with .publicField = value`.

No method of that class can actually mutate `this` but can take `this` and return it modified.

## Examples

Simple map:

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

Simple array:

```js
const array1 = @const [1, 2, 3];

const array2 = array1 with .0 = 2;

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
    with .0.lastPrice = 195.891,
         .1.lastPrice = 286.61;

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
immutableContainer with .instance = new MyClass();
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
    @call constructor(ticker, lastPrice) {
        return @const(Tick)
            with .name = ticker,
                 .#ticker = ticker;
        }
        // The constructor and field initializers are the only places where you can do "free" assignments
        this.name = ticker;
        this.#ticker = ticker;
        if (lastPrice) {
            this.#lastPrice = lastPrice;
        }
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

let aaplTick = new Tick("AAPL", 195.855);
aaplTick = aaplTick.withNewPrice(195.891);
aaplTick = aaplTick with .name = "Apple";
aaplTick.toString();
/*
Apple (Ticker: AAPL): $195.891

History:
- $195.855
*/
```

## FAQ

### Relation to the [decorator propsal](https://github.com/tc39/proposal-decorators)

`@const` is not a decorator and can't be used to create a new decorator declaration.

`@call` is a necessary decorator to make the constructor callable.

### Are there any follow up proposals being considered?

As this proposal adds a new concept to the language, we expect that other proposals might use this proposal to extend an another orthogonal feature.

We consider exploring the following proposals once this one gets considered for higher stages:

- ConstSet and ConstMap, the const versions of [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) and [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- There is some intersection with the [Temporal Proposal](https://github.com/tc39/proposal-temporal) which might be able to express its types using const classes