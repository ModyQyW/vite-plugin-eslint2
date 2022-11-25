import { normalizePath } from '@rollup/pluginutils';
import type { Plugin } from 'vite';
import { getFilter, getFinalOptions, getLintFiles, initialESLint, isVirtualModule } from './utils';
import type {
  Filter,
  ESLintPluginUserOptions,
  ESLintPluginOptions,
  ESLintInstance,
  ESLintFormatter,
  ESLintOutputFixes,
  LintFiles,
} from './types';

export default function ESLintPlugin(options: ESLintPluginUserOptions = {}): Plugin {
  let opts: ESLintPluginOptions;
  let filter: Filter;
  let eslint: ESLintInstance;
  let formatter: ESLintFormatter;
  let outputFixes: ESLintOutputFixes;
  let lintFiles: LintFiles;

  return {
    name: 'vite:eslint',
    configResolved(config) {
      opts = getFinalOptions(options, config);
      filter = getFilter(opts);
    },
    async buildStart() {
      // initial
      if (!eslint || !formatter || !outputFixes) {
        const result = await initialESLint(opts, this);
        eslint = result.eslint;
        formatter = result.formatter;
        outputFixes = result.outputFixes;
        lintFiles = getLintFiles(eslint, formatter, outputFixes, opts);
      }

      // lint on start
      if (opts.lintOnStart) {
        console.log('');
        this.warn(
          `ESLint is linting all files in the project because \`lintOnStart\` is true. This will significantly slow down Vite.`,
        );
        await lintFiles(this, opts.include);
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

      // !filter(file) will cause double lints and regressions
      if (!filter(id) || isVirtualModule(id)) return null;

      const file = normalizePath(id).split('?')[0];
      if (await eslint.isPathIgnored(file)) return null;

      await lintFiles(this, file);

      return null;
    },
  };
}
