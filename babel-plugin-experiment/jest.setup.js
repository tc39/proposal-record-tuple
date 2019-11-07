import { equal } from "record-and-tuple-polyfill";
import diff from "jest-diff";

expect.extend({
    toRecordEqual(received, expected) {
        const options = {
            comment: "Record/Tuple equality",
            isNot: this.isNot,
            promise: this.promise,
        };

        const pass = equal(received, expected);

        const message = pass
            ? () =>
                this.utils.matcherHint('toRecordEqual', undefined, undefined, options) +
                '\n\n' +
                `Expected: not ${this.utils.printExpected(expected)}\n` +
                `Received: ${this.utils.printReceived(received)}`
            : () => {
                const diffString = diff(expected, received, {
                    expand: this.expand,
                });
                return (
                    this.utils.matcherHint('toRecordEqual', undefined, undefined, options) +
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
