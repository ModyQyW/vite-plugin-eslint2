import { parentPort, workerData } from "node:worker_threads";
import debugWrap from "debug";
import { PLUGIN_NAME } from "./constants";
import { createLinter } from "./linter";
import type { ESLintPluginOptions } from "./types";

const debug = debugWrap(`${PLUGIN_NAME}:worker`);

const options = workerData.options as ESLintPluginOptions;

// Worker emits to stdout only — no Vite PluginContext available here.
const linter = createLinter(options);

// this file needs to be compiled into cjs, which doesn't support top-level await.
// lint/lintAll internally await their own ready promise, so we fire and forget here.
// Each call gets a `.catch` because a rejected `ready` (e.g. ESLint missing)
// would otherwise become an unhandled rejection and silently kill the worker.
debug("==== worker start ====");
if (options.lintOnStart) {
  debug("Lint on start");
  linter.lintAll().catch((error) => debug(`lintAll failed: ${error}`));
}

parentPort?.on("message", (id: string) => {
  debug("==== worker message event ====");
  debug(`id: ${id}`);
  linter.lint(id).catch((error) => debug(`lint failed: ${error}`));
});
