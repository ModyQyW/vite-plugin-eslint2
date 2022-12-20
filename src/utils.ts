import pico from 'picocolors';
import type { Colors } from 'picocolors/types';
import type {
  ESLintConstructorOptions,
  ESLintFormatter,
  ESLintInstance,
  ESLintLintResults,
  ESLintOutputFixes,
  ESLintPluginOptions,
  ESLintPluginUserOptions,
  LintFiles,
  TextType,
} from './types';
import type * as Rollup from 'rollup';
import { createFilter } from '@rollup/pluginutils';

export const pluginName = 'vite:eslint';

export const colorMap: Record<TextType, keyof Omit<Colors, 'isColorSupported'>> = {
  error: 'red',
  warning: 'yellow',
  plugin: 'magenta',
};

// https://github.com/vitejs/vite/blob/main/packages/vite/src/node/plugins/importMetaGlob.ts
// https://vitejs.dev/guide/api-plugin.html#virtual-modules-convention
export const isVirtualModule = (id: string) =>
  id.startsWith('virtual:') || id.startsWith('\0') || !id.includes('/');

export const colorize = (text: string, textType: TextType) => pico[colorMap[textType]](text);

export const contextPrint = (
  text: string,
  textType: TextType,
  { emitError, emitErrorAsWarning, emitWarning, emitWarningAsError }: ESLintPluginOptions,
  context: Rollup.PluginContext,
) => {
  if (textType === 'error' && emitError) {
    if (emitErrorAsWarning) context.warn(text);
    else context.error(text);
  }
  if (textType === 'warning' && emitWarning) {
    if (emitWarningAsError) context.error(text);
    else context.warn(text);
  }
};

export const customPrint = (
  text: string,
  textType: TextType,
  { emitError, emitErrorAsWarning, emitWarning, emitWarningAsError }: ESLintPluginOptions,
  hasPluginName = false,
  isColorized = false,
) => {
  let t = text;
  if (!hasPluginName) t += `  Plugin: ${colorize(pluginName, 'plugin')}\n`;
  if (textType === 'error' && emitError) {
    if (!isColorized) t = colorize(t, emitErrorAsWarning ? 'warning' : textType);
    console.log(t);
  }
  if (textType === 'warning' && emitWarning) {
    if (!isColorized) t = colorize(t, emitWarningAsError ? 'error' : textType);
    console.log(t);
  }
};

export const print = (
  text: string,
  textType: TextType,
  options: ESLintPluginOptions,
  {
    hasPluginName = false,
    isColorized = false,
    context,
  }: {
    context?: Rollup.PluginContext;
    hasPluginName?: boolean;
    isColorized?: boolean;
  } = {},
) => {
  console.log('');
  if (context && options) {
    return contextPrint(text, textType, options, context);
  }
  return customPrint(text, textType, options, hasPluginName, isColorized);
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

export const getLintFiles =
  (
    eslint: ESLintInstance,
    formatter: ESLintFormatter,
    outputFixes: ESLintOutputFixes,
    options: ESLintPluginOptions,
  ): LintFiles =>
  async (files, context) =>
    await eslint.lintFiles(files).then(async (lintResults: ESLintLintResults | void) => {
      if (!lintResults) return;

      if (lintResults.length > 0 && options.fix) outputFixes(lintResults);

      const results = lintResults.filter(
        (result) => result.errorCount > 0 || result.warningCount > 0,
      );
      if (results.length === 0) return;
      const text = await formatter.format(results);
      const textType = results.some((result) => result.errorCount > 0) ? 'error' : 'warning';

      if (context) return print(text, textType, options, { context });
      return print(text, textType, options);
    });
