function _freezeRecord(value) { if (typeof value !== "object") { throw new Error("invalid value, expected object"); } const keys = Object.keys(value).sort(); for (const key of keys) { const v = value[key]; if (typeof v === "object" && !Object.isFrozen(v)) { throw new Error("TypeError: cannot use an object as a value in a record"); } } return Object.freeze(value); }

const record = _freezeRecord({
  a: 1
});

const recordTwo = _freezeRecord({
  a: 2
});