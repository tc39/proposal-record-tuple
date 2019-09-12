# Const Value Types: Record & Tuple

ECMAScript proposal for the Record and Tuple const value types (also known as immutable types).

**Authors:**

- Robin Ricard (Bloomberg)
- Richard Button (Bloomberg)

**Champions:**

- Robin Ricard (Bloomberg)
- Richard Button (Bloomberg)

**Advisors**

- Philipp Dunkel (Bloomberg)
- Dan Ehrenberg (Igalia)
- Maxwell Heiber (Bloomberg)

**Stage:** 0

# Overview

The goal of this proposal is to introduce deeply constant/immutable data structures to JavaScript. It has multiple objectives:

- Introducing efficient data structures that makes copying and changing them cheap and will allow programs avoiding mutation of data to run faster (pattern heavily used in Redux for instance).
- Add guarantees in strict equality when comparing data. This is only possible because those data structures are deeply immutable (comparing props fast is essential for efficient virtual dom reconciliation in React apps for instance)
- Be easily understood by external typesystem supersets such as TypeScript or Flow.
- Offers the possibility to improve structured cloning efficiency when messaging across workers.

This proposal presents 2 main additions to the language:

- `Record`
- `Tuple`

`Record`s and `Tuple`s can only contain other immutable values.

## Prior work on immutable data structures in JavaScript

