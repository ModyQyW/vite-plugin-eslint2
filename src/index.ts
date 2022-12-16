import { normalizePath } from '@rollup/pluginutils';
import type * as Vite from 'vite';
import {
  getFilter,
  getOptions,
  getLintFiles,
  initialESLint,
  isVirtualModule,
  pluginName,
} from './utils';
import type {
  ESLintPluginUserOptions,
  ESLintInstance,
  ESLintFormatter,
  ESLintOutputFixes,
  LintFiles,
} from './types';

export default function ESLintPlugin(userOptions: ESLintPluginUserOptions = {}): Vite.Plugin {
  const options = getOptions(userOptions);
  const filter = getFilter(options);
  let eslint: ESLintInstance;
  let formatter: ESLintFormatter;
  let outputFixes: ESLintOutputFixes;
  let lintFiles: LintFiles;

  return {
    name: pluginName,
    apply(_, { command }) {
      if (command === 'serve' && options.dev) return true;
      if (command === 'build' && options.build) return true;
      return false;
    },
    async buildStart() {
      // initial
      if (!eslint || !formatter || !outputFixes) {
        const result = await initialESLint(options, this);
        eslint = result.eslint;
        formatter = result.formatter;
        outputFixes = result.outputFixes;
        lintFiles = getLintFiles(eslint, formatter, outputFixes, options);
      }
      // lint on start
      if (options.lintOnStart) {
        console.log('');
        this.warn(
          `ESLint is linting all files in the project because \`lintOnStart\` is true. This will significantly slow down Vite.`,
        );
        await lintFiles(options.include, this);
      }
    },
    async transform(_, id) {
      // !filter(file) will cause double lints and regressions
      if (!filter(id) || isVirtualModule(id)) return null;
      const file = normalizePath(id).split('?')[0];
      if (await eslint.isPathIgnored(file)) return null;
      await lintFiles(file, this);
      return null;
    },
  };
}
