# `Record` namespace

# `Tuple` namespace

## `Tuple.from(arrayLike, mapFn, thisArg) => Tuple`

Creates a shallow-copied `Tuple` from an `array-like`, `iterable` object, or another `Tuple`.

Optionally, a `mapFn` can be specified, which will be invoked for every value in `arrayLike`. The resulting `Tuple` will contain the return values of `mapFn`, rather than the original values. An optional `thisArg` can be specified, which will be used as the `this` value when invoking `mapFn`.

```
Tuple.from([1, 2, 3]); // #[1, 2, 3]
Tuple.from(#[1, 2, 3]); // #[1, 2, 3]

const set = new Set([1, 2, 3]);
set.add(0);
Tuple.from(set) // #[1, 2, 3, 0]
```

## `Tuple.isTuple(value) => boolean`

Determines whether the passed value is a `Tuple`.

```
Tuple.isTuple(#[1, 2, 3]); // true
Tuple.isTuple(#{ a: 1, b: 2 }); // false
```

## `Tuple.of(values...) => Tuple`

Creates a `Tuple` from a variable number of arguments, regardless of the number or types of the arguments.

```
Tuple.of(1,2,3); // #[1, 2, 3]
```

# `Tuple` prototype
