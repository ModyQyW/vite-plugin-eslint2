import type {
  ESLintFormatter,
  ESLintInstance,
  ESLintLintResults,
  ESLintConstructorOptions,
  ESLintOutputFixes,
  ESLintPluginOptions,
  ESLintPluginUserOptions,
  LintFiles,
} from './types';
import type * as Rollup from 'rollup';
import { createFilter } from '@rollup/pluginutils';

export const pluginName = 'vite:eslint';

// https://github.com/vitejs/vite/blob/main/packages/vite/src/node/plugins/importMetaGlob.ts
// https://vitejs.dev/guide/api-plugin.html#virtual-modules-convention
export const isVirtualModule = (id: string) =>
  id.startsWith('virtual:') || id.startsWith('\0') || !id.includes('/');

export const getOptions = ({
  dev,
  build,
  cache,
  cacheLocation,
  include,
  exclude,
  eslintPath,
  formatter,
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

export const initialESLint = async (
  options: ESLintPluginOptions,
  context: Rollup.PluginContext,
) => {
  try {
    const module = await import(options.eslintPath);
    const eslint = new module.ESLint(getESLintConstructorOptions(options)) as ESLintInstance;
    const formatter = await eslint.loadFormatter(options.formatter);
    const outputFixes = module.ESLint.outputFixes.bind(module.ESLint) as ESLintOutputFixes;
    return {
      eslint,
      formatter,
      outputFixes,
    };
  } catch (error) {
    console.log('');
    context.error(
      `${
        (error as Error)?.message ??
        'Failed to import ESLint. Have you installed and configured correctly?'
      }`,
    );
  }
};

export const getLintFiles =
  (
    eslint: ESLintInstance,
    formatter: ESLintFormatter,
    outputFixes: ESLintOutputFixes,
    { fix, emitError, emitErrorAsWarning, emitWarning, emitWarningAsError }: ESLintPluginOptions,
  ): LintFiles =>
  async (context, files) =>
    await eslint.lintFiles(files).then(async (lintResults: ESLintLintResults | void) => {
      if (!lintResults) return;

      if (lintResults.length > 0 && fix) outputFixes(lintResults);

      const errorResults = lintResults.filter((item) => item.errorCount);
      if (errorResults.length > 0 && emitError) {
        const formatResult = await formatter.format(errorResults);
        console.log('');
        if (emitErrorAsWarning) context.warn(formatResult);
        else context.error(formatResult);
      }

      const warningResults = lintResults.filter((item) => item.warningCount > 0);
      if (warningResults.length > 0 && emitWarning) {
        const formatResult = await formatter.format(warningResults);
        console.log('');
        if (emitWarningAsError) context.error(formatResult);
        else context.warn(formatResult);
      }
    });
