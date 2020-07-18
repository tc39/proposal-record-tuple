# Additional details to the main proposal document

## Examples

### More exhaustive record manipulations

```js
const record1 = #{
    a: 1,
    b: 2,
    c: 3,
};

const record2 = #{...record1, b: 5};

assert(record1.a === 1);
assert(record1["a"] === 1);
assert(record1 !== record2);
assert(record2 === #{ a: 1, c: 3, b: 5 });
assert(record1?.a === 1);
assert(record1?.d === undefined);
assert(record1?.d ?? 5 === 5);
assert(record1.d?.a === undefined);
```

#### Record initialization

Computed keys are supported, similar to [computed property names](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#Computed_property_names) in object literals.

```js
const key = "a";
assert(#{ [key]: 1 } === #{ a: 1 })
assert(#{ [key.toUpperCase()]: 1 } === #{ A: 1 })
```

Non-string keys are coerced to strings.

```js
assert(#{ [true]: 1 } === #{ true: 1 })
assert(#{ [true]: 1 } === #{ ["true"]: 1 })

assert(#{ [1 + 1]: "two" } === #{ 2: "two" })
assert(#{ [9 + 1]: "ten" } === #{ ["10"]: "ten" })
```

[Shorthand notation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#New_notations_in_ECMAScript_2015) is supported.

```js
const url = "https://github.com/tc39/proposal-record-tuple";
const record = #{ url }
console.log(record.url) // https://github.com/tc39/proposal-record-tuple
```

The spread operator can be used to specify keys and their values.

```js
const formData = #{ title: "Implement all the things" }
const taskNow = #{ id: 42, status: "WIP", ...formData }
const taskLater = #{ ...taskNow, status: "DONE" }

// A reminder: The ordering of keys in record literals does not affect equality (and is not retained)
assert(taskLater === #{ status: "DONE", title: formData.title, id: 42 })
```

#### Destructuring

```js
const { a, b } = #{ a: 1, b: 2 };
assert(a === 1);
assert(b === 2);
```


A "spread" on the `lhs` will create an object, not a record. See issue [#77](https://github.com/tc39/proposal-record-tuple/issues/77) for more discussion.

```js
const { a, ...rest } = #{ a: 1, b: 2, c: 3 };
assert(a === 1);
assert(typeof rest === "object");
assert(rest.b === 2);
assert(rest.c === 3);
```

Using a record literal on the `lhs` is a `SyntaxError`

```js
// SyntaxError
const #{ a, b } = #{ a: 1, b: 2 };
```

### More exhaustive tuple manipulations

```js
const tuple1 = #[1, 2, 3];

assert(tuple1[0] === 1);

const tuple2 = tuple1.with(0, 2);
assert(tuple1 !== tuple2);
assert(tuple2 === #[2, 2, 3]);

const tuple3 = #[1, ...tuple2];
assert(tuple3 === #[1, 2, 2, 3]);

const tuple4 = tuple3.pushed(4);
assert(tuple4 === #[1, 2, 2, 3, 4]);

assert(tuple4.first() === 1);
const tuple5 = tuple4.popped();
assert(tuple5 === #[2, 2, 3, 4]);
```


#### Destructuring

```js
const [a, b] = #[1, 2];
assert(a === 1);
assert(b === 2);
```

A "spread" on the `lhs` will create an array, not a tuple. See issue [#77](https://github.com/tc39/proposal-record-tuple/issues/77) for more discussion.


```js
const [a, ...rest] = #[1, 2, 3];
assert(a === 1);
assert(Array.isArray(rest));
assert(rest[0] === 2);
assert(rest[1] === 3);
```

Using a tuple literal on the `lhs` is a `SyntaxError`

```js
// SyntaxError
const #[a, b] = #[1, 2];
```