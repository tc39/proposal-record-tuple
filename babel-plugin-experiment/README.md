# Record & Tuple Babel Polyfill

This is an experiemental implementation of a `babel` plugin that transpiles Record and Tuples to a polyfill, which
uses implements them as frozen objects.

This polyfill is a **work in progress** and is not the canonical source of truth for the proposal.

# babel polyfill

The babel plugin that implements the transpile depends on an [unmerged PR to babel #10865](https://github.com/babel/babel/pull/10865). Until the PR is merged and published, you will need to locally setup the correct version of babel to link against.

1. checkout rickbutton/babel#record-and-tuple
2. bootstrap babel locally
3. link babel packages and install deps:

```bash
npm install
npm run bootstrap
```
