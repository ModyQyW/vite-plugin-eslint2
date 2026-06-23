import { createFilter, normalizePath } from "@rollup/pluginutils";
import pico from "picocolors";
import type * as Vite from "vite";
import {
  COLOR_MAPPING,
  ESLINT_SEVERITY,
  PLUGIN_NAME,
  PLUGIN_OPTION_KEYS,
} from "./constants";
import type {
  ESLintConstructorOptions,
  ESLintFormatter,
  ESLintInstance,
  ESLintLintResults,
  ESLintOutputFixes,
  ESLintPluginOptions,
  Filter,
  FilterPattern,
  OverlayPayload,
  TextType,
} from "./types";

// `context` is a per-call parameter rather than a captured closure because Vite
// runs transform hooks concurrently: a shared context would be overwritten between
// concurrent lints, misrouting emit to the wrong module's PluginContext. Adapters
// pass `this` at call time; the worker omits it (defaults to stdout-only emit).
export interface Linter {
  lint(id: string, context?: Vite.Rolldown.PluginContext): Promise<void>;
  lintAll(context?: Vite.Rolldown.PluginContext): Promise<void>;
}

/**
 * How filtered results are emitted. The default (`"context"`) preserves the
 * original behavior: route to `context.error/warn` (native overlay + blocking)
 * when a context exists, else `console.log` (worker path).
 *
 * `"logger"` is used in serve mode with the custom overlay: results go to Vite's
 * logger (terminal, non-blocking, no native overlay) and the structured payload
 * is forwarded to `onOverlayPayload` so index.ts can push it over WebSocket.
 */
export type EmitMode = "context" | "logger";

/**
 * Adapter the linter calls to emit a formatted lint message. Kept as a callback
 * (not imported) so the linter stays free of Vite server dependencies and remains
 * unit-testable.
 */
export type EmitFn = (params: {
  formattedText: string;
  textType: TextType;
  // Present in non-worker serve/build paths; absent in worker (stdout-only).
  context?: Vite.Rolldown.PluginContext;
}) => void;

/**
 * Sink for the structured overlay payload. Called with `undefined` to clear.
 * Only wired when the custom overlay is enabled; otherwise never called.
 */
export type OverlayPayloadSink = (payload: OverlayPayload | undefined) => void;

// biome-ignore lint/suspicious/noExplicitAny: Work as expected.
const interopDefault = (m: any) => m.default || m;

const getFilter = (options: ESLintPluginOptions): Filter =>
  createFilter(options.include, options.exclude);

// Any key NOT in PLUGIN_OPTION_KEYS is forwarded to the ESLint constructor.
// `cache` works only because ESLint recognises the same name with compatible semantics.
const getESLintConstructorOptions = (
  options: ESLintPluginOptions,
): ESLintConstructorOptions => ({
  ...Object.fromEntries(
    Object.entries(options).filter(
      ([key]) =>
        !PLUGIN_OPTION_KEYS.includes(
          key as (typeof PLUGIN_OPTION_KEYS)[number],
        ),
    ),
  ),
  errorOnUnmatchedPattern: false,
});

const initializeESLint = async (options: ESLintPluginOptions) => {
  const { eslintPath, formatter } = options;
  try {
    const _module = await import(eslintPath);
    const module = interopDefault(_module);
    const ESLintClass = module.loadESLint
      ? await module.loadESLint()
      : module.ESLint || module.FlatESLint || module.LegacyESLint;
    const eslintInstance = new ESLintClass(
      getESLintConstructorOptions(options),
    ) as ESLintInstance;
    const loadedFormatter = await eslintInstance.loadFormatter(formatter);
    const outputFixes = ESLintClass.outputFixes.bind(
      ESLintClass,
    ) as ESLintOutputFixes;
    return {
      eslintInstance,
      formatter: loadedFormatter,
      outputFixes,
    };
  } catch (error) {
    throw new Error(
      `Failed to initialize ESLint. Have you installed and configured correctly? ${error}`,
    );
  }
};

