import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import mantine from "eslint-config-mantine";
import pluginLingui from "eslint-plugin-lingui";
import pluginQuery from "@tanstack/eslint-plugin-query";
import pluginRouter from "@tanstack/eslint-plugin-router";

export default tseslint.config(
  {
    ignores: ["dist", "src/mocks", "src/shared/ui/error-boundary/error-boundary.tsx"],
  },
  {
    extends: [mantine],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      lingui: pluginLingui,
      "@tanstack/query": pluginQuery,
      "@tanstack/router": pluginRouter,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...pluginQuery.recommended,
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-console": "off",
      "@tanstack/router/create-route-property-order": "error",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "lingui/t-call-in-function": 2,
      "lingui/no-single-variables-to-translate": 2,
      "lingui/no-expression-in-message": 2,
      "lingui/no-single-tag-to-translate": 2,
      "lingui/no-trans-inside-trans": 2,
    },
  },
);
