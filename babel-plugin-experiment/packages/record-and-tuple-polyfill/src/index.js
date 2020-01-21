const RECORD_WEAK_MAP = new WeakMap();
const TUPLE_WEAK_MAP = new WeakMap();

export function isRecord(v) { return RECORD_WEAK_MAP.has(v); }
export function isTuple(v) { return TUPLE_WEAK_MAP.has(v); }

function isObject(v) { return typeof v === "object" && v !== null; }
function isFunction(v) { return typeof v === "function"; }

function isIterableObject(v) {
    return isObject(v) && typeof (v[Symbol.iterator]) === "function";
}

function getOwnEnumerablePropertySymbols(object) {
    return Object.getOwnPropertySymbols(object)
        .filter(symbol => Object.prototype.propertyIsEnumerable.call(object, symbol));
}

function objectFromEntries(iterable) {
    return [...iterable].reduce((obj, [key, val]) => {
        obj[key] = val;
        return obj;
    }, {});
}

function unbox(v) {
    if (v instanceof Boolean) {
        return Boolean.prototype.valueOf.call(v);
    } else if (v instanceof Number) {
        return Number.prototype.valueOf.call(v);
    } else if (v instanceof BigInt) {
        return BigInt.prototype.valueOf.call(v);
    } else if (v instanceof String) {
        return String.prototype.valueOf.call(v);
    } else if (v instanceof Symbol) {
        return Symbol.prototype.valueOf.call(v);
    } else {
        return v;
    }
}

function recordEqual(a, b, equalFunc) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    const aSymbols = getOwnEnumerablePropertySymbols(a);
    const bSymbols = getOwnEnumerablePropertySymbols(b);

    if (aKeys.length !== bKeys.length) {
        return false;
    }

    const aSymbolsSet = new Set(aSymbols);
    const bSymbolsSet = new Set(bSymbols);

    if (aSymbolsSet.size !== bSymbolsSet.size) {
        return false;
    }
    for (const aSymbol of aSymbolsSet) {
        if (!bSymbolsSet.has(aSymbol)) {
            return false;
        }
    }

    aKeys.sort();
    bKeys.sort();

    for (let i = 0; i < aKeys.length; i++) {
        const aKey = aKeys[i];
        const bKey = bKeys[i];
        if (aKey !== bKey) {
            return false;
        }
        if (!equalFunc(a[aKey], b[bKey])) {
            return false;
        }
    }

    for (let i = 0; i < aSymbols.length; i++) {
        const aSymbol = aSymbols[i];
        if (!equalFunc(a[aSymbol], b[aSymbol])) {
            return false;
        }
    }

    return true;
}

function tupleEqual(a, b, equalFunc) {
    if (a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; i++) {
        if (!equalFunc(a[i], b[i])) {
            return false;
        }
    }
    return true;
}

export function baseEqual(a, b, equalFunc) {
    const isRecordA = isRecord(a);
    const isRecordB = isRecord(b);
    if (isRecordA && isRecordB) {
        return recordEqual(a, b, equalFunc);
    }

    const isTupleA = isTuple(a);
    const isTupleB = isTuple(b);
    if (isTupleA && isTupleB) {
        return tupleEqual(a, b, equalFunc);
    }

    return false;
}

function isEqualInternal(a, b) {
    if (Object.is(a, b))
        return true;
    return baseEqual(a, b, isEqualInternal);
}

export function isEqual(a, b) {
    if (typeof a === "number" && typeof b === "number")
        return a === b;
    else
        return isEqualInternal(a, b);
}

export function strictEqual(a, b) {
    if (a === b)
        return true;
    return baseEqual(a, b, strictEqual);
}

export function abstractIsEqual(a, b) {
    if (a == b)
        return true;
    return baseEqual(a, b, isEqual);
}

export function abstractStrictEqual(a, b) {
    if (a == b)
        return true;
    return baseEqual(a, b, strictEqual);
}

function validateProperty(value) {
    const unboxed = unbox(value);
    if (isObject(unboxed) && !(isRecord(unboxed) || isTuple(unboxed))) {
        throw new Error("TypeError: cannot use an object as a value in a record");
    } else if (isFunction(unboxed)) {
        throw new Error("TypeError: cannot use a function as a value in a record");
    }
    return unboxed;
}

export function Record(value) {
    return createRecordFromObject(value);
}
Record.prototype = Object.create(null);

Record.isRecord = isRecord;
Record.assign = function assign(...args) {
    return createRecordFromObject(Object.assign(...args));
}
Record.entries = function entries(record) {
    return createTupleFromIterableObject(Object.entries(record).map(createTupleFromIterableObject));
}
Record.fromEntries = function fromEntries(iterator) {
    return createRecordFromObject(objectFromEntries(iterator));
}
Record.keys = function keys(record) {
    return createTupleFromIterableObject(Object.keys(record));
}
Record.values = function values(record) {
    return createTupleFromIterableObject(Object.values(record));
}

export function createRecordFromObject(value) {
    const unboxed = unbox(value);

    if (!isObject(unboxed)) {
        throw new Error("invalid value, expected an object as the argument.");
    }

    const propertyNames = Object.keys(unboxed).sort();
    // own property symbols are currently unsorted
    // as there isn't really a way to sort them other than by their
    // description, which doesn't distinguish between two unique symbols
    // with the same description
    const propertySymbols = getOwnEnumerablePropertySymbols(unboxed);

    const record = Object.create(Record.prototype);
    for (const name of propertyNames) {
        record[name] = validateProperty(unboxed[name]);
    }
    for (const symbol of propertySymbols) {
        record[symbol] = validateProperty(unboxed[symbol]);
    }

    RECORD_WEAK_MAP.set(record, true);
    return Object.freeze(record);
}

export function Tuple(...values) {
    return createTupleFromIterableObject(values);
}
Tuple.from = function from(arrayLike, mapFn, thisArg) {
    return createTupleFromIterableObject(Array.from(arrayLike, mapFn, thisArg));
}
Tuple.isTuple = isTuple;

Tuple.of = function of(...values) {
    return createTupleFromIterableObject(Array.of(...values));
}
export function createTupleFromIterableObject(value) {
    const unboxed = unbox(value);

    if (!isIterableObject(unboxed)) {
        throw new Error("invalid value, expected an array or iterable as the argument.");
    }

    const tuple = Array.from(unboxed, validateProperty);
    TUPLE_WEAK_MAP.set(tuple, true);
    return Object.freeze(tuple);
}