// https://github.com/vitejs/vite/blob/main/packages/vite/src/node/plugins/importMetaGlob.ts
// https://vitejs.dev/guide/api-plugin.html#virtual-modules-convention
const isVirtualModule = (id: string) =>
  id.startsWith("virtual:") || id[0] === "\0" || !id.includes("/");

const getFilePath = (id: string) => normalizePath(id).split("?")[0];

const removeESLintErrorResults = (results: ESLintLintResults) =>
  results.map((result) => {
    const filteredMessages = result.messages.filter(
      (message) => message.severity !== ESLINT_SEVERITY.ERROR,
    );
    const filteredSuppressedMessages = result.suppressedMessages.filter(
      (message) => message.severity !== ESLINT_SEVERITY.ERROR,
    );
    return {
      ...result,
      messages: filteredMessages,
      suppressedMessages: filteredSuppressedMessages,
      errorCount: 0,
      fatalErrorCount: 0,
      fixableErrorCount: 0,
    };
  });

const removeESLintWarningResults = (results: ESLintLintResults) =>
  results.map((result) => {
    const filteredMessages = result.messages.filter(
      (message) => message.severity !== ESLINT_SEVERITY.WARNING,
    );
    const filteredSuppressedMessages = result.suppressedMessages.filter(
      (message) => message.severity !== ESLINT_SEVERITY.WARNING,
    );
    return {
      ...result,
      messages: filteredMessages,
      suppressedMessages: filteredSuppressedMessages,
      warningCount: 0,
      fixableWarningCount: 0,
    };
  });

const filterESLintLintResults = (results: ESLintLintResults) =>
  results.filter((result) => result.errorCount > 0 || result.warningCount > 0);

const colorize = (text: string, textType: TextType) =>
  pico[COLOR_MAPPING[textType]](text);

const log = (
  text: string,
  textType: TextType,
  context?: Vite.Rolldown.PluginContext,
) => {
  console.log("");
  if (context) {
    if (textType === "error") {
      context.error(text);
    } else if (textType === "warning") {
      context.warn(text);
    }
  } else {
    console.log(`${text}  Plugin: ${colorize(PLUGIN_NAME, "plugin")}\r\n`);
  }
};

export const shouldIgnoreModule = async (
  id: string,
  filter: Filter,
  eslintInstance?: ESLintInstance,
) => {
  // virtual module
  if (isVirtualModule(id)) {
    return true;
  }
  // not included
  if (!filter(id)) {
    return true;
  }
  // xxx.vue?type=style or yyy.svelte?type=style style modules
  const filePath = getFilePath(id);
  if (
    [".vue", ".svelte"].some((extname) => filePath.endsWith(extname)) &&
    id.includes("?") &&
    id.includes("type=style")
  ) {
    return true;
  }
  // eslint ignore
  if (eslintInstance) {
    return await eslintInstance.isPathIgnored(filePath);
  }
  return false;
};

// Pure result-filtering pipeline. Applies emitError/emitWarning filters and
// derives the textType (severity channel) for emission. Exported for testing.
export const filterResults = (
  results: ESLintLintResults,
  options: ESLintPluginOptions,
): { results: ESLintLintResults; textType: TextType } => {
  let filtered = [...results];
  if (!options.emitError) {
    filtered = removeESLintErrorResults(filtered);
  }
  if (!options.emitWarning) {
    filtered = removeESLintWarningResults(filtered);
  }
  filtered = filterESLintLintResults(filtered);
  let textType: TextType;
  if (filtered.some((result) => result.errorCount > 0)) {
    textType = options.emitErrorAsWarning ? "warning" : "error";
  } else {
    textType = options.emitWarningAsError ? "error" : "warning";
  }
  return { results: filtered, textType };
};

// Format filtered results and emit them via the adapter (or the legacy path).
const report = async (
  results: ESLintLintResults,
  formatter: ESLintFormatter,
  textType: TextType,
  context: Vite.Rolldown.PluginContext | undefined,
  emit: EmitFn | undefined,
) => {
  const formattedText = await formatter.format(results);
  if (emit) {
    emit({ formattedText, textType, context });
  } else {
    log(formattedText, textType, context);
  }
};

