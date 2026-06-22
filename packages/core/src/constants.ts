import type { Colors } from "picocolors/types";
import type { TextType } from "./types";

export const ESLINT_SEVERITY = {
  ERROR: 2,
  WARNING: 1,
} as const;

export const PLUGIN_NAME = "vite:eslint2";

// Plugin-specific option keys. `ESLintPluginOptions extends ESLint.ESLint.Options`,
// so plugin and ESLint options share one namespace. getOptions destructures these
// to apply defaults; getESLintConstructorOptions excludes them so they aren't
// forwarded to the ESLint constructor. `cache` is intentionally absent — it is
// a real ESLint option the plugin forwards by design.
export const PLUGIN_OPTION_KEYS = [
  "test",
  "dev",
  "build",
  "include",
  "exclude",
  "eslintPath",
  "formatter",
  "lintInWorker",
  "lintOnStart",
  "lintDirtyOnly",
  "emitError",
  "emitErrorAsWarning",
  "emitWarning",
  "emitWarningAsError",
] as const;

export const COLOR_MAPPING: Record<
  TextType,
  keyof Omit<Colors, "isColorSupported">
> = {
  error: "red",
  warning: "yellow",
  plugin: "magenta",
};
