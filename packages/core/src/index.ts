import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";
import debugWrap from "debug";
// biome-ignore lint/performance/noNamespaceImport: Work as expected.
import * as Vite from "vite";
import { composePreambleCode } from "./client/preamble";
import {
  PLUGIN_NAME,
  RUNTIME_CLIENT_ENTRY_PATH,
  RUNTIME_CLIENT_RUNTIME_PATH,
  WS_OVERLAY_EVENT,
  WS_RUNTIME_LOADED_EVENT,
} from "./constants";
import { createLinter, type EmitFn, type Linter } from "./linter";
import type {
  CustomOverlayOptions,
  ESLintPluginUserOptions,
  OverlayPayload,
} from "./types";
import { getOptions } from "./utils";

const debug = debugWrap(PLUGIN_NAME);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ext = extname(__filename);

// Grace window before declaring the environment unsupported. `lintOnStart` lints
// in buildStart, before the browser requests index.html, so a push can legitimately
// precede the runtime ping. 2s covers normal browser load + WS round-trip; if no
// client pings by then, the environment is treated as DOM-less (mini-program/SSR).
const OVERLAY_DEGRADE_GRACE_MS = 2000;

// The runtime is pre-built to a standalone browser ESM bundle and inlined at
// runtime via fs.readFileSync so the plugin needs no extra served file. This
// mirrors vite-plugin-checker's approach (without its separate runtime package).
// The build emits `dist/client-runtime.js` (ESM); the filename is fixed by the
// tsdown entry key and is the same regardless of how the plugin itself is loaded.
const RUNTIME_DIST_FILENAME = "client-runtime.js";
const RUNTIME_DIST_PATH = resolve(__dirname, RUNTIME_DIST_FILENAME);
let cachedRuntimeCode: string | undefined;
const getRuntimeCode = (): string => {
  if (cachedRuntimeCode) {
    return cachedRuntimeCode;
  }
  if (existsSync(RUNTIME_DIST_PATH)) {
    cachedRuntimeCode = `${readFileSync(RUNTIME_DIST_PATH, "utf-8")}\n`;
    return cachedRuntimeCode;
  }
  throw new Error(
    `[${PLUGIN_NAME}] custom overlay runtime bundle not found at ${RUNTIME_DIST_PATH}. ` +
      "Run the build before using customOverlay.",
  );
};

