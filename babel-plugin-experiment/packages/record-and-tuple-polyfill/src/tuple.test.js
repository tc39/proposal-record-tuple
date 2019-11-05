import { Record, Tuple, createTupleFromIterableObject, equal } from "record-and-tuple-polyfill";

test("Tuple creates an array with the provides arguments as elements", () => {
    expect(Tuple(1,2,3)).toStrictEqual([1,2,3]);

    const sym = Symbol();
    expect(Tuple(true, false, "test", sym, null, undefined))
        .toStrictEqual([true, false, "test", sym, null, undefined]);

    expect(Tuple(1, 2, Tuple(3, 4))).toStrictEqual([1,2,[3,4]]);
});

test("tuples cannot contain objects", () => {
    expect(() => Tuple([])).toThrow();
    expect(() => Tuple({})).toThrow();
    expect(() => Tuple(function() {})).toThrow();
});

test("tuples unbox boxed primitives", () => {
    expect(Tuple(Object(true))[0]).toBe(true);
    expect(Tuple(Object(1))[0]).toBe(1);
    expect(Tuple(Object("test"))[0]).toBe("test");

    const sym = Symbol();
    expect(Tuple(Object(sym))[0]).toBe(sym);
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

    expect(createTupleFromIterableObject([1,2,3])).toStrictEqual([1,2,3]);

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
    expect(createTupleFromIterableObject(iterable)).toStrictEqual([1,2,3,4]);
});

test("tuples with the same structural equality will be equal", () => {
    expect(equal(Tuple(1,2,3), Tuple(1,2,3))).toBe(true);
    expect(equal(Tuple(1,2,(Tuple(4,5))), Tuple(1,2,Tuple(4,5)))).toBe(true);

    expect(equal(Tuple(1,2,3), Tuple(4,5,6))).toBe(false);
});

test("Tuple.from", () => { /*TODO*/ });
test("Tuple.of", () => { /*TODO*/ });
// TODO: Tuple prototype methods
