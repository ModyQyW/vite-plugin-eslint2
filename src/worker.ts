import { workerData, parentPort } from 'node:worker_threads';
import type { FSWatcher } from 'chokidar';
import { initialESLint, getLintFiles, getWatcher } from './utils';
import type { ESLintInstance, ESLintFormatter, LintFiles, ESLintOutputFixes } from './types';

const { options } = workerData;

let eslint: ESLintInstance;
let formatter: ESLintFormatter;
let outputFixes: ESLintOutputFixes;
let lintFiles: LintFiles;
let watcher: FSWatcher;

// this file needs to be compiled into cjs, which doesn't support top-level await
// eslint-disable-next-line unicorn/prefer-top-level-await
(async () => {
  const result = await initialESLint(options);
  eslint = result.eslint;
  formatter = result.formatter;
  outputFixes = result.outputFixes;
  lintFiles = getLintFiles(eslint, formatter, outputFixes, options);
  if (options.chokidar) {
    watcher = getWatcher(lintFiles, options);
  }
})();

parentPort?.on('message', async (files) => {
  lintFiles(files);
});

parentPort?.on('close', async () => {
  if (watcher?.close) {
    await watcher.close();
  }
});
