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

# `Tuple` prototype
