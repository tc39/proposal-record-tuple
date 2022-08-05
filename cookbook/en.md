# Record & Tuple Cookbook

> **🚧 Work in progress 🚧**: this document is a work in progress. The format and writing-style of the document will change as well as the examples. Please do not take the examples as a sign of best practice.

A series of bite-sized examples of things you can do with the [Record & Tuple ECMAScript proposal][rt].

If you are unsure what this is all about, make sure you check out the [tutorial] first!

[rt]: https://github.com/tc39/proposal-record-tuple
[tutorial]: ../tutorial/index.html

---

## Convert from Arrays/Objects to Tuples/Records with spread

```js
const coordinate = [0,3];
const fixedCoordinate = #[...coordinate];
console.log(fixedCoordinate === #[0,3]); // true
```


```js
const user = { name: "danny", admin: true };
const fixedUser = #{...user};
console.log(fixedUser === #{ name: "danny", admin: true }); // true
```

### Recursive conversion

```js
function recursiveRT(thing, maxDepth = 10) {
    if (typeof thing !== "object") {
        return thing;
    }
    if (maxDepth === 0) {
        return null;
    }
    if (Array.isArray(thing)) {
        return #[...thing.map(x => recursiveRT(x, maxDepth - 1))];
    }
    return #{...Object.entries(thing).reduce((o, [k, v]) => {
        o[k] = recursiveRT(v, maxDepth - 1);
        return o;
    }, {})};
}

const user = { name: "danny", stats: {
    avg: 42,
    scores: [40, 42, 44],
} };
const fixedUser = recursiveRT(user);
console.log(fixedUser === #{ name: "danny", stats: #{
    avg: 42,
    scores: #[40, 42, 44],
} }); // true
```

## Destructuring Record & Tuple using standard destructuring

```js
const [head, ...rest] = #[1, 2, 3];
console.log(head); // 1
console.log(rest); // Array [2, 3]
console.log(#[...rest]); // Tuple #[2, 3]
```

```js
const {name, ...rest} = #{ name: "danny", admin: true, score: 42 };
console.log(name); // danny
console.log(rest); // Object { admin: true, score: 42 }
console.log(#{...rest}); // Record #{ admin: true, score: 42 }
```

## Concatenate Tuples with spread

```js
const tup1 = #[1, 2];
const tup2 = #[3, 4];
const megaTup = #[...tup1, ...tup2];
console.log(megaTup === #[1, 2, 3, 4]); // true
```

## Create a new Record with some values changed using spread

```js
const user = #{ name: "danny", admin: false, score: 42 };
const admin = #{ ...user, admin: true };
console.log(admin === #{ name: "danny", admin: true, score: 42 });
```

## Property access in records

```js
const user = #{ name: "danny", admin: false, score: 42 };

console.log(user.name); // danny
console.log(user["score"]); // 42
```

## Record & Tuple as Set values

```js
const set = new Set([
    #{ x: 0, y: 0 },
    #[1, 1],
]);

console.log(set.has(#{ x: 0, y: 0 })); // true
console.log(set.has(#{ x: 1, y: 1 })); // false
console.log(set.has(#[0, 0])); // false
console.log(set.has(#[1, 1])); // true
```

## Record & Tuple as Map keys

```js
const map = new Map([
    [#{ x: 0, y: 0 }, "origin"],
    [#{ x: 1, y: 1 }, "norm"],
    [#[0, 0], "origin"],
    [#[1, 1], "norm"],
]);

console.log(map.get(#{ x: 0, y: 0 })); // origin
console.log(map.get(#{ x: 1, y: 1 })); // norm
console.log(map.get(#[0, 0])); // origin
console.log(map.get(#[1, 1])); // norm
```

### Tuple as Map keys example: Function memoizer

```js
function memoize(func) {
    const memoized = new Map();
    return (...args) => {
        const memoKey = #[...args];
        if (memoized.has(memoKey)) {
            return memoized.get(memoKey);
        }
        const result = func(...args);
        memoized.set(memoKey, result);
        return result;
    };
}

function verboseSum(...numbers) {
    let sum = 0;
    for (const num of numbers) {
        console.log(`Working hard on adding ${sum} + ${num}`);
        sum += num;
    }
    console.log(`Worked hard to get ${sum}`);
    return sum;
}

const verboseSumOnce = memoize(verboseSum);

const a = verboseSumOnce(1, 2, 3); // will spew logs
const b = verboseSumOnce(1, 2, 3); // will not spew logs
const c = verboseSumOnce(2, 3, 4); // will spew logs

console.log(a === b); // true
console.log(a === c); // false
```

## JSON

### Parse

Please see https://github.com/tc39/proposal-json-parseimmutable

> Note: at the time of writing this, the playground does not support `JSON.parseImmutable`.

### Stringify

```js
const jsonUser = JSON.stringify(#{ name: "danny", admin: false, score: 42 });
console.log(jsonUser); // {"admin":false,"name":"danny","score":42}
```

### Recursive conversion through JSON

```js
function recursiveRT(thing) {
    function reviver(value) {
        if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
                return Tuple.from(value);
            } else {
                return Record(value);
            }
        }
        return value;
    }
    return JSON.parse(JSON.stringify(thing), reviver);
}

const user = { name: "danny", stats: {
    avg: 42,
    scores: [40, 42, 44],
} };
const fixedUser = recursiveRT(user);
console.log(fixedUser === #{ name: "danny", stats: #{
    avg: 42,
    scores: #[40, 42, 44],
} }); // true
```

## Array-like manipulations with Tuple by copy

Using spread operations, `toReversed()`, `toSorted()`, `toSpliced()` or `with()` methods you can mutate tuples by copy:

```js
const base = #[1, 2];
console.log(#[...base, 3] === #[1, 2, 3]);
```

```js
console.log(#[3, 2, 1].toReversed() === #[1, 2, 3]);
```

```js
console.log(#[3, 2, 1].toSorted() === #[1, 2, 3]);
```

```js
console.log(#[1, 2, 3].toSpliced(0, 1, 4, 5) === #[4, 5, 2, 3]);
```

```js
console.log(#[1, 2, 3].with(1, 5) === #[1, 5, 3]);
```

> **Note:** at the time of writing this, the playground is not updated to support this `.toX` terminology, please use `.x` instead, for instance: `toSorted` is just `sorted`.

`toReversed()`, `toSorted()`, `toSpliced()` and `with()` will be available on Arrays too with the [Change Array by Copy](https://github.com/tc39/proposal-change-array-by-copy) proposal.

## Use Object methods on Records

```js
const record = #{ z: 1, a: 2 };
console.log(
    #[...Object.keys(record)] === #["a", "z"]
); // true

console.log(
    #[...Object.values(record)] === #[2, 1]
); // true

console.log(
    #[...Object.entries(record)[0]] === #["a", 2]
); // true
```
