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
  overlay,
  terminal,
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
  overlay: overlay ?? true,
  terminal: terminal ?? false,
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

function removeESLintResultsBySeverity(
  results: ESLintLintResults,
  severity: number,
  countFields: { count: string; fixableCount: string },
): ESLintLintResults {
  return results.map((result) => ({
    ...result,
    messages: result.messages.filter(
      (message) => message.severity !== severity,
    ),
    suppressedMessages: result.suppressedMessages.filter(
      (message) => message.severity !== severity,
    ),
    [countFields.count]: 0,
    [countFields.fixableCount]: 0,
    ...(severity === ESLINT_SEVERITY.ERROR
      ? { fatalErrorCount: 0 }
      : { fixableWarningCount: 0 }),
  }));
}

export const removeESLintErrorResults = (results: ESLintLintResults) =>
  removeESLintResultsBySeverity(results, ESLINT_SEVERITY.ERROR, {
    count: "errorCount",
    fixableCount: "fixableErrorCount",
  });

export const removeESLintWarningResults = (results: ESLintLintResults) =>
  removeESLintResultsBySeverity(results, ESLINT_SEVERITY.WARNING, {
    count: "warningCount",
    fixableCount: "fixableWarningCount",
  });

export const filterESLintLintResults = (results: ESLintLintResults) =>
  results.filter((result) => result.errorCount > 0 || result.warningCount > 0);

export function getTextType(
  results: ESLintLintResults,
  options: ESLintPluginOptions,
): TextType {
  const hasError = results.some((result) => result.errorCount > 0);
  if (hasError) {
    return options.emitErrorAsWarning ? "warning" : "error";
  }
  return options.emitWarningAsError ? "error" : "warning";
}

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
    console.log(`${text}  Plugin: ${colorize(PLUGIN_NAME, "plugin")}\r\n`);
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
      const textType = getTextType(results, options);
      return log(formattedText, textType, context);
    });
