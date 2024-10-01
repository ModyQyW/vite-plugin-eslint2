import { createFilter, normalizePath } from "@rollup/pluginutils";
import pico from "picocolors";
import type * as Rollup from "rollup";
import { COLOR_MAPPING, ESLINT_SEVERITY, PLUGIN_NAME } from "./constants";
import type {
  ESLintConstructorOptions,
  ESLintInstance,
  ESLintLintResults,
  ESLintOutputFixes,
  ESLintPluginOptions,
  ESLintPluginUserOptions,
  Filter,
  LintFiles,
  TextType,
} from "./types";

export function interopDefault(m: any) {
  return m.default || m;
}

export const getOptions = ({
  test,
  dev,
  build,
  cache,
  include,
  exclude,
  eslintPath,
  formatter,
  lintInWorker,
  lintOnStart,
  lintDirtyOnly,
  emitError,
  emitErrorAsWarning,
  emitWarning,
  emitWarningAsError,
  ...eslintConstructorOptions
}: ESLintPluginUserOptions): ESLintPluginOptions => ({
  test: test ?? false,
  dev: dev ?? true,
  build: build ?? false,
  cache: cache ?? true,
  include: include ?? ["src/**/*.{js,jsx,ts,tsx,vue,svelte}"],
  exclude: exclude ?? ["node_modules", "virtual:"],
  eslintPath: eslintPath ?? "eslint",
  formatter: formatter ?? "stylish",
  lintInWorker: lintInWorker ?? false,
  lintOnStart: lintOnStart ?? false,
  lintDirtyOnly: lintDirtyOnly ?? true,
  emitError: emitError ?? true,
  emitErrorAsWarning: emitErrorAsWarning ?? false,
  emitWarning: emitWarning ?? true,
  emitWarningAsError: emitWarningAsError ?? false,
  ...eslintConstructorOptions,
});

export const getFilter = (options: ESLintPluginOptions) =>
  createFilter(options.include, options.exclude);

export const getESLintConstructorOptions = (
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

export const initializeESLint = async (options: ESLintPluginOptions) => {
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
export const isVirtualModule = (id: string) =>
  id.startsWith("virtual:") || id[0] === "\0" || !id.includes("/");

export const getFilePath = (id: string) => normalizePath(id).split("?")[0];

export const shouldIgnoreModule = async (
  id: string,
  filter: Filter,
  eslintInstance?: ESLintInstance,
) => {
  // virtual module
  if (isVirtualModule(id)) return true;
  // not included
  if (!filter(id)) return true;
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
  if (eslintInstance) return await eslintInstance.isPathIgnored(filePath);
  return false;
};

export const removeESLintErrorResults = (results: ESLintLintResults) =>
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

export const removeESLintWarningResults = (results: ESLintLintResults) =>
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

export const filterESLintLintResults = (results: ESLintLintResults) =>
  results.filter((result) => result.errorCount > 0 || result.warningCount > 0);

export const colorize = (text: string, textType: TextType) =>
  pico[COLOR_MAPPING[textType]](text);

export const log = (
  text: string,
  textType: TextType,
  context?: Rollup.PluginContext,
) => {
  console.log("");
  if (context) {
    if (textType === "error") context.error(text);
    else if (textType === "warning") context.warn(text);
  } else {
    const t = colorize(
      `${text}  Plugin: ${colorize(PLUGIN_NAME, "plugin")}\r\n`,
      textType,
    );
    console.log(t);
  }
};

export const lintFiles: LintFiles = async (
  { files, eslintInstance, formatter, outputFixes, options },
  context,
) =>
  await eslintInstance
    .lintFiles(files)
    .then(async (lintResults: ESLintLintResults) => {
      // do nothing if there are no results
      if (!lintResults || lintResults.length === 0) return;
      // output fixes
      if (options.fix) outputFixes(lintResults);
      // filter results
      let results = [...lintResults];
      if (!options.emitError) results = removeESLintErrorResults(results);
      if (!options.emitWarning) results = removeESLintWarningResults(results);
      results = filterESLintLintResults(results);
      if (results.length === 0) return;

      const formattedText = await formatter.format(results);
      let formattedTextType: TextType;
      if (results.some((result) => result.errorCount > 0)) {
        formattedTextType = options.emitErrorAsWarning ? "warning" : "error";
      } else {
        formattedTextType = options.emitWarningAsError ? "error" : "warning";
      }
      return log(formattedText, formattedTextType, context);
    });
