import type { Colors } from "picocolors/types";
import type { TextType } from "./types";

export const ESLINT_SEVERITY = {
  ERROR: 2,
  WARNING: 1,
} as const;

export const PLUGIN_NAME = "vite:eslint2";

// WebSocket event names for the custom overlay.
// Client → server: the runtime-loaded ping, sent once when the runtime loads.
// Server → client: the overlay payload, pushed after each lint.
export const WS_RUNTIME_LOADED_EVENT = "vite:eslint2:runtime-loaded";
export const WS_OVERLAY_EVENT = "vite:eslint2:overlay";

// Virtual module IDs for the custom overlay runtime.
export const RUNTIME_CLIENT_RUNTIME_PATH = "/@vite-plugin-eslint2-runtime";
export const RUNTIME_CLIENT_ENTRY_PATH = "/@vite-plugin-eslint2-runtime-entry";

// Plugin-only option keys. `ESLintPluginOptions extends ESLint.ESLint.Options`, so
// plugin and ESLint options share one namespace: getOptions destructures these to
// apply defaults, and getESLintConstructorOptions filters them out before handing
// the rest to the ESLint constructor. `cache` is missing on purpose, because it is
// a real ESLint option the plugin passes through.
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
  "customOverlay",
] as const;

export const COLOR_MAPPING: Record<
  TextType,
  keyof Omit<Colors, "isColorSupported">
> = {
  error: "red",
  warning: "yellow",
  plugin: "magenta",
};
