import type { Colors } from "picocolors/types";
import type { TextType } from "./types";

export const ESLINT_SEVERITY = {
  ERROR: 2,
  WARNING: 1,
} as const;

export const PLUGIN_NAME = "vite:eslint2";

// WebSocket event names for the custom overlay handshake and payload push.
// Client → server: runtime-loaded ping (sent once on runtime load).
// Server → client: overlay payload push (after each lint).
export const WS_RUNTIME_LOADED_EVENT = "vite:eslint2:runtime-loaded";
export const WS_OVERLAY_EVENT = "vite:eslint2:overlay";

// Virtual module IDs for the custom overlay runtime.
export const RUNTIME_CLIENT_RUNTIME_PATH = "/@vite-plugin-eslint2-runtime";
export const RUNTIME_CLIENT_ENTRY_PATH = "/@vite-plugin-eslint2-runtime-entry";

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
