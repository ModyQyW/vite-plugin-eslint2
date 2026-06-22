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

export default function ESLintPlugin(
  userOptions: ESLintPluginUserOptions = {},
): Vite.Plugin {
  const options = getOptions(userOptions);

  let worker: Worker;
  let linter: Linter;
  // Plugin context changes per hook (buildStart vs transform); the linter reads
  // it via this provider so errors/warnings route through Vite's channels.
  let currentContext: Vite.Rolldown.PluginContext | undefined;

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
        });
        return;
      }
      // initialize linter
      debug("Initial ESLint");
      currentContext = this;
      linter = createLinter(options, () => currentContext);
      // lint on start if needed
      if (options.lintOnStart) {
        debug("Lint on start");
        await linter.lintAll();
      }
    },
    async transform(_, id) {
      debug("==== transform hook ====");
      // worker
      if (worker) {
        return worker.postMessage(id);
      }
      currentContext = this;
      return await linter.lint(id);
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
