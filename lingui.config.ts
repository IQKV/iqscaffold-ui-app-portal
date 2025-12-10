import type { LinguiConfig } from "@lingui/conf";

const config: LinguiConfig = {
  locales: [
    "en", // English
    "es", // Spanish
    "fr", // French
    "de", // German
    "ja", // Japanese
  ],
  catalogs: [
    {
      path: "<rootDir>/locales/{locale}",
      include: ["src"],
      exclude: ["**/node_modules/**", "**/build/**", "**/dist/**"],
    },
  ],
  sourceLocale: "en",
  format: "po",
  fallbackLocales: {
    default: "en",
    es: "en",
    fr: "en", 
    de: "en",
    ja: "en",
  },
  compileNamespace: "ts",
  extractBabelOptions: {
    presets: ["@babel/preset-typescript", "@babel/preset-react"],
  },
};

export default config;
