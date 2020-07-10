import { build, getConfigFor } from "./build-static-page.mjs";
import * as fs from "fs";

function watch(config) {
  fs.watch(config.watchDir, () =>
    build(config).catch((e) => {
      console.error(e.stack);
    })
  );
}

async function main() {
  watch(await getConfigFor(process.argv[2]));
}

main();