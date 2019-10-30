const RECORD_WEAK_MAP = new WeakMap();
const TUPLE_WEAK_MAP = new WeakMap();

export function isRecord(v) { return RECORD_WEAK_MAP.has(v); }
export function isTuple(v) { return TUPLE_WEAK_MAP.has(v); }

function isObject(v) { return typeof v === "object" && v !== null; }
function isFunction(v) { return typeof v === "function"; }

function isIterable(v) {
    return isObject(v) && typeof (v[Symbol.iterator]) === "function";
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

function recordEqual(a, b) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) {
        return false;
    }

    aKeys.sort();
    bKeys.sort();

    for (let i = 0; i < aKeys.length; i++) {
        const aKey = aKeys[i];
        const bKey = bKeys[i];
        if (aKey !== bKey) {
            return false;
        }
        if (!equal(a[aKey], b[bKey])) {
            return false;
        }
    }
    return true;
}

function tupleEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; i++) {
        if (!equal(a[i], b[i])) {
            return false;
        }
    }
    return true;
}

export function equal(a, b) {
    if (Object.is(a, b))
        return true;

    const isRecordA = isRecord(a);
    const isRecordB = isRecord(b);
    if (isRecordA && isRecordB) {
        return recordEqual(a, b);
    }

    const isTupleA = isTuple(a);
    const isTupleB = isTuple(b);
    if (isTupleA && isTupleB) {
        return tupleEqual(a, b);
    }

    return false;
}

function validateMember(value) {
    const unboxed = unbox(value);
    if (isObject(unboxed) && !isRecord(unboxed)) {
        throw new Error("TypeError: cannot use an object as a value in a record");
    } else if (isFunction(unboxed)) {
        throw new Error("TypeError: cannot use a function as a value in a record");
    }
}

export function Record(value) {
    return createRecordFromObject(value);
}
Record.assign = function assign(...args) {
    return createRecordFromObject(Object.assign(...args));
}
Record.entries = function entries(record) {
    return createTupleFromArray(Object.entries(record).map(createTupleFromArray));
}
Record.fromEntries = function fromEntries(iterator) {
    return createRecordFromObject(Object.fromEntries(iterator));
}
Record.keys = function keys(record) {
    return createTupleFromArray(Object.keys(record));
}
Record.values = function values(record) {
    return createTupleFromArray(Object.values(record));
}
Record.parse = function parse(text, reviver) {
    const value = JSON.parse(text, reviver);
    if (isIterable(value)) {
        return createTupleFromArray(value);
    } else if (isObject(value)) {
        return createRecordFromObject(value);
    } else {
        return value;
    }
}

export function createRecordFromObject(value) {
    const unboxed = unbox(value);

    if (!isObject(unboxed)) {
        throw new Error("invalid value, expected an object as the argument.");
    }

    const keys = Object.keys(unboxed).sort();

    const record = {};
    for (const key of keys) {
        validateMember(unboxed[key]);
        record[key] = unboxed[key];
    }
    RECORD_WEAK_MAP.set(record, true);
    return Object.freeze(record);
}

export function Tuple(...values) {
    return createTupleFromArray(values);
}
Tuple.from = function from(arrayLike, mapFn, thisArg) {
    return createTupleFromArray(Array.from(arrayLike, mapFn, thisArg));
}
Tuple.isTuple = isTuple;

Tuple.of = function of(...values) {
    return createTupleFromArray(Array.of(...values));
}
export function createTupleFromArray(value) {
    const unboxed = unbox(value);

    if (!isIterable(unboxed)) {
        throw new Error("invalid value, expected an array or iterable as the argument.");
    }

    unboxed.forEach(validateMember);

    const tuple = Array.from(unboxed);
    TUPLE_WEAK_MAP.set(tuple, true);
    return Object.freeze(tuple);
}
