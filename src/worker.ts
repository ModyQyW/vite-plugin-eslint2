import { workerData, parentPort } from 'node:worker_threads';
import { initialESLint, getLintFiles } from './utils';
import type { ESLintInstance, ESLintFormatter, LintFiles, ESLintOutputFixes } from './types';

const { options } = workerData;

let eslint: ESLintInstance;
let formatter: ESLintFormatter;
let outputFixes: ESLintOutputFixes;
let lintFiles: LintFiles;

parentPort?.on('message', async (files) => {
  if (!eslint) {
    const result = await initialESLint(options);
    eslint = result.eslint;
    formatter = result.formatter;
    outputFixes = result.outputFixes;
    lintFiles = getLintFiles(eslint, formatter, outputFixes, options);
  }
  lintFiles(files);
});
