# `Record` namespace

## `Record(obj: Object) -> Record`

Converts shallowly an object to a record. If the object has a non-const value, a TypeError will be thrown.

## `Record.fromEntries(iterator: Iterator): Record`

Similar to `Object.fromEntries`, but created a new `Record`.

## `Record.recordValue(rec: Record | Object): Record`

Returns the primitive record value of the argument if the argument is already a Record or a Record Exotic Object, otherwise a TypeError will be thrown.

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

## `Tuple.of(values...) => Tuple`

Creates a `Tuple` from a variable number of arguments, regardless of the number or types of the arguments.

```
Tuple.of(1,2,3); // #[1, 2, 3]
```

# `Tuple` prototype

## `Tuple.prototype.toReversed()`

Returns a `Tuple` of the same values as the original `Tuple` in reverse order.

## `Tuple.prototype.toSorted(compareFunction?)`

Returns a `Tuple` of the same values as the original `Tuple` in sorted order. Optionally a `compareFunction` can be specified, otherwise
the default sort order is to convert all values to strings, and comparing their sequences of UTF-16 code unit values.

## `Tuple.prototype.toSpliced(start, deleteCount?, items...)`

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

# Compatibility with the existing `Object` methods

> NOTE: Since `Record` doesn't inherit from `Object`, you can't directly call the `Object.prototype.*` methods but you have to use `.call()`.

## `Object` methods which work with `Record` and `Tuple`

- `Object.is()` - When comparing records and tuples it behaves exactly like `===`
- `Object.entries()`, `Object.keys()`, `Object.values()` - The resulting arrays are sorted alphabetically by key
- `Object.assign()` - Copy properties from a record or tuple to another object. **Caveat**: The first argument cannot be a record or a tuple, because they are immutable
- `Object.isExtensible()`, `Object.isFrozen()`, `Object.isSealed()` - When called on records and tuples, they always return `false`, `true`, and `true` respectively
- `Object.preventExtension()`, `Object.freeze()`, `Object.seal()` - Records and tuples are already immutable, so these methods will not throw but won't have any effect
- `Object.getOwnPropertyDescriptor()`, `Object.getOwnPropertyDescriptors()` - The resulting descriptors all have `writable: false, enumerable: true, configurable: false`
- `Object.getOwnPropertyNames()`, `Object.getOwnPropertySymbols()`, `Object.getPrototypeOf()` - Behave similarly to when called on objects

- `Object.prototype.toString`, `Object.prototype.toLocaleString` - Return `[object Record]` and `[object Tuple]` when a Record or Tuple is the receiver
- `Object.prototype.valueOf` - Boxes a primitive record or tuple into an object
- `Object.prototype.propertyIsEnumerable` - Always returns `true` for existing properties
- `Object.prototype.hasOwnProperty`
- `Object.prototype.isPrototypeOf`

## `Object` methods which don't work with `Record` and `Tuple`

- `Object.create()` - Records and tuples cannot be used as prototypes, unless you wrap them in objects (`Object(#{})`)
- `Object.defineProperties()`, `Object.defineProperty()`, `Object.setPrototypeOf()` - Records and tuples are immutable by design.
