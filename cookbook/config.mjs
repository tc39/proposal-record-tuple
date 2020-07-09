import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  languages: ["en", "fr"],
  defaultLanguage: "en",
  watchDir: __dirname,
  template: join(__dirname, "template.html"),
  copyToOutDir: join(__dirname, "assets"),
  outDir: join(__dirname, "..", "out", "cookbook"),
  replacementsPerLanguage: {
    en: {
      RT_COOKBOOK_TITLE: "Record & Tuple Cookbook",
      RUN_IN_PLAYGROUND: "Run in playground",
      TOP_OF_PAGE: "^ Back to top",
    },
    fr: {
      RT_COOKBOOK_TITLE: "Livre de recettes Record & Tuple",
      RUN_IN_PLAYGROUND: "Essayer dans le bac à sable",
      TOP_OF_PAGE: "^ Retour en haut de page",
    },
  },
  markdownFilesReplacementsPerLanguage: {
    en: {
      COOKBOOK_CONTENTS: join(__dirname, "en.md"),
    },
    fr: {
      COOKBOOK_CONTENTS: join(__dirname, "fr.md"),
    },
  },
};
