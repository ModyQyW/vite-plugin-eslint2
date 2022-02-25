import * as path from 'path';
import type { Plugin } from 'vite';
import { ESLint } from 'eslint';
import { createFilter } from '@rollup/pluginutils';
import { normalizePath, type Options } from './utils';

export default function ESLintPlugin(options: Options = {}): Plugin {
  const cache = options?.cache ?? true;
  const cacheLocation =
    options?.cacheLocation ??
    path.resolve(process.cwd(), 'node_modules', '.vite', 'vite-plugin-eslint');
  const fix = options?.fix ?? false;
  const include = options?.include ?? /.*\.(vue|js|jsx|ts|tsx)$/;
  const exclude = options?.exclude ?? /node_modules/;
  const defaultFormatter = 'stylish';
  let formatter = options?.formatter ?? defaultFormatter;
  const throwOnError = options?.throwOnError ?? true;
  const throwOnWarning = options?.throwOnWarning ?? true;

  const filter = createFilter(include, exclude);

  const eslint = new ESLint({
    cache,
    cacheLocation,
    fix,
  });

  return {
    name: 'vite:eslint',
    async transform(_, id) {
      const file = normalizePath(id);

      if (!filter(file)) {
        return null;
      }

      switch (typeof formatter) {
        case 'string':
          formatter = await eslint.loadFormatter(formatter);
          break;
        case 'function':
          break;
        default:
          formatter = await eslint.loadFormatter(defaultFormatter);
          break;
      }

      await eslint
        .lintFiles(file)
        .then(async (lintResults) => {
          const formatResult = await (formatter as ESLint.Formatter).format(
            lintResults,
          );

          if (fix && lintResults.length > 0) {
            ESLint.outputFixes(lintResults);
          }
          if (throwOnError && lintResults.some((item) => item.errorCount > 0)) {
            console.log('');
            this.error(formatResult);
          }
          if (
            throwOnWarning &&
            lintResults.some((item) => item.warningCount > 0)
          ) {
            console.log('');
            this.warn(formatResult);
          }
        })
        .catch((error) => {
          console.error(error.stack);
        });

      return null;
    },
  };
}
