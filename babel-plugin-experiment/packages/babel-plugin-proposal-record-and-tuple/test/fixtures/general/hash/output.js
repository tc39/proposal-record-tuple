"use strict";

var _createTupleFromArray = require("record-and-tuple-polyfill").createTupleFromArray;

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

const t1 = _createTupleFromArray([1, 2, 3]);

const t2 = _createTupleFromArray([1, _createTupleFromArray([2, 3, _createTupleFromArray([4]), 5]), 6]);
