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

