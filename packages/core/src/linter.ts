import { createFilter, normalizePath } from "@rollup/pluginutils";
import pico from "picocolors";
import type * as Vite from "vite";
import { COLOR_MAPPING, ESLINT_SEVERITY, PLUGIN_NAME } from "./constants";
import type {
  ESLintConstructorOptions,
  ESLintFormatter,
  ESLintInstance,
  ESLintLintResults,
  ESLintOutputFixes,
  ESLintPluginOptions,
  Filter,
  FilterPattern,
  TextType,
} from "./types";

export interface Linter {
  lint(id: string): Promise<void>;
  lintAll(): Promise<void>;
}

// biome-ignore lint/suspicious/noExplicitAny: Work as expected.
const interopDefault = (m: any) => m.default || m;

const getFilter = (options: ESLintPluginOptions): Filter =>
  createFilter(options.include, options.exclude);

const getESLintConstructorOptions = (
  options: ESLintPluginOptions,
): ESLintConstructorOptions => ({
  ...Object.fromEntries(
    Object.entries(options).filter(
      ([key]) =>
        ![
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
        ].includes(key),
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

export function createLinter(
  options: ESLintPluginOptions,
  contextProvider: () => Vite.Rolldown.PluginContext | undefined,
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

  // Process + emit lint results. Kept separate from lintFilesInternal so each
  // step stays a small, readable unit; full pipeline decomposition is deferred.
  const processResults = async (lintResults: ESLintLintResults) => {
    // do nothing if there are no results
    if (!lintResults || lintResults.length === 0) {
      return;
    }
    // output fixes
    if (options.fix) {
      outputFixes(lintResults);
    }
    // filter results
    let results = [...lintResults];
    if (!options.emitError) {
      results = removeESLintErrorResults(results);
    }
    if (!options.emitWarning) {
      results = removeESLintWarningResults(results);
    }
    results = filterESLintLintResults(results);
    if (results.length === 0) {
      return;
    }

    const formattedText = await formatter.format(results);
    let formattedTextType: TextType;
    if (results.some((result) => result.errorCount > 0)) {
      formattedTextType = options.emitErrorAsWarning ? "warning" : "error";
    } else {
      formattedTextType = options.emitWarningAsError ? "error" : "warning";
    }
    return log(formattedText, formattedTextType, contextProvider());
  };

  const lintFilesInternal = async (files: FilterPattern) => {
    await ready;
    const lintResults = await eslintInstance.lintFiles(files);
    return processResults(lintResults);
  };

  return {
    lint: async (id: string) => {
      await ready;
      if (await shouldIgnoreModule(id, filter, eslintInstance)) {
        return;
      }
      const filePath = getFilePath(id);
      return lintFilesInternal(
        options.lintDirtyOnly ? filePath : options.include,
      );
    },
    lintAll: async () => lintFilesInternal(options.include),
  };
}
