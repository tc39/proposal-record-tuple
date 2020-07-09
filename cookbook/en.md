# Record & Tuple Cookbook

This small website will guide you through the [Record & Tuple ECMAScript proposal][rt].

🌐 **en** | [fr]

[rt]: https://github.com/tc39/proposal-record-tuple
[fr]: ./fr.html

---

# Table of contents

- [Introduction](#introduction)

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
