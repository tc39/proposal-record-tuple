// not ideal, but will do for now
const RECORD_TAG = Symbol.for("__Record");
const TUPLE_TAG = Symbol.for("__Tuple");

export function isRecord(v) {
    return typeof v === "object" && v[RECORD_TAG] === true;
}

export function isTuple(v) {
    return Array.isArray(v) && v[TUPLE_TAG] === true;
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
