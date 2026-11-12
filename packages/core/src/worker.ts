import { parentPort, workerData } from "node:worker_threads";
import debugWrap from "debug";
import { PLUGIN_NAME } from "./constants";
import { createLinter, type OverlayPayloadSink } from "./linter";
import type { ESLintPluginOptions } from "./types";

const debug = debugWrap(`${PLUGIN_NAME}:worker`);

const options = workerData.options as ESLintPluginOptions;

// With the custom overlay on, the structured payload goes to the main thread over
// parentPort, which pushes it to the browser. The terminal keeps using stdout
// because no `emit` adapter is passed here, so `report` falls back to `log()`.
const onOverlayPayload: OverlayPayloadSink | undefined = options.customOverlay
  ? (payload) => parentPort?.postMessage({ type: "overlay-payload", payload })
  : undefined;

// Worker emits to stdout only: no Vite PluginContext here.
const linter = createLinter(
  options,
  onOverlayPayload ? { onOverlayPayload } : undefined,
);

// This file is compiled to CJS, which has no top-level await. lint/lintAll await
// their own ready promise, so fire and forget here. Each call needs its `.catch`:
// a rejected `ready` (ESLint missing, say) would otherwise be an unhandled
// rejection that silently kills the worker.
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
