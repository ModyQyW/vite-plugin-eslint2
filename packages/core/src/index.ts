import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";
import debugWrap from "debug";
import type * as Vite from "vite";
import { PLUGIN_NAME } from "./constants";
import type {
  ESLintFormatter,
  ESLintInstance,
  ESLintOutputFixes,
  ESLintPluginUserOptions,
} from "./types";
import {
  getFilePath,
  getFilter,
  getOptions,
  initializeESLint,
  lintFiles,
  shouldIgnoreModule,
} from "./utils";

const debug = debugWrap(PLUGIN_NAME);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ext = extname(__filename);

export default function ESLintPlugin(
  userOptions: ESLintPluginUserOptions = {},
): Vite.Plugin {
  const options = getOptions(userOptions);

  let worker: Worker;

  const filter = getFilter(options);
  let eslintInstance: ESLintInstance;
  let formatter: ESLintFormatter;
  let outputFixes: ESLintOutputFixes;

  return {
    name: PLUGIN_NAME,
    apply(config, { command }) {
      debug("==== apply hook ====");
      if (config.mode === "test" || process.env.VITEST) return options.test;
      const shouldApply =
        (command === "serve" && options.dev) ||
        (command === "build" && options.build);
      debug(`should apply this plugin: ${shouldApply}`);
      return shouldApply;
    },
    async buildStart() {
      debug("==== buildStart hook ====");
      // initialize worker
      if (options.lintInWorker) {
        if (worker) return;
        debug("Initialize worker");
        worker = new Worker(resolve(__dirname, `worker${ext}`), {
          workerData: { options },
        });
        return;
      }
      // initialize ESLint
      debug("Initial ESLint");
      const result = await initializeESLint(options);
      eslintInstance = result.eslintInstance;
      formatter = result.formatter;
      outputFixes = result.outputFixes;
      // lint on start if needed
      if (options.lintOnStart) {
        debug("Lint on start");
        await lintFiles(
          {
            files: options.include,
            eslintInstance,
            formatter,
            outputFixes,
            options,
          },
          this, // use buildStart hook context
        );
      }
    },
    async transform(_, id) {
      debug("==== transform hook ====");
      // worker
      if (worker) return worker.postMessage(id);
      // no worker
      debug(`id: ${id}`);
      const shouldIgnore = await shouldIgnoreModule(id, filter, eslintInstance);
      debug(`should ignore: ${shouldIgnore}`);
      if (shouldIgnore) return;
      const filePath = getFilePath(id);
      debug(`filePath: ${filePath}`);
      return await lintFiles(
        {
          files: options.lintDirtyOnly ? filePath : options.include,
          eslintInstance,
          formatter,
          outputFixes,
          options,
        },
        this, // use transform hook context
      );
    },
    async buildEnd() {
      debug("==== buildEnd hook ====");
      if (worker) await worker.terminate();
    },
  };
}

export type {
  ESLintPluginOptions,
  ESLintPluginUserOptions,
} from "./types";
