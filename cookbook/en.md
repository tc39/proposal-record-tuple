# Record & Tuple Cookbook

This small website will guide you through the [Record & Tuple ECMAScript proposal][rt].

🌐 **en** | [fr]

[rt]: https://github.com/tc39/proposal-record-tuple
[fr]: ./fr.html

---

# Table of contents

- [Introduction](#introduction)
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

One could say that Record and Tuple can be described as Compound Value Types.

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

We finally have a quick idea of what Record & Tuple are for but it might be a non-trivial to know what they would be used for... We are going to explore that very soon in the next part, starting with state management!

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
