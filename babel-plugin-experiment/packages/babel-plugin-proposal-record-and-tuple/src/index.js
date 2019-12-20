import { declare } from "@babel/helper-plugin-utils";
import syntaxRecordAndTuple from "@babel/plugin-syntax-record-and-tuple";
import { types as t } from "@babel/core";
import { addNamed, isModule } from "@babel/helper-module-imports";

function isEquality(operator) {
  return operator === "===" ||
         operator === "==" ||
         operator === "!==" ||
         operator === "!=";
}

function isAbstract(operator) {
  return operator === "==" || operator === "!=";
}

function isDoesNotEqual(operator) {
  return operator === "!==" || operator == "!=";
}

function equalityTransformToPolyfillFunction(val, operator) {
  const abstract = isAbstract(operator);

  if (val === "strict") {
    return abstract ? "abstractStrictEqual" : "strictEqual";
  } else if (val === "is") {
    return abstract ? "abstractIsEqual" : "isEqual";
  }
  else {
    throw new Error(`invalid equalityTransform value ${val}`);
  }
}

export default declare((api, options) => {
  api.assertVersion(7);

  const polyfillModuleName =
    options.polyfillModuleName || "record-and-tuple-polyfill";

  const equalityTransform = options.equalityTransform || "off";
  const validEqualityTransformValues = ["strict", "is", "off"];

  if (!validEqualityTransformValues.includes(equalityTransform)) {
      throw new Error("babel-plugin-proposal-record-and-tuple option 'equalityTransform' requires a value of 'strict', 'is', or 'off'");
  }

  return {
    name: "proposal-record-and-tuple",
    inherits: syntaxRecordAndTuple,
    pre(file) {
      const cache = new Map();

      this.addNamedImport = (source, name) => {
        const cacheKey = isModule(file.path);
        const key = `${source}:${name}:${cacheKey || ""}`;

        let cached = cache.get(key);
        if (cached) {
          cached = t.cloneNode(cached);
        } else {
          cached = addNamed(file.path, name, source, {
            importedInterop: "uncompiled",
          });

          cache.set(key, cached);
        }
        return cached;
      };
    },
    visitor: {
      RecordExpression(path) {
        const record = this.addNamedImport(
          polyfillModuleName,
          "createRecordFromObject",
        );

        const object = t.objectExpression(path.node.properties);
        const wrapped = t.callExpression(record, [object]);
        path.replaceWith(wrapped);
      },
      BinaryExpression(path) {
        const { operator, left, right } = path.node;

        if (!isEquality(operator)) return;
        if (equalityTransform === "off") return;

        const invert = isDoesNotEqual(operator);
        const func = this.addNamedImport(
          polyfillModuleName,
          equalityTransformToPolyfillFunction(equalityTransform, operator),
        );
        const equal = t.callExpression(func, [left, right]);

        const wrapped = invert ? t.unaryExpression("!", equal) : equal;
        path.replaceWith(wrapped);
      },
      TupleExpression(path) {
        const tuple = this.addNamedImport(
          polyfillModuleName,
          "createTupleFromIterableObject",
        );

        const array = t.arrayExpression(path.node.elements);
        const wrapped = t.callExpression(tuple, [array]);
        path.replaceWith(wrapped);
      },
    },
  };
});
