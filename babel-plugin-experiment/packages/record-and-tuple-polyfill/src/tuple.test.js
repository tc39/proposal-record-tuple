import { Record, Tuple, createTupleFromIterableObject } from "record-and-tuple-polyfill";

test("Tuple creates an tuple with the provides arguments as elements", () => {
    expect(Tuple(1,2,3)).toRecordEqual(Tuple(1,2,3));

    const sym = Symbol();
    expect(Tuple(true, false, "test", sym, null, undefined))
        .toRecordEqual(Tuple(true, false, "test", sym, null, undefined));

    expect(Tuple(1, 2, Tuple(3, 4))).toRecordEqual(Tuple(1,2,Tuple(3,4)));
});

test("tuples cannot contain objects", () => {
    expect(() => Tuple([])).toThrow();
    expect(() => Tuple({})).toThrow();
    expect(() => Tuple(function() {})).toThrow();
});

test("tuples unbox boxed primitives", () => {
    expect(Tuple(Object(true))).toRecordEqual(Tuple(true));
    expect(Tuple(Object(1))).toRecordEqual(Tuple(1));
    expect(Tuple(Object("test"))).toRecordEqual(Tuple("test"));

    const sym = Symbol();
    expect(Tuple(Object(sym))).toRecordEqual(Tuple(sym));
});

test("tuples are correctly identified as tuples", () => {
    expect(Tuple.isTuple(Tuple(1,2,3))).toBe(true);
    expect(Tuple.isTuple(Record({ a: 1 }))).toBe(false);
    expect(Tuple.isTuple({ a: 1 })).toBe(false);
    expect(Tuple.isTuple(function() {})).toBe(false);
    expect(Tuple.isTuple(true)).toBe(false);
    expect(Tuple.isTuple(1)).toBe(false);
    expect(Tuple.isTuple("test")).toBe(false);
    expect(Tuple.isTuple(Symbol())).toBe(false);
});

test("Tuple function creates deeply frozen arrays", () => {
    expect(Object.isFrozen(Tuple(1,2,3))).toBe(true);
    expect(Array.isArray(Tuple(1,2,3))).toBe(true);

    expect(Object.isFrozen(Tuple(1,2,Tuple(3))[2])).toBe(true);
    expect(Array.isArray(Tuple(1,2,Tuple(3))[2])).toBe(true);
});

test("createTupleFromIterableObject only accepts iterable arguments", () => {
    expect(() => createTupleFromIterableObject({})).toThrow();
    expect(() => createTupleFromIterableObject(true)).toThrow();
    expect(() => createTupleFromIterableObject("test")).toThrow();
    expect(() => createTupleFromIterableObject(1)).toThrow();
    expect(() => createTupleFromIterableObject(Symbol())).toThrow();

    expect(createTupleFromIterableObject([1,2,3])).toRecordEqual(Tuple(1,2,3));

    const iterable = {
        [Symbol.iterator]() {
            let count = 0;
            const max = 5;
            return {
                next() {
                    count++;
                    if (count < max) {
                        return { value: count, done: false };
                    } else {
                        return { value: undefined, done: true };
                    }
                },
            };
        },
    };
    expect(createTupleFromIterableObject(iterable)).toRecordEqual(Tuple(1,2,3,4));
});

test("tuples with the same structural equality will be equal", () => {
    expect(Tuple(1,2,3)).toRecordEqual(Tuple(1,2,3));
    expect(Tuple(1,2,(Tuple(4,5)))).toRecordEqual(Tuple(1,2,Tuple(4,5)));

    expect(Tuple(1,2,3)).not.toRecordEqual(Tuple(4,5,6));
});

test("Tuple.from", () => {
    expect(Tuple.from([1,2,3])).toRecordEqual(Tuple(1,2,3));
    expect(Tuple.from([1,2,3], (v) => v + 1)).toRecordEqual(Tuple(2,3,4));

    // ensure that thisArg is correctly used for the mapFn
    const rec = Record({ a: 1 });
    expect(Tuple.from([1], function(v) { return this; }, rec)[0]).toBe(rec);
});
test("Tuple.of", () => {
    expect(Tuple.of(1,2,3)).toRecordEqual(Tuple(1,2,3));
});
// TODO: Tuple prototype methods
