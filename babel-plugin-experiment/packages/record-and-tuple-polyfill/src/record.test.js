import { Record, Tuple, equal } from "record-and-tuple-polyfill";

test("Record function throws when presented a non-plain object", () => {
    expect(() => Record(true)).toThrow();
    expect(() => Record(1)).toThrow();
    //expect(() => Record(1n)).toThrow(); // bigint
    expect(() => Record("test")).toThrow();
    expect(() => Record(Symbol())).toThrow();
    expect(() => Record(function() {})).toThrow();
    expect(() => Record(null)).toThrow();
    expect(() => Record(undefined)).toThrow();
});

test("records cannot contain objects", () => {
    expect(() => Record({ a: {} })).toThrow();
    expect(() => Record({ a: function() {} })).toThrow();
});

test("records unbox boxed primitives", () => {
    expect(Record({ a: Object(true) })).toStrictEqual({ a: true });
    expect(Record({ a: Object(1) })).toStrictEqual({ a: 1 });
    //expect(Record({ a: Object(1n) })).toStrictEqual({ a: 1 }); // bigint
    expect(Record({ a: Object("test") })).toStrictEqual({ a: "test" });

    const sym = Symbol();
    expect(Record({ a: Object(sym) })).toStrictEqual({ a: sym });
});

test("records are correctly identified as records", () => {
    expect(Record.isRecord(Record({ a: 1 }))).toBe(true);
    expect(Record.isRecord({ a: 1 })).toBe(false);
    //expect(Record.isRecord({ a: 1n })).toBe(false); // bigint
    expect(Record.isRecord(function() {})).toBe(false);
    expect(Record.isRecord(true)).toBe(false);
    expect(Record.isRecord(1)).toBe(false);
    expect(Record.isRecord("test")).toBe(false);
    expect(Record.isRecord(Symbol())).toBe(false);
});

test("Record function creates deeply frozen objects", () => {
    expect(Object.isFrozen(Record({ a: 1 }))).toBe(true);
    expect(Object.isFrozen(Record({ a: Record({ b: 2 }) }).b)).toBe(true);
});

test("Record function creates objects with keys in sorted order", () => {
    expect(Object.keys(Record({ a: 1, b: 2 }))).toStrictEqual(["a", "b"]);
    expect(Object.keys(Record({ b: 1, a: 2 }))).toStrictEqual(["a", "b"]);
    expect(Object.keys(Record({ b: 1, a: 2, 0: 3 }))).toStrictEqual(["0", "a", "b"]);
    expect(Object.keys(Record({ b: 1, a: 2, 0: 3 }))).toStrictEqual(["0", "a", "b"]);

    const sym1 = Symbol();
    const sym2 = Symbol();
    expect(Object.getOwnPropertySymbols(Record({ [sym1]: 1, [sym2]: 2 }))).toStrictEqual([sym1, sym2]);
    // TODO: break this test? Currently don't know how, as there is no observable ordering
    // for symbols
    expect(Object.getOwnPropertySymbols(Record({ [sym2]: 1, [sym1]: 2 }))).toStrictEqual([sym2, sym1]);
});

test("records with the same structural equality will be equal", () => {
    expect(equal(Record({ a: 1 }), Record({ a: 1 }))).toBe(true);
    expect(equal(Record({ a: 1, b: 2 }), Record({ a: 1, b: 2 }))).toBe(true);
    expect(equal(Record({ b: 2, a: 1 }), Record({ a: 1, b: 2 }))).toBe(true);
    expect(equal(Record({ 0: 0, 1: 1, 2: 2 }), Record({ 1: 1, 0: 0, 2: 2 }))).toBe(true);
    expect(equal(Record({ a: Record({ b: 2 }) }), Record({ a: Record({ b: 2 }) }))).toBe(true);

    const sym1 = Symbol();
    const sym2 = Symbol();
    expect(equal(Record({ [sym1]: 1, [sym2]: 2 }), Record({ [sym2]: 2, [sym1]: 1 }))).toBe(true);


    expect(equal(Record({ a: 1 }), Record({ a: 2 }))).toBe(false);
    expect(equal(Record({ a: 1 }), Record({ b: 1 }))).toBe(false);
    expect(equal(Record({ [sym1]: 1 }), Record({ [sym2]: 1 }))).toBe(false);
});

test("Record.assign", () => { /*TODO*/ });
test("Record.entries", () => { /*TODO*/ });
test("Record.fromEntries", () => { /*TODO*/ });
test("Record.keys", () => { /*TODO*/ });
test("Record.values", () => { /*TODO*/ });
test("Record.parse", () => { /*TODO*/ });
