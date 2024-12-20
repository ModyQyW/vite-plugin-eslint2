import { parentPort, workerData } from "node:worker_threads";
import debugWrap from "debug";
import { PLUGIN_NAME } from "./constants";
import type {
  ESLintFormatter,
  ESLintInstance,
  ESLintOutputFixes,
  ESLintPluginOptions,
} from "./types";
import {
  getFilePath,
  getFilter,
  initializeESLint,
  lintFiles,
  shouldIgnoreModule,
} from "./utils";

const debug = debugWrap(`${PLUGIN_NAME}:worker`);

const options = workerData.options as ESLintPluginOptions;
const filter = getFilter(options);
let eslintInstance: ESLintInstance;
let formatter: ESLintFormatter;
let outputFixes: ESLintOutputFixes;

const initPromise = initializeESLint(options).then((result) => {
  eslintInstance = result.eslintInstance;
  formatter = result.formatter;
  outputFixes = result.outputFixes;
  return result;
});

// this file needs to be compiled into cjs, which doesn't support top-level await
// so we use iife here
(async () => {
  debug("==== worker start ====");
  debug("Initialize ESLint");
  // remove this line will cause ts2454
  const { eslintInstance, formatter, outputFixes } = await initPromise;
  if (options.lintOnStart) {
    debug("Lint on start");
    lintFiles({
      files: options.include,
      eslintInstance,
      formatter,
      outputFixes,
      options,
    }); // don't use context
  }
})();

parentPort?.on("message", async (id) => {
  // make sure eslintInstance is initialized
  if (!eslintInstance) await initPromise;
  debug("==== worker message event ====");
  debug(`id: ${id}`);
  const shouldIgnore = await shouldIgnoreModule(id, filter, eslintInstance);
  debug(`should ignore: ${shouldIgnore}`);
  if (shouldIgnore) return;
  const filePath = getFilePath(id);
  debug(`filePath: ${filePath}`);
  lintFiles({
    files: options.lintDirtyOnly ? filePath : options.include,
    eslintInstance,
    formatter,
    outputFixes,
    options,
  }); // don't use context
});
