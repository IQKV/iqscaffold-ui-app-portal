import type { LinguiConfig } from "@lingui/conf";

const config: LinguiConfig = {
  locales: [
    "en", // English
    "ru", // Russian
  ],
  catalogs: [
    {
      path: "<rootDir>/locales/{locale}",
      include: ["src"],
    },
  ],
  sourceLocale: "en",
  format: "po",
  fallbackLocales: {
    default: "en",
  },
  compileNamespace: "ts",
};

export default config;
