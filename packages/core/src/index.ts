import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";
import { readFileSync } from "node:fs";
import debugWrap from "debug";
import type * as Vite from "vite";
import { PLUGIN_NAME } from "./constants";
import type {
  ESLintFormatter,
  ESLintInstance,
  ESLintLintResults,
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
import { supportsRuntimeInjection } from "./env";
import {
  createWebSocketServer,
  type ESLintWebSocketServer,
} from "./server/ws";
import { formatDiagnostic, type DiagnosticData } from "./format";

declare module "vite" {
  interface ViteDevServer {
    eslintWebSocket?: ESLintWebSocketServer;
  }
}

const debug = debugWrap(PLUGIN_NAME);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ext = extname(__filename);

export default function ESLintPlugin(
  userOptions: ESLintPluginUserOptions = {},
): Vite.Plugin {
  const options = getOptions(userOptions);

  let worker: Worker;
  let supportsRuntime: boolean | null = null;
  let wsServer: ESLintWebSocketServer | undefined;

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
    async configResolved(config) {
      debug("==== configResolved hook ====");
      supportsRuntime = await supportsRuntimeInjection(config);
      debug(`runtime injection supported: ${supportsRuntime}`);
    },
    configureServer(server) {
      debug("==== configureServer hook ====");
      if (supportsRuntime) {
        debug("creating WebSocket server");
        wsServer = createWebSocketServer(server);
        server.eslintWebSocket = wsServer;
      }
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
      // worker mode
      if (worker) return worker.postMessage(id);

      // non-worker mode
      debug(`id: ${id}`);
      const shouldIgnore = await shouldIgnoreModule(id, filter, eslintInstance);
      debug(`should ignore: ${shouldIgnore}`);
      if (shouldIgnore) return;
      const filePath = getFilePath(id);
      debug(`filePath: ${filePath}`);

      // runtime mode: send diagnostic to WebSocket, no terminal output
      if (supportsRuntime && wsServer) {
        debug("runtime mode: sending diagnostic to WebSocket");
        const lintResults: ESLintLintResults = await eslintInstance.lintFiles(
          options.lintDirtyOnly ? filePath : options.include,
        );

        // apply fixes if needed
        if (options.fix) {
          outputFixes(lintResults);
        }

        // format and send diagnostic
        const diagnostics = formatDiagnostic(lintResults);
        for (const data of diagnostics) {
          wsServer.sendDiagnostic(data);
        }

        // terminal output if enabled
        if (options.terminal) {
          const results = lintResults.filter(
            (result) => result.errorCount > 0 || result.warningCount > 0,
          );
          if (results.length > 0) {
            const formattedText = await formatter.format(results);
            const textType = results.some((result) => result.errorCount > 0)
              ? options.emitErrorAsWarning
                ? "warning"
                : "error"
              : options.emitWarningAsError
                ? "error"
                : "warning";
            const { log } = await import("./utils");
            log(formattedText, textType, this);
          }
        }
        return;
      }

      // traditional mode: terminal output
      return await lintFiles(
        {
          files: options.lintDirtyOnly ? filePath : options.include,
          eslintInstance,
          formatter,
          outputFixes,
          options,
        },
        this,
      );
    },
    transformIndexHtml() {
      debug("==== transformIndexHtml hook ====");
      if (!supportsRuntime || !wsServer) return;

      debug("injecting runtime script");
      try {
        const runtimeCode = readFileSync(
          resolve(__dirname, "../dist/@runtime/main.js"),
          "utf-8",
        );
        return [
          {
            tag: "script",
            children: runtimeCode,
            attrs: { type: "module" },
          },
        ];
      } catch (error) {
        debug("failed to read runtime code: %o", error);
        debug("runtime injection skipped");
      }
    },
    async buildEnd() {
      debug("==== buildEnd hook ====");
      if (worker) await worker.terminate();
      if (wsServer) {
        debug("closing WebSocket server");
        wsServer.close();
      }
    },
  };
}

export type {
  ESLintPluginOptions,
  ESLintPluginUserOptions,
} from "./types";
export type { DiagnosticData } from "./format";
export { formatDiagnostic } from "./format";
