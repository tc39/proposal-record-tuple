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
    expect(() => #{ a: {} }).toThrow();
    expect(() => #{ a: function() {} }).toThrow();
});

test("records unbox boxed primitives", () => {
    expect(#{ a: Object(true) }).toStrictEqual({ a: true });
    expect(#{ a: Object(1) }).toStrictEqual({ a: 1 });
    //expect(#{ a: Object(1n) }).toStrictEqual({ a: 1 }); // bigint
    expect(#{ a: Object("test") }).toStrictEqual({ a: "test" });

    const sym = Symbol();
    expect(#{ a: Object(sym) }).toStrictEqual({ a: sym });
});

test("records are correctly identified as records", () => {
    expect(Record.isRecord(#{ a: 1})).toBe(true);
    expect(Record.isRecord({ a: 1 })).toBe(false);
    expect(Record.isRecord(function() {})).toBe(false);
    expect(Record.isRecord(true)).toBe(false);
    expect(Record.isRecord(1)).toBe(false);
    expect(Record.isRecord("test")).toBe(false);
    expect(Record.isRecord(Symbol())).toBe(false);
});
