import pico from 'picocolors';
import { createFilter, normalizePath } from '@rollup/pluginutils';
import type { Colors } from 'picocolors/types';
import type * as Rollup from 'rollup';
import type {
  ESLintConstructorOptions,
  ESLintFormatter,
  ESLintInstance,
  ESLintLintResults,
  ESLintOutputFixes,
  ESLintPluginOptions,
  ESLintPluginUserOptions,
  Filter,
  LintFiles,
  TextType,
} from './types';

const ESLINT_SEVERITY = {
  ERROR: 2,
  WARNING: 1,
} as const;

export const pluginName = 'vite:eslint';

export const extnamesWithStyleBlock = ['.vue', '.svelte'];

export const colorMap: Record<TextType, keyof Omit<Colors, 'isColorSupported'>> = {
  error: 'red',
  warning: 'yellow',
  plugin: 'magenta',
};

// https://github.com/vitejs/vite/blob/main/packages/vite/src/node/plugins/importMetaGlob.ts
// https://vitejs.dev/guide/api-plugin.html#virtual-modules-convention
export const isVirtualModule = (id: string) =>
  id.startsWith('virtual:') || id.startsWith('\0') || !id.includes('/');

export const getFileFromId = (id: string) => normalizePath(id).split('?')[0];

export const shouldIgnore = async (id: string, filter: Filter, eslint?: ESLintInstance) => {
  if (isVirtualModule(id)) return true;
  if (!filter(id)) return true;
  const file = getFileFromId(id);
  if (
    extnamesWithStyleBlock.some((extname) => file.endsWith(extname)) &&
    id.includes('?') &&
    id.includes('type=style')
  ) {
    return true;
  }
  if (eslint) {
    return await eslint.isPathIgnored(file);
  }
  return false;
};

export const colorize = (text: string, textType: TextType) => pico[colorMap[textType]](text);

export const print = (text: string, textType: TextType, context?: Rollup.PluginContext) => {
  console.log('');
  if (context) {
    if (textType === 'error') context.error(text);
    else if (textType === 'warning') context.warn(text);
  } else {
    const t = colorize(`${text}  Plugin: ${colorize(pluginName, 'plugin')}\r\n`, textType);
    console.log(t);
  }
};

export const getOptions = ({
  dev,
  build,
  cache,
  cacheLocation,
  include,
  exclude,
  eslintPath,
  formatter,
  lintInWorker,
  lintOnStart,
  emitError,
  emitErrorAsWarning,
  emitWarning,
  emitWarningAsError,
  ...eslintOptions
}: ESLintPluginUserOptions): ESLintPluginOptions => ({
  dev: dev ?? true,
  build: build ?? false,
  cache: cache ?? true,
  cacheLocation: cacheLocation ?? '.eslintcache',
  include: include ?? ['src/**/*.{js,jsx,ts,tsx,vue,svelte}'],
  exclude: exclude ?? ['node_modules', 'virtual:'],
  eslintPath: eslintPath ?? 'eslint',
  formatter: formatter ?? 'stylish',
  lintInWorker: lintInWorker ?? false,
  lintOnStart: lintOnStart ?? false,
  emitError: emitError ?? true,
  emitErrorAsWarning: emitErrorAsWarning ?? false,
  emitWarning: emitWarning ?? true,
  emitWarningAsError: emitWarningAsError ?? false,
  ...eslintOptions,
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
          'dev',
          'build',
          'include',
          'exclude',
          'eslintPath',
          'formatter',
          'lintInWorker',
          'lintOnStart',
          'emitError',
          'emitErrorAsWarning',
          'emitWarning',
          'emitWarningAsError',
        ].includes(key),
    ),
  ),
  errorOnUnmatchedPattern: false,
});

export const initialESLint = async (options: ESLintPluginOptions) => {
  const { eslintPath, formatter } = options;
  try {
    const module = await import(eslintPath);
    const eslint = new module.ESLint(getESLintConstructorOptions(options)) as ESLintInstance;
    const loadedFormatter = await eslint.loadFormatter(formatter);
    const outputFixes = module.ESLint.outputFixes.bind(module.ESLint) as ESLintOutputFixes;
    return {
      eslint,
      formatter: loadedFormatter,
      outputFixes,
    };
  } catch (error) {
    throw new Error(
      `Failed to import ESLint. Have you installed and configured correctly? ${error}`,
    );
  }
};

export const removeErrorResults = (results: ESLintLintResults) =>
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

export const removeWarningResults = (results: ESLintLintResults) =>
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

export const getLintFiles =
  (
    eslint: ESLintInstance,
    formatter: ESLintFormatter,
    outputFixes: ESLintOutputFixes,
    { fix, emitError, emitErrorAsWarning, emitWarning, emitWarningAsError }: ESLintPluginOptions,
  ): LintFiles =>
  // eslint-disable-next-line sonarjs/cognitive-complexity
  async (files, context) =>
    await eslint.lintFiles(files).then(async (lintResults: ESLintLintResults | void) => {
      // do nothing when there are no results
      if (!lintResults) return;

      // output fixes
      if (lintResults.length > 0 && fix) outputFixes(lintResults);

      let results = [...lintResults];
      // remove errors if emitError is false
      if (!emitError) results = removeErrorResults(results);
      // remove warnings if emitWarning is false
      if (!emitWarning) results = removeWarningResults(results);
      // remove results without errors and warnings
      results = results.filter((result) => result.errorCount > 0 || result.warningCount > 0);

      // do nothing when there are no results after processed
      if (results.length === 0) return;

      const text = await formatter.format(results);
      let textType: TextType;
      if (results.some((result) => result.errorCount > 0)) {
        textType = emitErrorAsWarning ? 'warning' : 'error';
      } else {
        textType = emitWarningAsError ? 'error' : 'warning';
      }

      return print(text, textType, context);
    });
