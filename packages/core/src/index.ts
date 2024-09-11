import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";
import type { FSWatcher } from "chokidar";
import chokidar from "chokidar";
import debugWrap from "debug";
import type * as Vite from "vite";
import { CWD, PLUGIN_NAME } from "./constants";
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
  let watcher: FSWatcher;

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
      // initialize watcher
      if (options.chokidar) {
        if (watcher) return;
        debug("Initialize watcher");
        watcher = chokidar
          .watch(options.include, { ignored: options.exclude })
          .on("change", async (path) => {
            debug("==== change event ====");
            const fullPath = resolve(CWD, path);
            // worker + watcher
            if (worker) return worker.postMessage(fullPath);
            // watcher only
            const shouldIgnore = await shouldIgnoreModule(
              fullPath,
              filter,
              eslintInstance,
            );
            debug(`should ignore: ${shouldIgnore}`);
            if (shouldIgnore) return;
            return await lintFiles(
              {
                files: options.lintDirtyOnly ? fullPath : options.include,
                eslintInstance,
                formatter,
                outputFixes,
                options,
              },
              // this, // TODO: use transform hook context will breaks build
            );
          });
        return;
      }
      // no watcher
      debug(`id: ${id}`);
      const filePath = getFilePath(id);
      debug(`filePath: ${filePath}`);
      // worker
      if (worker) return worker.postMessage(filePath);
      // no worker
      const shouldIgnore = await shouldIgnoreModule(id, filter, eslintInstance);
      debug(`should ignore: ${shouldIgnore}`);
      if (shouldIgnore) return;
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
      debug("==== buildEnd ====");
      if (watcher?.close) await watcher.close();
    },
  };
}

export {
  type ESLintPluginOptions,
  type ESLintPluginUserOptions,
} from "./types";
