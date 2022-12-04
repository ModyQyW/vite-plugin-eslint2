import { resolve } from 'node:path';
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
import type * as Vite from 'vite';
import type * as Rollup from 'rollup';
import { createFilter } from '@rollup/pluginutils';

// https://github.com/vitejs/vite/blob/main/packages/vite/src/node/plugins/importMetaGlob.ts
// https://vitejs.dev/guide/api-plugin.html#virtual-modules-convention
export const isVirtualModule = (id: string) =>
  id.startsWith('virtual:') || id.startsWith('\0') || !id.includes('/');

export const getFinalOptions = (
  {
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
  }: ESLintPluginUserOptions,
  { cacheDir }: Vite.ResolvedConfig,
): ESLintPluginOptions => ({
  dev: dev ?? true,
  build: build ?? true,
  cache: cache ?? true,
  cacheLocation: cacheLocation ?? resolve(cacheDir, 'vite-plugin-eslint'),
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

export const getFilter = (opts: ESLintPluginOptions) => createFilter(opts.include, opts.exclude);

export const getESLintConstructorOptions = (
  opts: ESLintPluginOptions,
): ESLintConstructorOptions => ({
  ...Object.fromEntries(
    Object.entries(opts).filter(
      ([key]) =>
        ![
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

export const initialESLint = async (opts: ESLintPluginOptions, ctx: Rollup.PluginContext) => {
  try {
    const module = await import(opts.eslintPath);
    const eslint = new module.ESLint(getESLintConstructorOptions(opts)) as ESLintInstance;
    const formatter = await eslint.loadFormatter(opts.formatter);
    const outputFixes = module.ESLint.outputFixes.bind(module.ESLint) as ESLintOutputFixes;
    return {
      eslint,
      formatter,
      outputFixes,
    };
  } catch (error) {
    console.log('');
    ctx.error(
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
  async (ctx, files) =>
    await eslint
      .lintFiles(files)
      .then(async (lintResults: ESLintLintResults | void) => {
        if (!lintResults) return;

        if (lintResults.length > 0 && fix) outputFixes(lintResults);

        const errorResults = lintResults.filter((item) => item.errorCount);
        if (errorResults.length > 0 && emitError) {
          const formatResult = await formatter.format(errorResults);
          console.log('');
          if (emitErrorAsWarning) ctx.warn(formatResult);
          else ctx.error(formatResult);
        }

        const warningResults = lintResults.filter((item) => item.warningCount > 0);
        if (warningResults.length > 0 && emitWarning) {
          const formatResult = await formatter.format(warningResults);
          console.log('');
          if (emitWarningAsError) ctx.error(formatResult);
          else ctx.warn(formatResult);
        }
      })
      .catch((error) => {
        console.log('');
        ctx.error(`${error?.message ?? error}`);
      });
