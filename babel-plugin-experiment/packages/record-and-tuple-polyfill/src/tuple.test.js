import { Record, Tuple, createTupleFromIterableObject } from "record-and-tuple-polyfill";

test("Tuple creates an tuple with the provides arguments as elements", () => {
    expect(Tuple(1,2,3)).toRecordIsEqual(Tuple(1,2,3));

    const sym = Symbol();
    expect(Tuple(true, false, "test", sym, null, undefined))
        .toRecordIsEqual(Tuple(true, false, "test", sym, null, undefined));

    expect(Tuple(1, 2, Tuple(3, 4))).toRecordIsEqual(Tuple(1,2,Tuple(3,4)));
});

test("tuples cannot contain objects", () => {
    expect(() => Tuple([])).toThrow();
    expect(() => Tuple({})).toThrow();
    expect(() => Tuple(function() {})).toThrow();
});

test("tuples unbox boxed primitives", () => {
    expect(Tuple(Object(true))).toRecordIsEqual(Tuple(true));
    expect(Tuple(Object(1))).toRecordIsEqual(Tuple(1));
    expect(Tuple(Object("test"))).toRecordIsEqual(Tuple("test"));

    const sym = Symbol();
    expect(Tuple(Object(sym))).toRecordIsEqual(Tuple(sym));
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

test("Tuple function creates frozen objects with a non-{enumerable/configurable/writable} length property", () => {
    expect(Object.isFrozen(Tuple(1,2,3))).toBe(true);

    expect(Object.getOwnPropertyDescriptor(Tuple(1,2,3), "length")).toEqual({
        configurable: false,
        enumerable: false,
        value: 3,
        writable: false,
    });

    expect(Object.isFrozen(Tuple(1,2,Tuple(3))[2])).toBe(true);
});
test("Tuples are iterable", () => {
    expect(Array.from(Tuple(1,2,3))).toEqual([1,2,3]);

    const tuple = Tuple(1,2,3);
    const iterator = tuple[Symbol.iterator]();

    expect(iterator.next()).toEqual({ value: 1, done: false });
    expect(iterator.next()).toEqual({ value: 2, done: false });
    expect(iterator.next()).toEqual({ value: 3, done: false });
    expect(iterator.next()).toEqual({ value: undefined, done: true });
});

test("createTupleFromIterableObject only accepts iterable arguments", () => {
    expect(() => createTupleFromIterableObject({})).toThrow();
    expect(() => createTupleFromIterableObject(true)).toThrow();
    expect(() => createTupleFromIterableObject("test")).toThrow();
    expect(() => createTupleFromIterableObject(1)).toThrow();
    expect(() => createTupleFromIterableObject(Symbol())).toThrow();

    expect(createTupleFromIterableObject([1,2,3])).toRecordIsEqual(Tuple(1,2,3));

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
    expect(createTupleFromIterableObject(iterable)).toRecordIsEqual(Tuple(1,2,3,4));
});

test("tuples with the same structural equality will be equal", () => {
    expect(Tuple(1,2,3)).toRecordIsEqual(Tuple(1,2,3));
    expect(Tuple(1,2,(Tuple(4,5)))).toRecordIsEqual(Tuple(1,2,Tuple(4,5)));

    expect(Tuple(1,2,3)).not.toRecordIsEqual(Tuple(4,5,6));
});

test("Tuple equality handles -/+0 and NaN correctly", () => {
    expect(Tuple(-0)).toRecordIsEqual(Tuple(-0));
    expect(Tuple(+0)).toRecordIsEqual(Tuple(+0));
    expect(Tuple(-0)).not.toRecordIsEqual(Tuple(+0));
    expect(Tuple(+0)).not.toRecordIsEqual(Tuple(-0));
    expect(Tuple(NaN)).toRecordIsEqual(Tuple(NaN));

    expect(Tuple(-0)).toRecordStrictEqual(Tuple(-0));
    expect(Tuple(+0)).toRecordStrictEqual(Tuple(+0));
    expect(Tuple(-0)).toRecordStrictEqual(Tuple(+0));
    expect(Tuple(+0)).toRecordStrictEqual(Tuple(-0));
    expect(Tuple(NaN)).not.toRecordStrictEqual(Tuple(NaN));
});

test("Tuple.from", () => {
    expect(Tuple.from([1,2,3])).toRecordIsEqual(Tuple(1,2,3));
    expect(Tuple.from([1,2,3], (v) => v + 1)).toRecordIsEqual(Tuple(2,3,4));

    // ensure that thisArg is correctly used for the mapFn
    const rec = Record({ a: 1 });
    expect(Tuple.from([1], function(v) { return this; }, rec)[0]).toBe(rec);
});
test("Tuple.of", () => {
    expect(Tuple.of(1,2,3)).toRecordIsEqual(Tuple(1,2,3));
});
// TODO: Tuple prototype methods
