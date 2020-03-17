import { isEqual, strictEqual } from "record-and-tuple-polyfill";
const diff = require("jest-diff");

expect.extend({
    toRecordIsEqual(received, expected) {
        const options = {
            comment: "Record/Tuple equality",
            isNot: this.isNot,
            promise: this.promise,
        };

        const pass = isEqual(received, expected);

        const message = pass
            ? () =>
                this.utils.matcherHint('toRecordIsEqual', undefined, undefined, options) +
                '\n\n' +
                `Expected: not ${this.utils.printExpected(expected)}\n` +
                `Received: ${this.utils.printReceived(received)}`
            : () => {
                const diffString = diff(expected, received, {
                    expand: this.expand,
                });
                return (
                    this.utils.matcherHint('toRecordIsEqual', undefined, undefined, options) +
                    '\n\n' +
                    (diffString && diffString.includes('- Expect')
                        ? `Difference:\n\n${diffString}`
                        : `Expected: ${this.utils.printExpected(expected)}\n` +
                        `Received: ${this.utils.printReceived(received)}`)
                );
            };

        return { actual: received, message, pass };
    },
    toRecordStrictEqual(received, expected) {
        const options = {
            comment: "Record/Tuple equality",
            isNot: this.isNot,
            promise: this.promise,
        };

        const pass = strictEqual(received, expected);

        const message = pass
            ? () =>
                this.utils.matcherHint('toRecordStrictEqual', undefined, undefined, options) +
                '\n\n' +
                `Expected: not ${this.utils.printExpected(expected)}\n` +
                `Received: ${this.utils.printReceived(received)}`
            : () => {
                const diffString = diff(expected, received, {
                    expand: this.expand,
                });
                return (
                    this.utils.matcherHint('toRecordStrictEqual', undefined, undefined, options) +
                    '\n\n' +
                    (diffString && diffString.includes('- Expect')
                        ? `Difference:\n\n${diffString}`
                        : `Expected: ${this.utils.printExpected(expected)}\n` +
                        `Received: ${this.utils.printReceived(received)}`)
                );
            };

        return { actual: received, message, pass };
    },
});
