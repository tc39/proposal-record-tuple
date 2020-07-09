import { build } from "./build.mjs";
import CONFIG from "../config.mjs";
import * as fs from "fs";

function watch(config) {
  fs.watch(config.watchDir, () =>
    build(config).catch((e) => {
      console.error(e.stack);
    })
  );
}

watch(CONFIG);
