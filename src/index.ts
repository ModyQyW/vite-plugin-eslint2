import { createFilter, normalizePath } from '@rollup/pluginutils';
import fs from 'node:fs';
import type * as Vite from 'vite';
import type * as ESLint from 'eslint';
import * as path from 'path';

export type FilterPattern = string | string[] | null;

export interface Options extends ESLint.ESLint.Options {
  cache?: boolean;
  cacheLocation?: string;
  include?: FilterPattern;
  exclude?: FilterPattern;
  eslintPath?: string;
  formatter?: string;
  /** @deprecated Recommend to use `emitError` */
  throwOnError?: boolean;
  /** @deprecated Recommend to use `emitWarning` */
  throwOnWarning?: boolean;
  emitError?: boolean;
  emitErrorAsWarning?: boolean;
  emitWarning?: boolean;
  emitWarningAsError?: boolean;
}

export default function ESLintPlugin(options: Options = {}): Vite.Plugin {
  const cache = options?.cache ?? true;
  const cacheLocation =
    options?.cacheLocation ?? path.join('node_modules', '.vite', 'vite-plugin-eslint');
  const include = options?.include ?? [
    'src/**/*.js',
    'src/**/*.jsx',
    'src/**/*.ts',
    'src/**/*.tsx',
    'src/**/*.vue',
    'src/**/*.svelte',
  ];
  const exclude = options?.exclude ?? ['node_modules'];
  const eslintPath = options?.eslintPath ?? 'eslint';
  const defaultFormatter = 'stylish';
  const formatter = options?.formatter ?? defaultFormatter;
  let loadedFormatter: ESLint.ESLint.Formatter;
  const emitError = options?.emitError ?? options?.throwOnError ?? true;
  const emitErrorAsWarning = options?.emitErrorAsWarning ?? false;
  const emitWarning = options?.emitWarning ?? options?.throwOnWarning ?? true;
  const emitWarningAsError = options?.emitWarningAsError ?? false;

  const filter = createFilter(include, exclude);
  const isVirtualModule = (file: fs.PathLike) => !fs.existsSync(file);

  let eslint: ESLint.ESLint;
  let outputFixes: typeof ESLint.ESLint.outputFixes;

  return {
    name: 'vite:eslint',
    async transform(_, id) {
      // id should be ignored: vite-plugin-eslint/examples/vue/index.html
      // file should be ignored: vite-plugin-eslint/examples/vue/index.html

      // id should be ignored: vite-plugin-eslint/examples/vue/index.html?html-proxy&index=0.css
      // file should be ignored: vite-plugin-eslint/examples/vue/index.html

      // id should NOT be ignored: vite-plugin-eslint/examples/vue/src/app.vue
      // file should NOT be ignored: vite-plugin-eslint/examples/vue/src/app.vue

      // id should be ignored: vite-plugin-eslint/examples/vue/src/app.vue?vue&type=style&index=0&lang.css
      // file should NOT be ignored: vite-plugin-eslint/examples/vue/src/app.vue

      const file = normalizePath(id).split('?')[0];

      // !filter(file) will cause double lints and regressions
      if (!filter(id) || isVirtualModule(file)) {
        return null;
      }

      // initial
      if (!eslint || !loadedFormatter || !outputFixes) {
        await import(eslintPath)
          .then(async (module) => {
            eslint = new module.ESLint({
              ...options,
              cache,
              cacheLocation,
            });
            loadedFormatter = await eslint.loadFormatter(formatter);
            outputFixes = module.ESLint.outputFixes.bind(module.ESLint);
          })
          .catch((error) => {
            console.log('');
            this.error(
              `${
                error?.message ??
                'Failed to import ESLint. Have you installed and configured correctly?'
              }`,
            );
          });
      }

      if (await eslint.isPathIgnored(file)) {
        return null;
      }

      await eslint
        .lintFiles(file)
        .then(async (lintResults: ESLint.ESLint.LintResult[] | void) => {
          if (!lintResults) return;

          if (lintResults.length > 0 && options.fix) {
            outputFixes(lintResults);
          }

          if (lintResults.some((item) => item.errorCount > 0) && emitError) {
            const formatResult = await loadedFormatter.format(
              lintResults.filter((item) => item.errorCount > 0),
            );
            console.log('');
            if (emitErrorAsWarning) {
              this.warn(formatResult);
            } else {
              this.error(formatResult);
            }
          }

          if (lintResults.some((item) => item.warningCount > 0) && emitWarning) {
            const formatResult = await loadedFormatter.format(
              lintResults.filter((item) => item.warningCount > 0),
            );
            console.log('');
            if (emitWarningAsError) {
              this.error(formatResult);
            } else {
              this.warn(formatResult);
            }
          }
        })
        .catch((error) => {
          console.log('');
          this.error(`${error?.message ?? error}`);
        });

      return null;
    },
  };
}
