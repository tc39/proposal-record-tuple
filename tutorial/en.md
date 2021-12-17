# Record & Tuple Tutorial

> **🚧 Work in progress 🚧**: this document is a work in progress. The format and writing-style of the document will change as well as the examples. Please do not take the code snippets as a sign of best practice.

This tutorial will guide you through the [Record & Tuple ECMAScript proposal][rt].

[rt]: https://github.com/tc39/proposal-record-tuple

---

# Table of contents

- [Introduction](#introduction)
- [Compound values](#compound-values)
- [Managing State with Record & Tuple](#managing-state-with-record--tuple)
- [Keeping track of objects in Record & Tuple](#keeping-track-of-objects-in-record--tuple)
- [Conclusion](#conclusion)

---

# Introduction

Hello and thanks for opening this tutorial! The goal of this page is to introduce you to Record & Tuple, an experimental feature of JavaScript.

In this tutorial, you'll find multiple examples of programs that can be written using this feature.

## What is `Record & Tuple`?

A record is analogous to an Object in JavaScript with the exception that the Record is not an Object but a deeply immutable primitive value.
Likewise, a Tuple is like an Array but is a deeply immutable primitive value.

### Immutability

What do we mean by `deeply immutable primitive value`?

- Primitive value: A string, a number or a symbol are primitive values in JavaScript. These values are *in general* represented as low-level values attached to the program stack.
- Deeply immutable: For a value to be deeply immutable, it must be immutable and all of it's subelements must also be deeply immutable. All JavaScript primitive values, including `Record & Tuple`, are deeply immutable, but only records and tuples have "subelements". Records and tuples can only contain primitive values such as strings, numbers, symbols or records and tuples, which makes them deeply immutable by definition.

One could say that Record & Tuple can be described as [compound primitive values][2ality].

[2ality]: https://2ality.com/2020/05/records-tuples-first-look.html

#### Examples

Let's start by representing a wallet in a Tuple composed of different cards represented by Records:

```js
const drivingLicence = #{
    country: "UK",
    number: 123456789870,
};
const creditCard = #{
    type: "Amex",
    number: 378282246310005,
};
const debitCard = #{
    type: "Visa",
    number: 4242424242424242,
};
const wallet = #[
    drivingLicence,
    creditCard,
    debitCard,
];
```

In order to create a Record or a Tuple, just use an Object or an Array literal and prefix it with an hash `#` character.

> Note: You can't put objects in your wallet as your wallet is a Tuple!
>
> ```js
> const milesCard = {
>     rank: "gold",
>     numero: 123456,
> };
> const wallet = #[
>     milesCard, // TypeError
> ];
> ```

### Comparisons

The main advantage of this approach, excluding the immutability constraint, is to guarantee value equality instead of identity equality.

This means that you don't need to worry about which Record is being manipulated, where has it been created, etc... If its values are identical, two Records are equal. You can therefore use the `===` comparison to know if both records are equal.

#### Example

```js
const drivingLicence = #{
    country: "UK",
    number: 123456789870,
};
const milesCard = {
    rank: "gold",
    numero: 123456,
};

console.log(drivingLicence === #{
    country: "UK",
    number: 123456789870,
}); // => true
console.log(milesCard === {
    rank: "gold",
    numero: 123456,
}); // => false
```

As we can see, records are compared by value instead of by identity as seen with the `milesCard`.

## Introduction, looking back!

We finally have a quick idea of what Record & Tuple are for but it might be a non-trivial to know what they would be used for... We are going to explore that very soon in the next part, starting with compound values!

---

# Compound values

## Using strings as compound values

What we're going to do here is already possible with strings. However, the ergonomics are not great.

Let's say we want to index items in a sparse grid and be able to look them up fast. We're going to try to encode coordinates in strings:

```js
const grid = {
    "0:0": "player",
    "3:5": "enemy",
    "0:1": "wall",
};

console.log("at 0:0", grid["0:0"]); // player
```

This seems to do what we want, however, it is really easy to make a mistake:

```js
const grid = {
    "0:0": "player",
    "3:5": "enemy",
    "0:1": "wall",
};

console.log("at 0:0x0", grid["0:0x0"]); // undefined
```

Changing our number representation made it impossible for us to find the location, yet, we know that `0 === 0x0`.

Strings let us compound values together but will leave us with their arbitrary constraints.

Let's look at another way we could have done this:


```js
const grid = {
    '{"x":0,"y":0}': "player",
    '{"x":3,"y":5}': "enemy",
    '{"x":0,"y":1}': "wall",
};

console.log("at 0:0x0", grid[JSON.stringify({
    x: 0,
    y: 0x0,
})]); // player
```

Great! this works! All we have to do is stringifying values and now we can compare things as we want. There are a few caveats though...


```js
const grid = {
    '{"x":0,"y":0}': "player",
    '{"x":3,"y":5}': "enemy",
    '{"x":0,"y":1}': "wall",
};

console.log("at 0:0x0", grid[JSON.stringify({
    y: 0x0,
    x: 0,
})]); // undefined
```

We're not getting what we expect because the order of properties matters in JSON serialization.

## Compounding values into another value with tuples

Fortunately we can solve those issues with Records and Tuples. Like strings, we can concatenate together some values and use them to do a bunch of things such as comparing their equality together but also using them to lookup keys. Back to our example but with tuples:

```js
// We use an ES Map as they can have tuples as key values
const grid = new Map([
    [#[0, 0], "player"],
    [#[3, 5], "enemy"],
    [#[0, 1], "wall"],
]);

console.log("at 0:0", grid.get(#[0, 0])); // player
console.log("at 0:0", grid.get(#[0, 0x0])); // player
```

Amazing! This works as expected! The difference between a tuple and a string is that a string will only keep the sequence of character information, so if one char changes, everything is off. However, the tuple will keep the actual sequence of primitive values so if all the values of the tuple are identical, everything will work as expected.

Now what is interesting is that you can access the internals of the tuple in a way you couldn't before and use that for equality:

```js
function isAtOrigin(coordinate) {
    return coordinate === #[0, 0];
}

const c1 = #[1, 2];
const c2 = #[c1[0] - 1, c1[1] * 2 - 4];
console.log("c1 at origin?", isAtOrigin(c1)); // false
console.log("c2 at origin?", isAtOrigin(c2)); // true
```

Finally, there is no need to compound values of the same type, tuples can also store a sequence of different types:

```js
// Store everything!
const crazyTuple = #["hello", 123, Symbol(), #{}, #[]];
// ... except objects
const tooCrazyTuple = #[{}]; // TypeError!
```

## Compounding values into another value with records

Now let's take a quick look at records. Records are like tuples but have string-keys like objects, instead of an ordered sequence of elements like a tuple (or array). Let's name our axes from our previous example:


```js
// We use an ES Map as they can have tuples as key values
const grid = new Map([
    [#{x:0, y:0}, "player"],
    [#{x:3, y:5}, "enemy"],
    [#{x:0, y:1}, "wall"],
]);

console.log("at 0:0", grid.get(#{x:0, y:0})); // player
console.log("at 0:0", grid.get(#{x:0, y:0x0})); // player
console.log("at 0:0", grid.get(#{y:0x0, x:0})); // player
```

Note the last `console.log`; the order did not matter, unlike what we've seen when converting objects to JSON.

The same operations from before are also possible:


```js
function isAtOrigin(coordinate) {
    return coordinate === #{x:0, y:0};
}

const c1 = #{x:1, y:2};
const c2 = #{x: c1.x - 1, y: c1.y * 2 - 4 };
console.log("c1 at origin?", isAtOrigin(c1)); // false
console.log("c2 at origin?", isAtOrigin(c2)); // true
```

And you can store any other value in a record:


```js
// Store everything!
const crazyRecord = #{
    str: "hello",
    nbr: 123,
    sym: Symbol(),
    rec: #{},
    tup: #[],
};
// ... except objects
const tooCrazyRecord = #{ obj: {} }; // TypeError!
```

## Compound values, looking back!

By this point, you should get a pretty good idea of how Record and Tuple behave. They have some nice equality properties that let us replace strings in some places. That being said, this is only a small use case for them, next, we're going to look at how we can do some state management using Record & Tuple.

---

# Managing State with Record & Tuple

Record & Tuple are great for representing state (especially shared state). For instance you could use Record & Tuple to manage your [Redux] state just like you would use [Immutable.js] or another immutable library.

[Redux]: https://redux.js.org/
[Immutable.js]: https://immutable-js.github.io/immutable-js/

## Representing immutable state

Let's start with a simple example where you store some shared state and use some functions able to lookup that state:

```js
let appState = #{
    // a list of strings representing the name of each user for each visit
    userByVisit: #[
        "alice",
        "mike",
        "alice",
    ],
    // a mapping of user to their number of visits
    visitsByUser: #{
        alice: 2,
        mike: 1,
    },
};

function getNbVisits() {
    // accessing a record and a tuple is the same as accessing objects and arrays
    return appState.userByVisit.length;
}

function getNbVisitByUser(username) {
    // computed properties work as you would expect them to!
    return appState.visitsByUser[username];
}

console.log("nb visits", getNbVisits()); // 3
console.log("nb visits by alice", getNbVisitByUser("alice")); // 2
```

As we can see we have some denormalized state that is useful for the kind of lookups we want to do. Maintaining that state can be hard if anything can mutate it. This can happen in large codebases with mutable data structures. Here, we can't change the data structure so we have to mutate the state atomically:

```js
let appState = #{
    userByVisit: #[],
    visitsByUser: #{},
};

function getNbVisits() {
    return appState.userByVisit.length;
}

function getNbVisitByUser(username) {
    return appState.visitsByUser[username];
}

function visit(username) {
    // we swap our state with the new one
    appState = #{
        // We spread-append to return the new appState.userByVisit record
        // after pushing a new element to it
        userByVisit: appState.userByVisit.pushed(username),
        visitsByUser: #{
            // We use the spread operation to put back the keys
            // that we had originally
            ...appState.visitsByUser,
            // But for the one that we need to change, we override it with
            // a new incremented value
            [username]: (appState.visitsByUser[username] || 0) + 1,
        }
    };
}

visit("alice");
visit("mark");
visit("alice");

console.log("nb visits", getNbVisits()); // 3
console.log("nb visits by alice", getNbVisitByUser("alice")); // 2
```


> Note: We use an assignment to reassign `appState`; this is fine because the variable can have its value changed unlike the contents of a record. You can try doing an assignment to a record's property, but it will fail:
>
> ```js
> let appState = #{
>     userByVisit: #[],
>     visitsByUser: #{},
> };
> appState.userByVisit.push("jose"); // TypeError
> appState.visitsByUser["jose"] = 1; // TypeError (if you remove the line before)
> ```
> Note: using spreads to do deep reassignments can be a cumbersome task. That is why, once [Deep Path Properties for Record] advances more stages, we'll be able to feature it in this tutorial!

[Deep Path Properties for Record]: https://github.com/tc39/proposal-deep-path-properties-for-record/

## Keeping track of immutable state and comparing it

Now that we have a good idea of how we want to maintain our state, we can immediately start using more of the immutability property: we can keep around copies of our state so that we can restore it or debug it later:

```js
// We store our history of states in a normal array
const appStateHistory = [#{
    userByVisit: #[],
    visitsByUser: #{},
}];

// utility to get the last state in our history
function getLastState() {
    return appStateHistory[appStateHistory.length - 1];
}

function getNbVisits(appState = getLastState()) {
    return appState.userByVisit.length;
}

function getNbVisitByUser(username, appState = getLastState()) {
    return appState.visitsByUser[username];
}

function visit(username) {
    const last = getLastState();
    // we push to the array now
    appStateHistory.push(#{
        userByVisit: #[...last.userByVisit, username],
        visitsByUser: #{
            ...last.visitsByUser,
            [username]: (last.visitsByUser[username] || 0) + 1,
        }
    });
}

visit("alice");
visit("mark");
visit("alice");

console.log("nb visits", getNbVisits()); // 3
console.log("nb visits by alice", getNbVisitByUser("alice")); // 2
// let's travel in time!
console.log("nb visits (at state 1)", getNbVisits(appStateHistory[1])); // 1
console.log(
    "nb visits by alice (at state 1)",
    getNbVisitByUser("alice", appStateHistory[1])
); // 1
```

Now that we can keep track of the past, let's see how we can use it with comparison to be more efficient. We can compose two separate pieces of application state, and use the equality of records to check if we need to re-render the "application" components that depend on that substate.

```js
const appStateHistory = [#{
    profile: #{
        username: "alice",
        fullName: "Alice Ritchie",
    },
    status: #{
        message: "Feeling sleepy",
        emotion: "zZz",
    },
}];


function getLastState() {
    return appStateHistory[appStateHistory.length - 1];
}
// utility to get the state coming before our last state in history
// be careful! it can be undefined
function getLastLastState() {
    return appStateHistory[appStateHistory.length - 2];
}

function updateStatus(message, emotion) {
    const last = getLastState();
    appStateHistory.push(#{
        ...last,
        status: #{ message, emotion },
    });
}

function updateFullName(fullName) {
    const last = getLastState();
    appStateHistory.push(#{
        ...last,
        profile: #{
            ...last.profile,
            fullName,
        },
    });
}

function getStatusString(appState = getLastState()) {
    return `Status: ${appState.status.message} (${appState.status.emotion})`;
}

function getProfileString(appState = getLastState()) {
    return `Profile: ${appState.profile.fullName} (${appState.profile.username})`;
}

// Simulate rendering some UI (by printing in the console)
function render(prevState = getLastLastState(), newState = getLastState()) {
    console.log("=== Render Start ===");
    // Only update the profile UI if it changed!
    if (!prevState || prevState.profile !== newState.profile) {
        console.log(getProfileString());
    }
    // Only update the status UI if it changed!
    if (!prevState || prevState.status !== newState.status) {
        console.log(getStatusString());
    }
    console.log("=== Render End ===");
}

render(); // Will show both Profile and Status strings
updateStatus("Feeling Energetic!", ":D");
render(); // Will only show Status string
updateFullName("Allie Ri");
render(); // Will only show Profile string
```

Now we can choose to only perform expensive operations (like updating our UI) when the piece of state we're looking at changed!

## State management, looking back!

We only scratched the surface of what is possible! As we've seen before you might want to use a state management solution like [Redux] to do this. However, [Redux] is not meant to give you comparison operations, you usually have to do it yourself and it is hard to get it right. With Record & Tuple, comparison is performed by the JavaScript engine so you don't have to do it!

---

# Keeping track of objects in Record & Tuple

As we've seen multiple times, Record and Tuple will give you the dreaded `TypeError` every time you need to store an object in them.

However, it's often useful to associate mutable objects to an otherwise immutable data structure: with the changes planned to be introduced in [Symbols as WeakMap keys](https://github.com/tc39/proposal-symbols-as-weakmap-keys), you can associate symbols that you can put in the Record & Tuple structure while being able to dereference them back from a WeakMap.

Let's now imagine we have an app state that requires us to keep track of a DOM node:

```js
let appState = #{
    comicSansNodes: #[
        document.body, // TypeError! DOM elements are objects
    ],
};
```

What we can do is modify our example so that the mutable parts are referenced with a WeakMap:

```js
// temporary: until WeakMaps can contain symbols as keys, we need to swap them for Maps
globalThis.WeakMap = globalThis.Map;

const bodyRef = Symbol("document.body");
const RefsRegistry = new WeakMap([[bodyRef, document.body]]);

let appState = #{
    comicSansNodes: #[
        bodyRef,
    ],
};
```

The Symbol constructor acts as an opaque reference to replace the `document.body` object, so that `appState` doesn't _really_ contain an object. When we need to get the object corresponding to a symbol, we can get it in the WeakMap:

```js
// temporary: until WeakMaps can contain symbols as keys, we need to swap them for Maps
globalThis.WeakMap = globalThis.Map;

const RefsRegistry = new WeakMap();

let appState = #{ comicSansNodes: #[] };

function addComicSansNode(domNode) {
    const domNodeRef = Symbol("domNode");
    RefsRegistry.set(domNodeRef, domNode);
    appState = #{
        comicSansNodes: #[...appState.comicSansNodes, domNodeRef],
    };
}

function makeItComic() {
    for (const domNodeRef of appState.comicSansNodes) {
        // we need to lookup the object corresponding to our symbol
        const domNode = RefsRegistry.get(domNodeRef);
        domNode.style.fontFamily = '"Comic Sans MS"';
    }
}
document.write("<p>Hello <strong>R&T</strong></p>");
document.querySelectorAll("*").forEach(n => addComicSansNode(n));
// Finally!
makeItComic();
```

## Keeping track of objects, looking back!

This part introduced us to more advanced concepts that will be abstracted away most of the time through upcoming userland libraries. In general, Record & Tuple is best when used in a functional and immutable way. However, sometimes you need an escape hatch: we chose to make that escape hatch explicit so you can always trust the integrity and equality of your Records and Tuples but the drawback is that you will need to put in more work to reference/dereference non-primitive values.

---

# Conclusion

Hopefully this tutorial gives you a better idea of what is possible with Record & Tuple. We are just scratching the surface!

If you are in need of more examples, we are compiling a [cookbook] with a few more tricks in it!

[cookbook]: ../cookbook/index.html
