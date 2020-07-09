# Record & Tuple Cookbook

This small website will guide you through the [Record & Tuple ECMAScript proposal][rt].

🌐 **en** | [fr]

[rt]: https://github.com/tc39/proposal-record-tuple
[fr]: ./fr.html

---

# Table of contents

- [Introduction](#introduction)
- [Compound values](#compound-values)
- [Managing State with Record & Tuple](#managing-state-with-record--tuple)

---

# Introduction

Hello and thanks for opening this cookbook! The goal of this book is to introduce you to Record & Tuple, an experiemental feature of JavaScript.

In this book, you'll find multiple examples of programs that can be written using this feature.

## What are Record & Tuple ?

A record is analoguous to an Object in JavaScript with the exception that the Record is not an Object but a deeply immutable primitive value.
Likewise, a Tuple is like an Array but is a deeply immutable primitive value.

### Immutability

What do we want to say by deeply immutable primitive value?

- Primitive value: A string, a number or a symbol for instance are primitive values in JavaScript. Those values are in general represented as low-level values attached to the program stack.
- Deeply immutable: It is actually a repetition as primitive values are by nature impossible to change, they are immutable. Because of that, Records or Tuples can only contain other primitive values such as strings, numbers, symbols or Records and Tuples! Those structures can be defined recursively, explaining why this immutability is deep.

One could say that Record and Tuple can be described as [compound primitive values][2ality].

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

In order to create a Record or a Tuple, just write an Object or an Array and prefix it with an hash `#` character.

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

This means that you don't need to worry about which Record is being manipulated, where has it been created, etc... If its values are identical, two Records are equal. You can therefore use the `===` comparison to know if both primitive values are equal.

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

As we can see, records get matched by value instead of by identity as seen with the `milesCard`.

## Introduction, looking back!

We finally have a quick idea of what Record & Tuple are for but it might be a non-trivial to know what they would be used for... We are going to explore that very soon in the next part, starting with compound values!

---

# Compound values

This part is there to introduce you to the posibility to build compound values easily and how to use them.

## Using strings to compound values

What we're going to do here is already possible with strings. However the ergonomics are not great.

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

We're getting a wrong lookup because the order matters in JSON serialization.

## Coumpounding values into another value with tuples

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

Amazing! This works as expected! The difference between a tuple and a string is that a string will only keep the sequence of character information, so if one char changes, everything is off. However, the tuple will keep the actual sequence of typed values so if all the values of the tuple are identical, everything should work.

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

## Coumpounding values into another value with records

Now let's take a quick look at records that are like tuples but keyed! Let's just name our axes from our previous example:



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

Note that on the last `console.log`, the order did not matter in the equality, unlike what we've seen with converting objects to JSON.

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

And you can obviously store any other value in there:


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

## Coumpound values, looking back!

By this point, you should get a pretty good idea of how Record and Tuple behave. They have some nice equality properties that let us replace strings in some places. That being said, this is only a small use case for them, next, we're going to look at how we can do some state management using Record & Tuple.

---

# Managing State with Record & Tuple

Record & Tuple are great for representing state (especially shared state). For instance you could use Record & Tuple to manage your [Redux] state as you would use [Immutable.js] for the same thing!

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

As we can see we have some denormalized state that is useful for the kind of lookups we want to do. Maintaining that state up to date can be hard if anyone can go and change it partially. This can happen in large codebases with mutable datastructures. Here, we can't change the datastructure so we have to mutate the state atomically, at once:

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
        // We use pushed() to return the new appState.userByVisit record
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


> Note: We use an assignment to reassign the state: this is ok because the variable can have its value changed unlike the contents of the value it holds. You can try doing an assignment inside, it will fail:
> 
> ```js
> let appState = #{
>     userByVisit: #[],
>     visitsByUser: #{},
> };
> appState.userByVisit.push("jose"); // TypeError
> appState.visitsByUser["jose"] = 1; // TypeError (if you remove the line before)
> ```

> Note: using spreads to do deep reassignments can be a cumbersome task. That is why, once [Deep Path Properties for Record] advances more stages, we'll be able to feature it in this cookbook!

[Deep Path Properties for Record]: https://github.com/tc39/proposal-deep-path-properties-for-record/

## Keeping track of immutable state and comparing it

Now that we have a good idea of how we want to maintain our state, we can immediately start using more of the immutability property: we can now keep around copies of our state to restore it back for later or debugging:

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
        userByVisit: last.userByVisit.pushed(username),
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

Now that we can keep track of the past, let's see how we can use it with the comparison to be more efficient. We change a bit the state here and just keep track of two different pieces of state in one central state, changing one part of the state should normally not affect the rest of our app:

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

Now we can only do expensive operations (like updating our UI) when the piece of state we're looking at changed!

## State management, looking back!

We only scratched the surface of what is possible! As we've seen before you might want to use a state management solution like [Redux] to do this. However, [Redux] is not meant to give you comparison operations, you usually have to do it yourself and it is hard to get it right. With Record & Tuple, comparison is done by the JavaScript engine so you don't have to do it!

---

# Keeping track of objects in Record & Tuple#

As we've seen multiple times by now, Record and Tuple will give you the dreaded `TypeError` every time you need to store an object in them.

THis doesn't mean you can't symbolically reference to objects in them, in this part we're going to see how!

## Tracking objects through indices

Let's now imagine we have an app state that requires us to keep track of a DOM node:

```js
let appState = #{
    comicSansNodes: #[
        document.body, // TypeError! DOM elements are objects
    ],
};
```

What we can do is create our state so it has a `fixed` Record and Tuple part and a `dynamic` part and reference from one ot the other:

```js
const appState = {
    // Record and Tuple only here:
    fixed: #{ comicSansNodes: #[] },
    // But here, you can store whatever we need!
    dynamic: [],
};

function addComicSansNode(domNode) {
    // we need to create an index and add it in the dynamic and fixed part
    const idx = appState.dynamic.length;
    appState.dynamic.push(domNode);
    appState.fixed = #{
        comicSansNodes: appState.fixed.comicSansNodes.pushed(idx),
    };
}

function makeItComic() {
    for (const idx of appState.fixed.comicSansNodes) {
        // we need to lookup our index
        const domNode = appState.dynamic[idx];
        domNode.style.fontFamily = '"Comic Sans MS"';
    }
}

document.querySelectorAll("*").forEach(n => addComicSansNode(n));
// Finally!
makeItComic();
```

Ok, as a fine observer you would tell us that this is just an array with extra steps. I'm not going to lie, it's pretty much the case!

The only added advantage is that indices can come from any part of the "fixed" structure, not only the `comicSansNodes` tuple. We have one unique lookup location for our state.

## Tracking objects more globally with a ref bookkeeping system

We don't really want to have to track things around so we could create a global reference bookkeeping system:

```js
// A bookkeeper is a structure maintaining that references list for you
// with easy to use methods
class RefBookkeeper {
    constructor() { this._references = []; }
    ref(obj) { 
        const idx = this._references.length;
        this._references[idx] = obj;
        return idx;
    }
    deref(sym) { return this._references[sym]; }
}

globalThis.refs = new RefBookkeeper();

// Back to everything Record & Tuple!
let appState = #{ comicSansNodes: #[] };

function addComicSansNode(domNode) {
    // just one state swap to do!
    appState = #{
        comicSansNodes: appState.comicSansNodes.pushed(
            // .ref() creates the index for us, we just have to store it
            refs.ref(domNode)
        ),
    };
}

function makeItComic() {
    for (const domNodeRef of appState.comicSansNodes) {
        // we need to deref the node first
        const domNode = refs.deref(domNodeRef);
        domNode.style.fontFamily = '"Comic Sans MS"';
    }
}

document.querySelectorAll("*").forEach(n => addComicSansNode(n));
makeItComic();
```

This is much more ergonomic, and again, we can start putting refs in other locations of the state, this would work.

That being said there is a huge caveat here: each object we track in the global refs will leak memory. There is no way around it, however, we're working on [Symbols as WeakMap Keys] that should let you create a global bookkeeper that doesn't leak!

```js
// This snippet will not execute correctly in the playground
class RefBookkeeper {
    constructor() { this._references = new WeakMap(); }
    ref(obj) {
        // (Simplified; we may want to return an existing symbol if it's already there)
        const sym = Symbol();
        this._references.set(sym, obj);
        return sym;
    }
    deref(sym) { return this._references.get(sym); }
}
globalThis.refs = new RefBookkeeper();
```

[Symbols as WeakMap Keys]: https://github.com/tc39/proposal-symbols-as-weakmap-keys

In the meantime, you should probably associate bookkeepers alongside your structures that need object referencing instead of making them global:


```js
class RefBookkeeper {
    constructor() { this._references = []; }
    ref(obj) { 
        const idx = this._references.length;
        this._references[idx] = obj;
        return idx;
    }
    deref(sym) { return this._references[sym]; }
}

// now appStateRefs is module-scoped, like appState
const appStateRefs = new RefBookkeeper();

let appState = #{ comicSansNodes: #[] };

function addComicSansNode(domNode) {
    appState = #{
        comicSansNodes: appState.comicSansNodes.pushed(
            appStateRefs.ref(domNode)
        ),
    };
}

function makeItComic() {
    for (const domNodeRef of appState.comicSansNodes) {
        const domNode = appStateRefs.deref(domNodeRef);
        domNode.style.fontFamily = '"Comic Sans MS"';
    }
}

document.querySelectorAll("*").forEach(n => addComicSansNode(n));
makeItComic();
```

## Virtual DOM diffing with Record, Tuple and referencing

TODO
