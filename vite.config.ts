import tanstackRouter from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";
import { lingui } from "@lingui/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    tsconfigPaths(),
    react({
      plugins: [["@lingui/swc-plugin", {}]],
    }),
    lingui(),
    mode !== "test" && tanstackRouter(),
  ].filter(Boolean),
}));