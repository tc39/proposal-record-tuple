"use strict";

var _createTupleFromIterableObject = require("record-and-tuple-polyfill").createTupleFromIterableObject;

var _createRecordFromObject = require("record-and-tuple-polyfill").createRecordFromObject;

const r1 = _createRecordFromObject({
  a: 1,
  b: 2,
  c: 3
});

const r2 = _createRecordFromObject({
  a: _createRecordFromObject({
    b: _createRecordFromObject({
      c: 123
    }),
    d: 456
  }),
  e: 789
});

const t1 = _createTupleFromIterableObject([]);

const t2 = _createTupleFromIterableObject([1, 2, 3]);

const t3 = _createTupleFromIterableObject([1, _createTupleFromIterableObject([2, 3, _createTupleFromIterableObject([4]), 5]), 6]);