Today, a few libraries implement similar concepts such as [Immutable.js](https://immutable-js.github.io/immutable-js/) or [Immer](https://github.com/mweststrate/immer). Also [a previous proposal attempt](https://github.com/sebmarkbage/ecmascript-immutable-data-structures) has been done previously but abandoned because of the complexity of the proposal and lack of sufficient use cases.

This new proposal is still inspired by this previous proposal but introduces some significant changes: Record and Tuples are now deeply immutable which can lead to simplifications across the board in the implementation, additionally we're trying to make sure existing mechanisms in the engines could support this feature with minimal work.

Finally, using libraries to handle those types has multiple issues: we have multiple ways of doing the same thing that do not interoperate with each other, the syntax is not as expressive as it could be if it was integrated in the language and finally, it can be very challenging for a type system to pick up what the library is doing.

# Examples

#### `Record`

```js
const record1 = #{
    a: 1,
    b: 2,
    c: 3,
};

const record2 = #{...record1, b: 5};

assert(record1 !== record2);
assert(record2 === #{ a: 1, c: 3, b: 5 });
```

#### `Tuple`

```js
const tuple1 = #[1, 2, 3];

const tuple2 = tuple1.with(0, 2);
assert(tuple1 !== tuple2);
assert(tuple2 === #[2, 2, 3]);

const tuple3 = #[1, ...tuple2];
assert(tuple3 === #[1, 2, 2, 3]);

const tuple4 = tuple3.push(4);
assert(tuple4 === #[1, 2, 2, 3, 4]);

assert(tuple4.first() === 1);
const tuple5 = tuple4.pop();
assert(tuple5 === #[2, 2, 3, 4]);
```

#### Computed access

```js
const record = #{ a: 1, b: 2, c: 3 };
const tuple = #[1, 2, 3, 4];

const k = "b";
const i = 1;

assert(#{ ...record, [k]: 5 } === #{ a: 1, c: 3, b: 5 });
assert(tuple.with(i, 1) === #[1, 1, 3, 4]);
```

#### Forbidden cases

```js
const instance = new MyClass();
const constContainer = #{
    instance: instance
};
// TypeError: Can't use a non-const type in a const declaration

const tuple = #[1, 2, 3];

tuple.map(x => new MyClass(x));
// TypeError: Can't use a non-const type in a const operation

// The following should work:
Array.from(tuple).map(x => new MyClass(x))
```

# Syntax

This defines the new pieces of syntax being added to the language with this proposal.

We define _ConstExpression_ by using the `#` modifier in front of otherwise normal expressions and declarations.

_ConstExpression_:

> `#` _ObjectExpression_

> `#` _ArrayExpression_

#### Examples

```js
#{}
#{ a: 1, b: 2 }
#{ a: 1, b: [2, 3, { c: 4 }] }
#[]
#[1, 2]
#[1, 2, { a: 3 }]
```

#### Runtime verification

At runtime, if a non-value type is placed inside a `Record` or `Tuple`, it is a `TypeError`. This means that a `Record` or `Tuple` expression can only contain value types.

At runtime, attempting to create a `Record` with a key that is not a `string` is a `TypeError`.

At runtime, it is a `TypeError` to add a value to a `Record` or `Tuple` of any type except the following: `Record`, `Tuple`, `string`, `number`, `symbol`, `boolean`, `bigint`, `undefined` and `null`.

# Equality

Instances of `Record` and `Tuple` are immutable, so their equality works like that of other immutable JS values like `boolean` and `string` instances:

```js
assert(#{ a: 1 } === #{ a: 1 });
assert(Object(#{ a: 1 }) !== Object(#{ a: 1 }));
assert({ a: 1 } !== { a: 1 });
```

This is distinct from how equality works for JS objects: `assert({} !== {});`. Strict comparison of objects will observe that each object is distinct.

`Record` and `Tuple` types are completely and deeply constant, if they have the same values stored, they will be considered strictly equal.

[Each of the four JS equality algorithms](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness) gives the same result when comparing records or tuples:

```js
// strict equality
assert(#{ a:  1} === #{ a: 1 });
assert(#[1] === #[1]);

// abstract equality comparison
assert(#{ a:  1} == #{ a: 1 });
assert(#[1] == #[1]);

// SameValue
assert(new Map().set(#{ a: 1 }, true).get(#{ a: 1 }));
assert(new Map().set(#[1], true).get(#[1]));

// SameValue
assert(Object.is(#{ a:  1}, #{ a: 1 }));
assert(Object.is(#[1], #[1]));
```

It is an **open question** whether two `Record`s with distinct insertion order are equal. We will gather additional feedback before proceeding:

```js
assert(#{ a: 1, b: 2 } === #{ b: 2, a: 1 }); // not yet specified whether this passes
```

This is related to [Ordering of properties](#ordering-of-properties).

# `Record` and `Tuple` Globals

We add to the global namespace two objects that you can use to manipulate records and tuples. Those objects have multiple properties that are in line with how records and tuples behave.

## Instantiation and converting from non-const types

You can't instantiate (as in, getting a reference of) any `Record` or `Tuple` so using `new` will throw a `TypeError`. However, you can convert any structure that can be deeply represented as const using `Record.from()` or `Tuple.from()` available in the global namespace:

```js
const record = Record({ a: 1, b: 2, c: 3 });
const record2 = Record.fromEntries([#["a", 1], #["b", 2], #["c": 3]]); // note that an iterable will also work
const tuple = Tuple.from([1, 2, 3]); // note that an iterable will also work
asset(record === #{ a: 1, b: 2, c: 3 });
asset(tuple === #[1, 2, 3]);
Record.from({ a: {} }); // TypeError: Can't convert Object with a non-const value to Record
Tuple.from([{}, {} , {}]); // TypeError: Can't convert Iterable with a non-const value to Tuple
```

Note that the whole structure needs to be shallowly convertable to any acceptable value type at runtime. This means that any of the values supported in the array/iterable/object must be one of these: `Record`, `Tuple`, `number`, `string`, `symbol` or `null`.

> _Note_: adding a recursive way of converting data structures should be possible, as long as we introduce a way to control the depth of the conversion.

## `Record` and `Tuple` namespace

As we've seen previously, we have a `Record` and `Tuple` namespace.
The `Record` global namespace has some associated functions similar to `Object`. Same goes for `Tuple` and `Array`.
The `Object` namespace and the `in` operator should also be able to work with `Records` and return as usual equivalent. For instance:

```js
assert(Record.keys(#{ a: 1, b: 2 }) === #["a", "b"]);
const keysArr = Object.keys(#{ a: 1, b: 2 }); // returns the array ["a", "b"]
assert(keysArr[0] === "a");
assert(keysArr[1] === "b");
assert(keysArr !== #["a", "b"]);
assert("a" in #{ a: 1, b: 2 });
```

See the [appendix](./NS-Proto-Appendix.md) to learn more about the `Record` & `Tuple` namespaces.

## `Record` and `Tuple` Wrapper Objects

Most users will not have to think about `Record` and `Tuple` wrapper objects. They exist for consistency with other ECMAScript features.

- `Object(record)` creates an instance of `Record`, which is the wrapper object for `record` values. These instances are not extensible.
- `Object(tuple)` creates an instance of `Tuple`, which is the wrapper object for `tuple` values. These instances are not extensible.

`Record.prototype` is an ordinary object, is not a `Record` instance, and its prototype is `Object.prototype`. `record` values are not an instances of the `Record` prototype.

`Tuple.prototype` is an ordinary object, is not a `Tuple` instance, and its prototype is `Object.prototype`. `tuple` values are not instances of the `Tuple` prototype.

Accessing a member expression of a tuple or record via `.` or `[]` follows the standard [`GetValue`](https://tc39.es/ecma262/#sec-getvalue) semantics, and implicitly converts to an instance of the corresponding wrapper type.

An instance of `Record` has the same keys and values as the `record` value it was created from. These keys are all `writable: false, enumerable: true, configurable: false`.

An instance of `Tuple` has keys that are `${index}` for each index in the original `tuple`. The value for each of these keys is the corresponding value in the original `tuple`. These keys are all `writable: false, enumerable: true, configurable: false`. In addition, there is a non-enumerable `length` key. This behavior matches that of the `String` wrapper object. That is,  `Object.getOwnPropertyDescriptors(Object(#["a", "b"]))` and `Object.getOwnPropertyDescriptors(new String("ab"))` each return an object that looks like this:

```json
{
  "0": { "value": "a", "writable": false, "enumerable": true, "configurable": false },
  "1": { "value": "b", "writable": false, "enumerable": true, "configurable": false },
  "length": { "value": 2, "writable": false, "enumerable": false, "configurable": false }
}
```

## Ordering of properties

This part is an **open question**. We will gather additional feedback before deciding.

### Sorted Order (option 1)

When the properties of a `Record` or `Tuple` are enumerated, their keys are enumerated in *sorted order*, where
*sorted order* effectively means "according to the sort order defined by `Array.prototype.sort` with the default comparator".

```js
const obj = { z: 1, a: 1 };
const record = #{ z: 1, a: 1 };

Object.keys(obj); // ["z", "a"]
Record.keys(record); // #["a", "z"]
```

The properties of `Record`s and `Tuple`s are enumerated in this sorted order in order to
preserve their equality when consuming them in pure functions.

```js
const record1 = #{ a: 1, z: 1 };
const record2 = #{ z: 1, a: 1 };

const func = (record) => {...} // some function with no observable side effects

assert(record1 === record2);
assert(func(record1) === func(record2));
```

If enumeration order for `Records` and `Tuple`s was instead insertion order, then: `const func = Record.keys;`
would break the above assertion.

### Insertion Order (option 2)

When the properties of a `Record` or `Tuple` are enumerated, their keys are enumerated in the insertion/last update order.
This has the consequence of making the inserting order matter for strict equality because now the insertion order is actual differentiating information.

```js
const obj = { z: 1, a: 1 };
const record = #{ z: 1, a: 1 };

Object.keys(obj); // ["z", "a"]
Record.keys(record); // #["z", "a"]

const record2 = #{ a: 1, z: 1 };
assert(#{ a: 1, z: 1 } !== #{ z: 1, a: 1 });
```

> This option is being considered as it could be beneficial in implementing it into javascript engines (such data structure is very similar to hidden classes, "shapes" in SpiderMonkey, "maps" in V8).

## Iteration of properties

Similar to objects and arrays, `Records` are not iterable, while `Tuple`s are iterable. For example:

```js
const record = #{ a: 1, b: 2 };
const tuple = #[1, 2];

// TypeError: record is not iterable
for (const o of record) { console.log(o); }


// output is:
// 1
// 2
for (const o of tuple) { console.log(o); }
```

## Object.from

`Object.from(record)` creates an object with the same keys and values as `record`. Note that it is not recursive.

```js
assert.deepEqual(Object.from(#{ a: #[1, 2, 3] }), { a: #[1, 2, 3] });
```

`Object.from(object)` behaves identically to `Object.assign({}, object)`

`Object.from(somethingElse)` where `somethingElse` is not a `Record` or `object` returns `{}`.

> This is similar to the behavior of [`Array.from`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from)

## JSON.stringify

- The behavior of `JSON.stringify(record)` is equivalent to calling `JSON.stringify` on the object resulting from recursively converting the record to an object that contains no records or tuples.
- The behavior of `JSON.stringify(tuple)` is equivalent to calling `JSON.stringify` on the array resulting from recursively converting the record to an object that contains no records or tuples.

```js
JSON.stringify(#{ a: #[1, 2, 3] }); // "{a: [1, 2, 3]}"
JSON.stringify(#[true, #{ a: #[1, 2, 3] }]); // "[true, {a: [1, 2, 3]}]"
```

## `Record` prototype

The `Record` prototype is `null`.

## `Tuple` prototype

The `Tuple` prototype is an object that contains the same methods as Array with a few changes:

- We added `Tuple.prototype.with()` that returns a new tuple with a value changed at a given index.
- `Tuple.prototype.pop()` and `Tuple.prototype.shift()` do not return the removed element, they return the result of the change
- `Tuple.prototype.first()` and `Tuple.prototype.last()` are added to return the first and last element of the `Tuple`

See the [appendix](./NS-Proto-Appendix.md) `Tuple`'s prototype.

## `typeof`

The typeof operator will return a new value for `Record`s and `Tuple`s. The value to be returned
is still **an open question**. For now, we think that `"record"` is the most reasonable option.

```js
assert(typeof #{ a: 1 } === "record");
assert(typeof #[1, 2]   === "record");
```

## Usage in {`Map`|`Set`|`WeakMap`}

It is possible to use a `Record` or `Tuple` as a key in a `Map`, and as a value in a `Set`. When using a `Record` or `Tuple` in this way, key/value equality behaves as expected.

It is not possible to use a `Record` or `Tuple` as a key in a `WeakMap`, because `Records` and `Tuple`s are not `Objects`, and their lifetime is not observable. Attempting to set a value in a WeakMap using a `Record` or `Tuple` as the key will result in a `TypeError`.

### Examples

#### Map

```js
const record1 = #{ a: 1, b: 2 };
const record2 = #{ a: 1, b: 2 };

const map = new Map();
map.set(record1, true);
assert(map.get(record2));
```

#### Set

```js
const record1 = #{ a: 1, b: 2 };
const record2 = #{ a: 1, b: 2 };

const set = new Set();
set.add(record1);
set.add(record2);
assert(set.size === 1);
```

#### WeakMap

```js
const record = #{ a: 1, b: 2 };
const weakMap = new WeakMap();

// TypeError: Can't use a Record as the key in a WeakMap
weakMap.set(record, true);
```

# FAQ

## Why #{}/#[] syntax? What about an existing or new keyword?

Using a keyword as a prefix to the standard object/array literal syntax presents issues around
backwards compatibility. Additionally, re-using existing keywords can introduce ambiguity.

ECMAScript defines a set of [_reserved keywords_](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#Keywords) that can be used for future extensions to the language.
Defining a new keyword that is not already reserved is possible, but requires significant effort to validate
that the new keyword will not likely break backwards compatibility.

Using a reserved keyword makes this process easier, but it is not a perfect solution because there are no reserved keywords
that match the "intent" of the feature, other than `const`. The `const` keyword is also tricky, because it describes
a similar concept (variable reference immutability) while this proposal intends to add new immutable data structures.
While immutability is the common thread between these two features, there has been significant community feedback that
indicates that using `const` in both contexts is undesirable.

Instead of using a keyword, `{| |}` and `[||]` have been suggested as possible alternatives. For example:

```js
const first = {| a: 1, b: 2 |};
const second = [|1, 2, 3|];
```

## How does this relate to the const keyword?

`const` variable declarations and `Record`/`Tuple` are completely orthogonal features.

`const` variable declarations force the reference or value type to stay constant for a given identifier in a given lexical scope.

The `Record` and `Tuple` value types are deeply constant and unchangeable.

Using both at the same time is possible, but using a non-const variable declaration is also possible:

```js
const record = #{ a: 1, b: 2 };
let record2 = #{ ...record, c: 0 };
record2 = #{ ...record2, c: 3 };
```

## What about const classes?

"Const" classes are being considered as a followup proposal that would let us associate methods to `Records`.

You can see an attempt at defining them in an [earlier version of this proposal](./history/with-classes.md).

## Are there any follow up proposals being considered?

As this proposal adds a new concept to the language, we expect that other proposals might use this proposal to extend an another orthogonal feature.

We consider exploring the following proposals once this one gets considered for higher stages:

- "Computed" and "Deep" update by copy operation (see [previous version of this proposal](https://github.com/rricard/proposal-const-value-types/blob/1c5925ca1235a5b8294cbf0018baa3ef7cf9bd5d/README.md) with the `with` keyword integrated)
- "Const" classes
- ConstSet and ConstMap, the const versions of [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) and [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)

A goal of the broader set of proposals (including [operator overloading](https://github.com/littledan/proposal-operator-overloading/) and [extended numeric literals](https://github.com/tc39/proposal-extended-numeric-literals) is to provide a way for user-defined types to do the same as [BigInt](https://github.com/tc39/proposal-bigint).

If const classes are standardized, features like [Temporal Proposal](https://github.com/tc39/proposal-temporal) which might be able to express its types using const classes. However, this is far in the future, and we do not encourage people to wait for the addition of const classes.

# Glossary

#### Immutable Data Structure

A Data Structure that doesn't accept operations that change it internally, it has operations that return a new value type that is the result of applying that operation on it.

In this proposal `Record` and `Tuple` are immutable data structures.

#### Strict Equality

In this proposal we define strict equality as it is broadly defined in JavaScript. The operator `===` is a strict equality operator.

#### Structural Sharing

Structural sharing is a technique used to limit the memory footprint of immutable data structures. In a nutshell, when applying an operation to derive a new version of an immutable structure, structural sharing will attempt to keep most of the internal structure intact and used by both the old and derived versions of that structure. This greatly limits the amount to copy to derive the new structure.
