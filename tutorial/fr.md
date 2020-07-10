# Tutoriel pour Record & Tuple

Ce petit site web est conçu pour vous introduire à [la proposition de langage ECMAScript Record & Tuple][rt].

🌐 [en] | **fr**

[rt]: https://github.com/tc39/proposal-record-tuple
[en]: ./index.html

---

# Table des matières

- [Introduction](#introduction)
- 🚧 En construction! 🚧 aidez-nous à traduire [en contribuant sur GitHub](https://github.com/tc39/proposal-record-tuple/blob/master/tutorial/fr.md).
- [Conclusion](#conclusion)

---

# Introduction

Bonjour et bienvenue dans ce tutoriel! Il a pour but de vous introduire à une nouvelle fonctionnalité experimentale de JavaScript nommée Record & Tuple.

À travers ce tutoriel, nous allons voir plusieurs exemples de programmes courants pouvant être écrits avec Record & Tuple.

## Que sont les Record & Tuple?

Un Record est similaire à un Objet en JavaScript à l'exception que le Record n'est pas un Objet mais une valeur primitive profondément immutable.
De la même façon, un Tuple est similaire à un Array (Tableau?) mais est une valeur primitive profondément immutable.

### Immutabilité

Que voulons-nous dire par valeur primitive profondément immutable ?

- Valeur primitive: Une chaîne de caractères, un nombre ou un symbole par exemple est une valeur primitive en JavaScript. Ces valeurs sont généralement représentées comme des valeurs de bas-niveau qui sont attachées à la pile d'éxecution du programme.
- Profondément immutable: C'est en fait un pléonasme car une valeur primitive ne peut déjà pas être changée, elle est donc immutable. Dans cette situation, un Record ou un Tuple ne peut pas contenir autre chose qu'une autre valeur immutable comme un nombre, une chaîne de caractère, un symbole ou un Record ou un Tuple! Ces structures peuvent donc être définies récursivement ce qui implique une profondeur dans cette immutabilité!

En général Record & Tuple peuvent étre décrits comme valeurs primitives composées.

#### Exemple

Commençons par représenter un portefeuille dans un Tuple, composé de différentes cartes représentées par des Records:

```js
const permisDeConduire = #{
    pays: "France",
    numero: 123456789870,
};
const carteDeCredit = #{
    type: "Amex",
    numero: 378282246310005,
};
const carteDeDebit = #{
    type: "Visa",
    numero: 4242424242424242,
};
const portefeuille = #[
    permisDeConduire,
    carteDeCredit,
    carteDeDebit,
];
```

Pour créer un Record ou un Tuple, faites comme si vous créeriez un Objet ou un Array mais ajoutez dièze `#` devant!

> Note: Vous ne pouvez pas mettre d'objets dans votre portefeuille car un Tuple n'accepte pas d'objets!
>
> ```js
> const carteTrain = {
>     type: "senior",
>     numero: 123456,
> };
> const portefeuille = #[
>     carteTrain, // Génère une erreur de type TypeError
> ];
> ```

### Comparaisons

Le principal avantage de cette approche, outre de vous contraindre à ne pas changer le contenu de ces types, est de garantir une égalité par valeur à l'opposé de par identité.

Cela veut dire que vous n'avez pas à vous soucier de quel Record vous manipulez, où a-t-il été crée, etc ... si ses valeurs sont identiques, deux Records sont égaux. Vous pouvez donc utiliser la comparaison `===` pour savoir si deux Records ou Tuples sont égaux.

#### Exemple

```js
const permisDeConduire = #{
    pays: "France",
    numero: 123456789870,
};
const carteTrain = {
    type: "senior",
    numero: 123456,
};

console.log(permisDeConduire === #{
    pays: "France",
    numero: 123456789870,
}); // => true
console.log(carteTrain === {
    type: "senior",
    numero: 123456,
}); // => false
```

Comme on le voit ici, le Record est comparé par son contenu. L'objet est comparé par son identité.

---

# Conclusion

Ce tutoriel n'est pas terminé. Vous pouvez toujours vous référer à la [version anglaise] ou regarder des exemples dans le [livre de recettes].

[version anglaise]: ./index.html
[livre de recettes]: ../cookbook/fr.html