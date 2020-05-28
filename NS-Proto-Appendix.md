# `Record` namespace

## `Record(obj: Object) -> Record`

Converts shallowly an object to a record. If the object has a non-const value, a TypeError will be thrown.

## `Record.isRecord(value) -> boolean`

Checks whether the parameter is either a Record primitive or Record wrapper.

## `Record.assign(...args: Record[]) -> Record`

Merges all records passed as arguments into one **new** record returned by the function. The latest argument will override arguments before when merging.

## `Record.entries(record: Record) -> Tuple`

Returns all of the entries in a Record as a Tuple of 2-values Tuples (key, value) in the same order as `Record.keys()`.

## `Record.fromEntries(iterator: Iterator): Record`

Takes an iterator of 2-element array-like values and creates a record out of it. If the iterator returns something other than an array-like tuple, a TypeError will be raised.

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

## `Tuple.prototype.pop()`

Returns the last value of the tuple.

## `Tuple.prototype.popped()`

Returns a `Tuple` identical to the original `Tuple` except the last element is removed.

## `Tuple.prototype.push(values...)`

No-op, returns void.

## `Tuple.prototype.pushed(values...)`

Returns a `Tuple` identical to the original `Tuple` except that the `values` are added to the end of the `Tuple`.

## `Tuple.prototype.reverse()`

Returns a `Tuple` of the same values as the original `Tuple` in reverse order.

## `Tuple.prototype.shift()`

Returns the first value of the tuple.

## `Tuple.prototype.shifted()`

Returns a `Tuple` identical to the original `Tuple` except the first element is removed.

## `Tuple.prototype.unshift(values)`

No-op, returns void.

## `Tuple.prototype.unshifted(values)`

Returns a `Tuple` identical to the original `Tuple` except that the `values` are added to the beginning of the `Tuple`.

## `Tuple.prototype.sort(compareFunction?)`

Returns a `Tuple` of the same values as the original `Tuple` in sorted order. Optionally a `compareFunction` can be specified, otherwise
the default sort order is to convert all values to strings, and comparing their sequences of UTF-16 code unit values.

## `Tuple.prototype.splice(start, deleteCount?, items...)`

Returns a new `Tuple` for which the elements are removed, replaced, or added to, removing `deleteCount` elements from index `start`, and inserting
dding `items` starting at `start`.

## `Tuple.prototype.concat(values...)`

Returns a new `Tuple` where the elements in the original `Tuple` are concatenated with the `Tuple`s and values in `values...`;

## `Tuple.prototype.includes(valueToFind, fromIndex?)`

Returns a `boolean` indicating whether `valueToFind` is an element of the `Tuple`. Optionally, `fromIndex` can be specified to specify an index
into the `Tuple` to start searching for positive values, and `tuple.length + fromIndex` for negative values.

## `Tuple.prototype.indexOf(valueToFind, fromIndex?)`

Returns the first index where the element is equal to `valueToFind`. Optionally, `fromIndex` can be specified to specify an index
into the `Tuple` to start searching for positive values, and `tuple.length + fromIndex` for negative values.
Returns -1 if `valueToFind` was not found in the `Tuple`.

## `Tuple.prototype.join(separator?)`

Returns a string of the concatenated elements of the `Tuple`, separated by commas (by default) or the specified `separator`.

## `Tuple.prototype.lastIndexOf(valueToFind, fromIndex?)`

Returns the last index where the element is equal to `valueToFind`. Optionally, `fromIndex` can be specified to specify an index
into the `Tuple` to start searching for positive values, and `tuple.length + fromIndex` for negative values.
Returns -1 if `valueToFind` was not found in the `Tuple`.

## `Tuple.prototype.slice(start, end?)`

Returns a new `Tuple` containing the elements from the original `Tuple` starting at `start` and optionally ending at `end` exclusive.

## `Tuple.prototype.toString()`

Returns a string containing the elements joined, and separated commas.

## `Tuple.prototype.toLocaleString(locales, options?)`

