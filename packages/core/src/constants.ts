import type { Colors } from "picocolors/types";
import type { TextType } from "./types";

export const ESLINT_SEVERITY = {
  ERROR: 2,
  WARNING: 1,
} as const;

export const CWD = process.cwd();

export const PLUGIN_NAME = "vite:eslint2";

export const COLOR_MAPPING: Record<
  TextType,
  keyof Omit<Colors, "isColorSupported">
> = {
  error: "red",
  warning: "yellow",
  plugin: "magenta",
};