const wrapVirtualPrefix = (id: string) => `\0${id}`;

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
  const customOverlayEnabled = options.customOverlay !== false;

  let worker: Worker;
  let linter: Linter;
  // Vite logger captured in configResolved; reused by the worker path's emit.
  let logger: Vite.Logger | undefined;
  // Dev server captured in configureServer; used by the worker path to push
  // overlay payloads (the worker's buildStart can run before configureServer
  // completes, hence the late-binding reference).
  let devServerRef: Vite.ViteDevServer | undefined;
  // Captured in configResolved; the custom overlay only applies in serve.
  let command: "serve" | "build" | undefined;

  // Overlay handshake state, scoped per plugin instance.
  let runtimeLoaded = false;
  let degraded = false;
  let warnedDegraded = false;
  // Buffered payload pushed before the runtime pinged; replayed on ping.
  let pendingPayload: OverlayPayload | undefined;
  // Timer for the lazy degrade decision; cleared once the runtime pings.
  let degradeTimer: ReturnType<typeof setTimeout> | undefined;

  const pushOverlay = (
    server: Vite.ViteDevServer,
    payload: OverlayPayload | undefined,
  ) => {
    if (!customOverlayEnabled) {
      return;
    }
    pendingPayload = payload;
    if (degraded) {
      return;
    }
    if (runtimeLoaded) {
      server.ws.send(WS_OVERLAY_EVENT, payload);
      return;
    }
    // Runtime hasn't pinged yet. Schedule a one-shot degrade check: if no ping
    // arrives within the grace window, this environment likely has no DOM
    // (mini-program, SSR, headless), so warn once and stop pushing. The grace
    // window avoids false positives when lintOnStart lints before the browser
    // requests index.html. A browser client loading within the window clears
    // the timer via the ping handler.
    if (!degradeTimer) {
      degradeTimer = setTimeout(() => {
        degradeTimer = undefined;
        if (runtimeLoaded || degraded) {
          return;
        }
        degraded = true;
        if (!warnedDegraded) {
          warnedDegraded = true;
          logger?.warn(
            `[${PLUGIN_NAME}] custom overlay runtime did not load within the grace window. ` +
              "This environment (e.g. mini-program, SSR without index.html) is not supported. " +
              "Falling back to terminal-only output. Set customOverlay: false to silence this.",
          );
        }
      }, OVERLAY_DEGRADE_GRACE_MS);
    }
  };

  // serve + customOverlay: print ESLint's formatted output to the terminal once.
  // The `stylish` formatter already emits ANSI color codes; printing it directly
  // (not via Vite's logger, which would re-wrap it in another color layer and
  // corrupt the output) preserves the original coloring. The structured overlay
  // is rendered natively in the browser, so the terminal keeps the formatter's
  // native coloring. `context.error/warn` is deliberately NOT called: it would
  // trigger Vite's native overlay (which customOverlay replaces) and duplicate
  // terminal output.
  const makeEmit =
    (): EmitFn =>
    ({ formattedText }) => {
      console.log("");
      console.log(formattedText);
    };

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
    configResolved(config) {
      // Resolve the logger and command early so hooks can use them. Vite 8's
      // Environment type has no `command` field; capture it from the config.
      logger = config.logger;
      command = config.command;
    },
    configureServer(server) {
      devServerRef = server;
      if (!customOverlayEnabled) {
        return;
      }
      // Listen for the runtime-loaded ping; gate pushes on it.
      server.ws.on(WS_RUNTIME_LOADED_EVENT, () => {
        runtimeLoaded = true;
        if (degradeTimer) {
          clearTimeout(degradeTimer);
          degradeTimer = undefined;
        }
        if (pendingPayload !== undefined) {
          server.ws.send(WS_OVERLAY_EVENT, pendingPayload);
        }
      });
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
          env: getWorkerEnv(),
        });
        // Receive structured overlay payloads from the worker and forward them
        // to the browser via WebSocket. `this`/server is accessed through the
        // closed-over reference set in configureServer — but the worker can be
        // created in buildStart before configureServer runs in serve. Instead,
        // we stash the latest payload and flush from configureServer.
        if (customOverlayEnabled) {
          worker.on(
            "message",
            (msg: { type: string; payload?: OverlayPayload }) => {
              if (msg?.type === "overlay-payload") {
                devServerRef?.ws.send(WS_OVERLAY_EVENT, msg.payload);
                pendingPayload = msg.payload;
              }
            },
          );
        }
        return;
      }
      // initialize linter
      debug("Initial ESLint");
      // serve + customOverlay: use the logger emit adapter so native overlay is
      // replaced. Build mode keeps native context.error (no emit adapter).
      const useCustomOverlayInServe =
        customOverlayEnabled && command === "serve";
      linter = createLinter(options, {
        emit: useCustomOverlayInServe ? makeEmit() : undefined,
        onOverlayPayload: useCustomOverlayInServe
          ? (payload) => {
              if (devServerRef) {
                pushOverlay(devServerRef, payload);
              }
            }
          : undefined,
      });
      // lint on start if needed
      if (options.lintOnStart) {
        debug("Lint on start");
        await linter.lintAll(this);
      }
    },
    resolveId(id) {
      if (
        id === RUNTIME_CLIENT_RUNTIME_PATH ||
        id === RUNTIME_CLIENT_ENTRY_PATH
      ) {
        return wrapVirtualPrefix(id);
      }
      return;
    },
    load(id) {
      if (id === wrapVirtualPrefix(RUNTIME_CLIENT_RUNTIME_PATH)) {
        return getRuntimeCode();
      }
      if (id === wrapVirtualPrefix(RUNTIME_CLIENT_ENTRY_PATH)) {
        return composePreambleCode({
          overlayConfig: options.customOverlay as
            | false
            | true
            | CustomOverlayOptions,
        });
      }
      return;
    },
    transformIndexHtml() {
      // Only inject in serve (dev). Build mode produces static output and the
      // overlay is a dev feedback tool; build keeps native context.error.
      if (options.customOverlay === false) {
        return;
      }
      if (command !== "serve") {
        return;
      }
      return [
        {
          tag: "script",
          attrs: { type: "module" },
          children: composePreambleCode({
            overlayConfig: options.customOverlay as
              | false
              | true
              | CustomOverlayOptions,
          }),
        },
      ];
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
