import {
    equal,
    Record,
    Tuple,
} from "record-and-tuple-polyfill";

function showEqual(a, b) {
    console.log(`${JSON.stringify(a)} === ${JSON.stringify(b)}`);
    console.log(`  ${equal(a, b)}`);
}

showEqual(#{ a: 1 }, #{ a: 1 });
showEqual(#[1, 2, 3], #[1, 2, 3]);

const rec1 = #{ a: 1, b: 2 };
const rec2 = #{ b: 2, a: 1 };
showEqual(rec1, rec2);

const rec3 = #{ a: 2, b: 2 };
const rec4 = #{ ...rec1, a: 2 };
showEqual(rec3, rec4);
