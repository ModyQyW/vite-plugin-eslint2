import { createFilter, normalizePath } from '@rollup/pluginutils';
import fs from 'node:fs';
import type * as Vite from 'vite';
import type * as ESLint from 'eslint';
import * as path from 'path';

export type FilterPattern = string | string[];

export interface VitePluginESLintOptions extends ESLint.ESLint.Options {
  cache?: boolean;
  cacheLocation?: string;
  include?: FilterPattern;
  exclude?: FilterPattern;
  eslintPath?: string;
  formatter?: string;
  lintOnStart?: boolean;
  emitError?: boolean;
  emitErrorAsWarning?: boolean;
  emitWarning?: boolean;
  emitWarningAsError?: boolean;
}

export default function ESLintPlugin(options: VitePluginESLintOptions = {}): Vite.Plugin {
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
  const exclude = options?.exclude ?? ['node_modules', 'virtual:'];
  const eslintPath = options?.eslintPath ?? 'eslint';
  const defaultFormatter = 'stylish';
  const formatter = options?.formatter ?? defaultFormatter;
  let loadedFormatter: ESLint.ESLint.Formatter;
  const lintOnStart = options?.lintOnStart ?? false;
  const emitError = options?.emitError ?? true;
  const emitErrorAsWarning = options?.emitErrorAsWarning ?? false;
  const emitWarning = options?.emitWarning ?? true;
  const emitWarningAsError = options?.emitWarningAsError ?? false;

  const filter = createFilter(include, exclude);
  const isVirtualModule = (file: fs.PathLike) => !fs.existsSync(file);

  let eslint: ESLint.ESLint;
  let outputFixes: typeof ESLint.ESLint.outputFixes;
  let lintFiles: (files: FilterPattern) => Promise<void>;

  return {
    name: 'vite:eslint',
    async buildStart() {
      // initial
      if (!eslint || !loadedFormatter || !outputFixes) {
        try {
          const module = await import(eslintPath);
          eslint = new module.ESLint({
            ...options,
            errorOnUnmatchedPattern: false,
            cache,
            cacheLocation,
          });
          loadedFormatter = await eslint.loadFormatter(formatter);
          outputFixes = module.ESLint.outputFixes.bind(module.ESLint);
          lintFiles = async (files) =>
            await eslint
              .lintFiles(files)
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
        } catch (error) {
          console.log('');
          this.error(
            `${
              (error as Error)?.message ??
              'Failed to import ESLint. Have you installed and configured correctly?'
            }`,
          );
        }
      }

      // lint on start
      if (lintOnStart) {
        await lintFiles(include);
      }
    },
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

      if (await eslint.isPathIgnored(file)) {
        return null;
      }

      await lintFiles(file);

      return null;
    },
  };
}
