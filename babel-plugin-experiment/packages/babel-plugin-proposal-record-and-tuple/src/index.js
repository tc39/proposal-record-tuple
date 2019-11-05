import { declare } from "@babel/helper-plugin-utils";
import syntaxRecordAndTuple from "@babel/plugin-syntax-record-and-tuple";
import { types as t } from "@babel/core";
import { addNamed, isModule } from "@babel/helper-module-imports";

export default declare((api, options) => {
  api.assertVersion(7);

  const polyfillModuleName =
    options.polyfillModuleName || "record-and-tuple-polyfill";

    if ((options.hash === true && options.bar === true) || (options.hash !== true && options.bar !== true)) {
      throw new Error("babel-plugin-proposal-record-and-tuple requires exactly one of 'hash' or 'bar' to be set to true")
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
