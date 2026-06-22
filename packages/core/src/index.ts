import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";
import debugWrap from "debug";
// biome-ignore lint/performance/noNamespaceImport: Work as expected.
import * as Vite from "vite";
import { PLUGIN_NAME } from "./constants";
import { createLinter, type Linter } from "./linter";
import type { ESLintPluginUserOptions } from "./types";
import { getOptions } from "./utils";

const debug = debugWrap(PLUGIN_NAME);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ext = extname(__filename);

// Derive the worker env so its color support matches the main thread.
// picocolors/chalk check `process.stdout.isTTY` and `FORCE_COLOR` at module
// load; inside a worker stdout is a pipe (not a TTY), so without this the
// worker's formatted output loses color. Respect explicit user overrides
// (NO_COLOR / FORCE_COLOR) and only force color on when the parent is a TTY;
// otherwise leave the env untouched so worker behavior tracks the parent.
const getWorkerEnv = () => {
  if (process.env.NO_COLOR || process.env.FORCE_COLOR !== undefined) {
    return { ...process.env };
  }
  if (process.stdout.isTTY) {
    return { ...process.env, FORCE_COLOR: "1" };
  }
  return { ...process.env };
};

export default function ESLintPlugin(
  userOptions: ESLintPluginUserOptions = {},
): Vite.Plugin {
  const options = getOptions(userOptions);

  let worker: Worker;
  let linter: Linter;

  const plugin: Vite.Plugin = {
    name: PLUGIN_NAME,
    apply(config, { command }) {
      debug("==== apply hook ====");
      if (config.mode === "test" || process.env.VITEST) {
        return options.test;
      }
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
        if (worker) {
          return;
        }
        debug("Initialize worker");
        worker = new Worker(resolve(__dirname, `worker${ext}`), {
          workerData: { options },
          // Worker stdout is a pipe, not a TTY, so picocolors/chalk disable color
          // at module load. Forward the main thread's color support so worker
          // output matches the main-thread path. Only force color when the main
          // thread itself supports it — never override an explicit user override
          // (NO_COLOR / FORCE_COLOR) or a non-TTY/CI parent.
          env: getWorkerEnv(),
        });
        return;
      }
      // initialize linter
      debug("Initial ESLint");
      linter = createLinter(options);
      // lint on start if needed
      if (options.lintOnStart) {
        debug("Lint on start");
        await linter.lintAll(this);
      }
    },
    async transform(_, id) {
      debug("==== transform hook ====");
      // worker
      if (worker) {
        return worker.postMessage(id);
      }
      return await linter.lint(id, this);
    },
    async buildEnd() {
      debug("==== buildEnd hook ====");
      if (worker) {
        await worker.terminate();
      }
    },
  };

  // For compatibility
  if (Vite.withFilter) {
    return Vite.withFilter(plugin, {
      transform: {
        id: {
          include: options.include,
          exclude: options.exclude,
        },
      },
    });
  }

  return plugin;
}

export type {
  ESLintPluginOptions,
  ESLintPluginUserOptions,
} from "./types";
