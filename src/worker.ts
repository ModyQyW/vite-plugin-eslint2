import { workerData, parentPort } from 'node:worker_threads';
import debugWrap from 'debug';
import type {
  ESLintInstance,
  ESLintFormatter,
  ESLintOutputFixes,
  ESLintPluginOptions,
} from './types';
import { getFilter, initializeESLint, lintFiles, shouldIgnoreModule } from './utils';
import { PLUGIN_NAME } from './constants';

const debug = debugWrap(`${PLUGIN_NAME}:worker`);

const options = workerData.options as ESLintPluginOptions;
const filter = getFilter(options);
let eslintInstance: ESLintInstance;
let formatter: ESLintFormatter;
let outputFixes: ESLintOutputFixes;

// this file needs to be compiled into cjs, which doesn't support top-level await
// so we use iife here
(async () => {
  debug(`Initialize ESLint`);
  const result = await initializeESLint(options);
  eslintInstance = result.eslintInstance;
  formatter = result.formatter;
  outputFixes = result.outputFixes;
  if (options.lintOnStart) {
    debug(`Lint on start`);
    lintFiles({
      files: options.include,
      eslintInstance,
      formatter,
      outputFixes,
      options,
    }); // don't use context
  }
})();

parentPort?.on('message', async (files) => {
  debug(`==== message event ====`);
  debug(`message: ${files}`);
  const shouldIgnore = await shouldIgnoreModule(files, filter, eslintInstance);
  debug(`should ignore: ${shouldIgnore}`);
  if (shouldIgnore) return;
  lintFiles({
    files: options.lintDirtyOnly ? files : options.include,
    eslintInstance,
    formatter,
    outputFixes,
    options,
  }); // don't use context
});
