import { Record, Tuple } from "record-and-tuple-polyfill";

test("Record function throws when presented a non-plain object", () => {
    expect(() => Record(true)).toThrow();
    expect(() => Record(1)).toThrow();
    expect(() => Record(BigInt(1))).toThrow();
    expect(() => Record("test")).toThrow();
    expect(() => Record(Symbol())).toThrow();
    expect(() => Record(function() {})).toThrow();
    expect(() => Record(null)).toThrow();
    expect(() => Record(undefined)).toThrow();
});

test("records cannot contain objects", () => {
    expect(() => Record({ a: {} })).toThrow();
    expect(() => Record({ a: [] })).toThrow();
    expect(() => Record({ a: function() {} })).toThrow();
});

test("records unbox boxed primitives", () => {
    expect(Record({ a: Object(true) })).toRecordIsEqual(Record({ a: true }));
    expect(Record({ a: Object(1) })).toRecordIsEqual(Record({ a: 1 }));
    expect(Record({ a: Object("test") })).toRecordIsEqual(Record({ a: "test" }));

    const sym = Symbol();
    expect(Record({ a: Object(sym) })).toRecordIsEqual(Record({ a: sym }));
});

test("records are correctly identified as records", () => {
    expect(Record.isRecord(Record({ a: 1 }))).toBe(true);
    expect(Record.isRecord(Tuple(1,2,3))).toBe(false);
    expect(Record.isRecord({ a: 1 })).toBe(false);
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
    expect(Record.keys(Record({ a: 1, b: 2 }))).toRecordIsEqual(Tuple("a", "b"));
    expect(Record.keys(Record({ b: 1, a: 2 }))).toRecordIsEqual(Tuple("a", "b"));
    expect(Record.keys(Record({ b: 1, a: 2, 0: 3 }))).toRecordIsEqual(Tuple("0", "a", "b"));
    expect(Record.keys(Record({ b: 1, a: 2, 0: 3 }))).toRecordIsEqual(Tuple("0", "a", "b"));
});

test("records with the same structural equality will be equal", () => {
    expect(Record({ a: 1 })).toRecordIsEqual(Record({ a: 1 }));
    expect(Record({ a: 1, b: 2 })).toRecordIsEqual(Record({ a: 1, b: 2 }));
    expect(Record({ b: 2, a: 1 })).toRecordIsEqual(Record({ a: 1, b: 2 }));
    expect(Record({ 0: 0, 1: 1, 2: 2 })).toRecordIsEqual(Record({ 1: 1, 0: 0, 2: 2 }));
    expect(Record({ a: Record({ b: 2 }) })).toRecordIsEqual(Record({ a: Record({ b: 2 }) }));

    expect(Record({ a: 1 })).not.toRecordIsEqual(Record({ a: 2 }));
    expect(Record({ a: 1 })).not.toRecordIsEqual(Record({ b: 1 }));
});

test("Record equality handles -/+0 and NaN correctly", () => {
    expect(Record({ a: -0 })).toRecordIsEqual(Record({ a: -0 }));
    expect(Record({ a: +0 })).toRecordIsEqual(Record({ a: +0 }));
    expect(Record({ a: -0 })).not.toRecordIsEqual(Record({ a: +0 }));
    expect(Record({ a: +0 })).not.toRecordIsEqual(Record({ a: -0 }));
    expect(Record({ a: NaN })).toRecordIsEqual(Record({ a: NaN }));

    expect(Record({ a: -0 })).toRecordStrictEqual(Record({ a: -0 }));
    expect(Record({ a: +0 })).toRecordStrictEqual(Record({ a: +0 }));
    expect(Record({ a: -0 })).toRecordStrictEqual(Record({ a: +0 }));
    expect(Record({ a: +0 })).toRecordStrictEqual(Record({ a: -0 }));
    expect(Record({ a: NaN })).not.toRecordStrictEqual(Record({ a: NaN }));
});

test("Record.assign", () => {
    expect(() => Record.assign(Record({ a: 1}), { b: 2 })).toThrow();
    expect(() => Record.assign({ b: 2 }, Record({ a: 1}))).toThrow();

    expect(Record.assign(Record({ a: 1}), Record({ b: 2 })))
		.toRecordIsEqual(Record({ a: 1, b: 2 }));
	expect(Record.assign(Record({ a: 1}), Record({ a: 2 })))
		.toRecordIsEqual(Record({ a: 2 }));
});
test("Record.entries", () => {
    expect(Record.entries(Record({ a: 1 }))).toRecordIsEqual(Tuple(Tuple("a", 1)));
    expect(Record.entries(Record({ a: 1, b: 2 }))).toRecordIsEqual(Tuple(Tuple("a", 1), Tuple("b", 2)));
    expect(Record.entries(Record({ b: 2, a: 1 }))).toRecordIsEqual(Tuple(Tuple("a", 1), Tuple("b", 2)));
});
test("Record.fromEntries", () => {
    expect(Record.fromEntries([["a", 1], ["b", 2]])).toRecordIsEqual(Record({ a: 1, b: 2 }));
    expect(Record.fromEntries([["b", 2], ["a", 1]])).toRecordIsEqual(Record({ a: 1, b: 2 }));
});
test("Record.keys", () => {
    expect(Record.keys(Record({ a: 1, b: 2 }))).toRecordIsEqual(Tuple("a", "b"));
    expect(Record.keys(Record({ b: 1, a: 2 }))).toRecordIsEqual(Tuple("a", "b"));
});
test("Record.values", () => {
    expect(Record.values(Record({ a: 1, b: 2 }))).toRecordIsEqual(Tuple(1, 2));
    expect(Record.values(Record({ b: 1, a: 2 }))).toRecordIsEqual(Tuple(2, 1));
});
