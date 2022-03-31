import { createFilter, normalizePath } from '@rollup/pluginutils';
import type Vite from 'vite';
import type ESLint from 'eslint';
import type { FilterPattern } from '@rollup/pluginutils';
import path from 'path';

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
  const include = options?.include ?? [/.*\.(vue|js|jsx|ts|tsx)$/];
  let exclude = options?.exclude ?? [/node_modules/];
  const eslintPath = options?.eslintPath ?? 'eslint';
  const defaultFormatter = 'stylish';
  const formatter = options?.formatter ?? defaultFormatter;
  let loadedFormatter: ESLint.ESLint.Formatter;
  const emitError = options?.emitError ?? options?.throwOnError ?? true;
  const emitErrorAsWarning = options?.emitErrorAsWarning ?? false;
  const emitWarning = options?.emitWarning ?? options?.throwOnWarning ?? true;
  const emitWarningAsError = options?.emitWarningAsError ?? false;

  let filter: (id: string | unknown) => boolean;
  let eslint: ESLint.ESLint;
  let outputFixes: typeof ESLint.ESLint.outputFixes;

  return {
    name: 'vite:eslint',
    configResolved(config) {
      // convert exclude to array
      // push config.build.outDir into exclude
      if (Array.isArray(exclude)) {
        exclude.push(config.build.outDir);
      } else {
        exclude = [exclude as string | RegExp, config.build.outDir].filter((item) => !!item);
      }
      filter = createFilter(include, exclude);
    },
    async transform(_, id) {
      const file = normalizePath(id).split('?')[0];

      if (!filter(file)) {
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
          .catch(() => {
            console.log('');
            this.error(`Failed to import ESLint. Have you installed and configured correctly?`);
          });
      }

      await eslint
        .lintFiles(file)
        // catch config error
        .catch((error) => {
          console.log('');
          this.error(`${error?.message ?? error}`);
        })
        // lint results
        .then(async (lintResults: ESLint.ESLint.LintResult[]) => {
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
        });

      return null;
    },
  };
}