/**
 * Build a structured overlay payload from filtered results.
 *
 * Severity follows the *post-filter* textType so `emitErrorAsWarning` /
 * `emitWarningAsError` are reflected in the overlay, matching the terminal
 * channel. Each result retains only the fields the runtime needs to render.
 *
 * Exported for testing.
 */
export const buildOverlayPayload = (
  results: ESLintLintResults,
  textType: TextType,
): OverlayPayload => ({
  results: results.map((result) => ({
    filePath: result.filePath,
    messages: result.messages.map((message) => ({
      line: message.line,
      column: message.column,
      severity: textType === "error" ? "error" : "warning",
      ruleId: message.ruleId,
      message: message.message,
    })),
  })),
});

/**
 * Accumulates per-file overlay payloads so the panel shows all current problems
 * across the project, not just the last-linted file. Files with no remaining
 * messages are dropped; once empty, `snapshot` returns `undefined` so the caller
 * can clear the overlay.
 */
export class OverlayManager {
  private readonly files = new Map<string, OverlayPayload["results"][number]>();

  upsert(payload: OverlayPayload): OverlayPayload | undefined {
    for (const result of payload.results) {
      if (result.messages.length === 0) {
        this.files.delete(result.filePath);
      } else {
        this.files.set(result.filePath, result);
      }
    }
    return this.snapshot();
  }

  snapshot(): OverlayPayload | undefined {
    if (this.files.size === 0) {
      return;
    }
    return { results: [...this.files.values()] };
  }
}

export interface LinterAdapters {
  emit?: EmitFn;
  onOverlayPayload?: OverlayPayloadSink;
}

export function createLinter(
  options: ESLintPluginOptions,
  adapters?: LinterAdapters,
): Linter {
  const filter = getFilter(options);
  let eslintInstance: ESLintInstance;
  let formatter: ESLintFormatter;
  let outputFixes: ESLintOutputFixes;

  // Eager initialization: triggered at construction, awaited before each lint.
  const ready = initializeESLint(options).then((result) => {
    eslintInstance = result.eslintInstance;
    formatter = result.formatter;
    outputFixes = result.outputFixes;
  });

  const overlayManager = adapters?.onOverlayPayload
    ? new OverlayManager()
    : undefined;

  const lintFiles = async (
    files: FilterPattern,
    context?: Vite.Rolldown.PluginContext,
  ) => {
    await ready;
    const lintResults = await eslintInstance.lintFiles(files);
    // do nothing if there are no results
    if (!lintResults || lintResults.length === 0) {
      return;
    }
    // output fixes operate on the raw, unfiltered results
    if (options.fix) {
      outputFixes(lintResults);
    }
    const { results, textType } = filterResults(lintResults, options);
    if (results.length === 0) {
      // No problems for these files; drop their overlay entries if tracking.
      if (overlayManager && adapters?.onOverlayPayload) {
        overlayManager.upsert({
          results: lintResults.map((result) => ({
            filePath: result.filePath,
            messages: [],
          })),
        });
        adapters.onOverlayPayload(overlayManager.snapshot());
      }
      return;
    }
    // Push structured payload to the overlay sink (serve+customOverlay / worker).
    if (overlayManager && adapters?.onOverlayPayload) {
      const payload = overlayManager.upsert(
        buildOverlayPayload(results, textType),
      );
      adapters.onOverlayPayload(payload);
    }
    return report(results, formatter, textType, context, adapters?.emit);
  };

  return {
    lint: async (id, context) => {
      await ready;
      if (await shouldIgnoreModule(id, filter, eslintInstance)) {
        return;
      }
      const filePath = getFilePath(id);
      return lintFiles(
        options.lintDirtyOnly ? filePath : options.include,
        context,
      );
    },
    lintAll: async (context) => lintFiles(options.include, context),
  };
}
