All credit for this idea goes to Lee Byron @leebyron!

The additional syntax below can be introduced as a follow up proposal.

# Deep property definitions for Records

Currently, only spread syntax can be used to manipulate records, via creating a new record
with the same properties as the old record, overwriting with the properties specified in the new record literal.

If deep path updates are required (updating a value nested deeply inside a record), then the syntax is
cumbersome, because a spread is needed at each level of nesting. As a way to solve this problem, a deep path
property definition syntax can be introduced for records, which allows the user to "copy" records and update deeply nested
properties within them without cumbersome syntax.

These examples demonstrate a possible syntax for deep property definitions on records.

```js
const one = #{
    a: 1,
    b: {
        c: {
            d: 2,
            e: 3,
        }
    }
};
const two = #{
    b.c.d: 4,
    ...one,
};

console.log(one.b.c.d); // 2
console.log(two.b.c.d); // 4
```

Traversal through tuples:

```js
const one = #{
    a: 1,
    b: #{
        c: #[2, 3, 4, [5, 6]]
    },
}
const two = #{
    b.c[3][1]: 7,
    ...one,
};

console.log(two.b.c); // #[2, 3, 4, [5, 7]]
```

Computed properties:

```js
const one = #{
    a: {
        b: {
            c: {
                foo: "bar",
            }
        }
    },
    d: {
        bill: "ted",
    },
};

const two = #{
    ["a"]["b"]["c"]["foo"]: "baz",
    ...one,
};

// can be mixed
const three = #{
    ["a"].b["c"].foo: "baz",
    ...one,
};
```

Question! What happens if the deep path does not exist in the value that is being set deeply?

Example:

```js
const one = { a: 1 };

const two = { b.c: 2, ...one };

// Does this fail, or create a record that looks like:
// #{ a: 1, b: { c: 2 } }
```
