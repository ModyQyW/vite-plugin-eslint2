import js from "@eslint/js";
import eslintReact from "@eslint-react/eslint-plugin";
import { defineConfig } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import { reactRefresh } from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default defineConfig(
  { ignores: ["dist"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  eslintReact.configs["recommended-typescript"],
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite(),
);
