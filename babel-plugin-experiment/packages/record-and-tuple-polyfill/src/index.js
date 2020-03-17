const RECORD_WEAK_MAP = new WeakMap();
const TUPLE_WEAK_MAP = new WeakMap();

export function isRecord(v) { return RECORD_WEAK_MAP.has(v); }
export function isTuple(v) { return TUPLE_WEAK_MAP.has(v); }

function isObject(v) { return typeof v === "object" && v !== null; }
function isFunction(v) { return typeof v === "function"; }

function isIterableObject(v) {
    return isObject(v) && typeof (v[Symbol.iterator]) === "function";
}

// 7.1.21
function isCanonicalNumericIndexString(str) {
    if (typeof str !== "string") return false;
    if (str === "-0") return true;

    const n = Number(str);
    return String(n) === str;
}
// 6.1.7
function isArrayIndex(str) {
    if (!isCanonicalNumericIndexString(str)) {
        return false;
    }
    const n = Number(str);

    return Object.is(n, +0) || (Math.floor(n) === n && n < Number.MAX_SAFE_INTEGER);
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
    } else if ("BigInt" in globalThis && v instanceof globalThis["BigInt"]) {
        return globalThis["BigInt"].prototype.valueOf.call(v);
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

    if (aKeys.length !== bKeys.length) {
        return false;
    }

    // delay sorting these keys until needed
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
// ensure that Record.name is "Record" even if this
// source is aggressively minified or bundled.
if (Record.name !== "Record") {
    Object.defineProperty(Record, "name", { value: "Record" });
}
Record.prototype = Object.create(null);
Record.prototype.constructor = Record;

Record.isRecord = isRecord;
Record.assign = function assign(...args) {
    for (const arg of args) {
        if (!isRecord(arg)) {
            throw new TypeError("Cannot copy properties from or two an object using Record.assign");
        }
    }

    return createRecordFromObject(Object.assign({}, ...args));
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

    // sort all property names by the order specified by
    // the argument's OwnPropertyKeys internal slot
    // Object.keys - 19.1.2.17
    // EnumerableOwnPropertyNames - 7.3.22
    const propertyNames = Object.keys(unboxed).sort();

    const record = Object.create(Record.prototype);
    for (const name of propertyNames) {
        record[name] = validateProperty(unboxed[name]);
    }

    RECORD_WEAK_MAP.set(record, true);
    return Object.freeze(record);
}

export function Tuple(...values) {
    return createTupleFromIterableObject(values);
}
// ensure that Tuple.name is "Tuple" even if this
// source is aggressively minified or bundled.
if (Tuple.name !== "Tuple") {
    Object.defineProperty(Tuple, "name", { value: "Tuple" });
}
Tuple.prototype = Object.create(null);
Tuple.prototype.constructor = Tuple;
Tuple.prototype[Symbol.iterator] = function() {
    let index = 0;
    return {
        next: () => {
            if (index < this.length) {
                const result = { value: this[index], done: false };
                index++;
                return result;
            } else {
                return { value: undefined, done: true };
            }
        }
    };
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

    let length = 0;

    const iterator = unboxed[Symbol.iterator]();

    const tuple = Object.create(Tuple.prototype);
    while (true) {
        const result = iterator.next();
        if (result.done) break;

        tuple[length] = validateProperty(result.value);
        length++;
    }

    Object.defineProperty(tuple, "length", {
        value: length,
        writable: false,
        enumerable: false,
        configurable: false,
    });

    TUPLE_WEAK_MAP.set(tuple, true);
    return Object.freeze(tuple);
}
