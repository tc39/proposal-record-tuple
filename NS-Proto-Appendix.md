# `Record` namespace

## `Record(obj: Object) -> Record`

Converts shallowly an object to a record. If the object has a non-const value, a TypeError will be thrown.

## `Record.assign(...args: Record[]) -> Record`

Merges all records passed as arguments into one **new** record returned by the function. The latest argument will override arguments before when merging.

## `Record.entries(record: Record) -> Tuple`

Returns all of the entries in a Record as a Tuple of 2-values Tuples (key, value) in the same order as `Record.keys()`.

## `Record.fromEntries(iterator: Iterator): Record`

Takes an iterator of 2-values Tuples (key, value) and creates a record out of it. If the iterator returns something else than a 2-values tuple, a TypeError will be raised.

## `Record.keys(record: Record) -> Tuple`

Returns a Tuple containing the values serving as keys. Order will be the one defined in the main proposal document.

## `Record.toString(record: Record) -> String`

To be defined - it can actually show the full value.

## `Record.values(record: Record) -> Tuple`

Returns all of the values in a Record in the same order as the associated keys in `Record.keys()`.

## `Object` namespace functions not available in `Record`

- `Object.create()` - `Record` has no prototype so `Record.create()` would not have any meaning.
- `Object.defineProperties()`, `Object.defineProperty()` - A `Record` is non-observable, not writable by nature
- `Object.freeze()`, `Object.seal()` - `Record` is not mutable
- `Object.getOwnPropertyDescriptor()`, `Object.getOwnPropertyDescriptors()` - Does not make sense as there is no `defineProperty`
- `Object.getOwnPropertyNames()`, `Object.getOwnPropertySymbols()`, `Object.getPrototypeOf()`, `Object.setPrototypeOf()` - Does not make sense without a prototype
- `Object.is()` - `Record.is()` would be exactly the same as `Object.is()`, we can eventually make it an alias
- `Object.isExtensible()`, `Object.isFrozen()`, `Object.isSealed()` - `Record` is not mutable anyway
- `Object.hasOwnProperty()`, `Object.isPrototypeOf()`, `Object.isEnumerable()` - As we can't set those things up as seen previously, those are not available on `Record`
- `Object.toLocaleString()`, `Object.valueOf()` - Only used by objects overloading Object, we can't overload a Record

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

## TODO