Returns a string containing the elements joined, and separated by a locale-specific String. The elements are
converted to strings via their `toLocaleString` methods. Where `locales` is a string or array of strings, and `options` is an object
of configuration options.

## `Tuple.prototype.entries()`

Returns a new `Tuple` iterator object that contains the key/value pairs for each index in the tuple.

## `Tuple.prototype.every(callback, thisArg?)`

`callback = function(element, index, tuple) { ... }`

Returns `true` if the `callback` returns a truthy value for every element of the `Tuple`, otherwise `false`. Always returns `true` for empty `Tuple`s.
Optionally, `thisArg` can be specified, which will be used as the `callback`'s `this` value.

## `Tuple.prototype.filter(callback, thisArg?)`

`callback = function(element, index, tuple) { ... }`

Returns a new `Tuple` that contains the elements from the original `Tuple` for which `callback` returned a truthy value.
Optionally, `thisArg` can be specified, which will be used as the `callback`'s `this` value.

## `Tuple.prototype.find(callback, thisArg?)`

`callback = function(element, index, tuple) { ... }`

Returns the value of the first element in the `Tuple` for which the `callback` returns a truthy value.
Optionally, `thisArg` can be specified, which will be used as the `callback`'s `this` value.

## `Tuple.prototype.findIndex(callback, thisArg?)`

`callback = function(element, index, tuple) { ... }`

Returns the index of the first element in the `Tuple` for which the `callback` returns a truthy value, otherwise returns -1.
Optionally, `thisArg` can be specified, which will be used as the `callback`'s `this` value.

## `Tuple.prototype.forEach(callback, thisArg?)`

`callback = function(element, index, tuple) { ... }`

Calls `callback` for each element in the `Tuple` in ascending order.
Optionally, `thisArg` can be specified, which will be used as the `callback`'s `this` value.

## `Tuple.prototype.keys()`

Returns a `Tuple Iterator` object that contains the keys for each index in the `Tuple`.

## `Tuple.prototype.map(callback, thisArg?)`

`callback = function(element, index, tuple) { ... }`

Returns a `Tuple` of the results of calling `callback` for each element.
Optionally, `thisArg` can be specified, which will be used as the `callback`'s `this` value.

## `Tuple.prototype.reduce(callback, initialValue?)`

`callback = function(accumulator, element, index, tuple) { ... }`

Calls the reducer function `callback` on each element in the `Tuple`, resulting in a single value.

In the first call to `callback`, `accumulator` is the `initialValue` if provided, or the first value in the `Tuple`. Additionally, `currentValue`
is the first value in the `Tuple` if `initialValue` is provided, the second value in the `Tuple` otherwise.

In subsequent calls, the `accumulator` is the return value of the previous call to `callback`.

If the `Tuple` is empty and no `initialValue` was provided, a `TypeError` is thrown.

If the `Tuple` has only one element and no `initialValue` was provided, the element is returned, without invoking `callback`.

If the `Tuple` has no elements and an `initialValue` was provided, the `initialValue` is returned, without invoking `callback`.

## `Tuple.prototype.reduceRight(callback, initialValue?)`

`callback = function(accumulator, element, index, tuple) { ... }`

Calls the reducer function `callback` on each element in the `Tuple`, resulting in a single value.

Effectively the same as `Tuple.prototype.reduce` except right-to-left instead of left-to-right.

## `Tuple.prototype.some(callback, thisArg?)`

`callback = function(element, index, tuple) { ... }`

Returns `true` if the `callback` returns a truthy value for at least one element of the `Tuple`, otherwise `false`. Always returns `false` for empty `Tuple`s.
Optionally, `thisArg` can be specified, which will be used as the `callback`'s `this` value.

## `Tuple.prototype.values()`

Returns a `Tuple Iterator` object that contains the values for each index in the `Tuple`.

## `Tuple.prototype[@@iterator]`

Returns a `Tuple Iterator` object that contains the values for each index in the `Tuple`.

## `Tuple.prototype.with(index, value)`

Returns a `Tuple` with the same elements as the original `Tuple` except the element at `index` is replaced with `value`.
