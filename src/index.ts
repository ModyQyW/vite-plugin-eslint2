import { Worker } from 'node:worker_threads';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizePath } from '@rollup/pluginutils';
import type * as Vite from 'vite';
import {
  getFilter,
  getOptions,
  getLintFiles,
  initialESLint,
  pluginName,
  shouldIgnore,
} from './utils';
import type {
  ESLintPluginUserOptions,
  ESLintInstance,
  ESLintFormatter,
  ESLintOutputFixes,
  LintFiles,
} from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ext = extname(__filename);

export default function ESLintPlugin(userOptions: ESLintPluginUserOptions = {}): Vite.Plugin {
  const options = getOptions(userOptions);
  const filter = getFilter(options);
  let eslint: ESLintInstance;
  let formatter: ESLintFormatter;
  let outputFixes: ESLintOutputFixes;
  let lintFiles: LintFiles;
  let worker: Worker;

  return {
    name: pluginName,
    apply(_, { command }) {
      return (command === 'serve' && options.dev) || (command === 'build' && options.build);
    },
    async buildStart() {
      // initial worker
      if (!worker && options.lintInWorker) {
        worker = new Worker(resolve(__dirname, `worker${ext}`), {
          workerData: { options },
        });
        // lint on start in worker
        if (options.lintOnStart) {
          worker.postMessage(options.include);
        }
        return;
      }
      // initial ESLint
      if (!eslint) {
        const result = await initialESLint(options);
        eslint = result.eslint;
        formatter = result.formatter;
        outputFixes = result.outputFixes;
        lintFiles = getLintFiles(eslint, formatter, outputFixes, options);
      }
      // lint on start
      if (options.lintOnStart) {
        this.warn(
          `\nESLint is linting all files in the project because \`lintOnStart\` is true. This will significantly slow down Vite.`,
        );
        await lintFiles(options.include, this);
      }
    },
    async transform(_, id) {
      if (await shouldIgnore(id, filter, eslint)) return null;
      const file = normalizePath(id).split('?')[0];
      if (worker) worker.postMessage(file);
      else await lintFiles(file, this);
      return null;
    },
  };
}
