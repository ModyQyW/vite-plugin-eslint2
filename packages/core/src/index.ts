import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";
import debugWrap from "debug";
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

// How long to wait before deciding the environment has no DOM. `lintOnStart` lints
// in buildStart, before the browser asks for index.html, so a push can arrive
// before the runtime pings. 2s covers a normal page load plus the WebSocket
// round-trip; no ping by then means mini-program or SSR.
const OVERLAY_DEGRADE_GRACE_MS = 2000;

// The runtime ships as a standalone browser ESM bundle, which this file reads and
// inlines so the plugin serves nothing extra. tsdown's entry key fixes the output
// name at `dist/client-runtime.js`, whatever loads the plugin afterwards.
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

// Workers get a piped stdout, so picocolors and chalk see no TTY and turn color
// off when they load. Forward the parent's color support: honor NO_COLOR and
// FORCE_COLOR when the user set them, force color on only when the parent is a
// TTY, and otherwise leave the env alone so the worker tracks the parent.
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
  // Dev server captured in configureServer, used by the worker path to push
  // overlay payloads. Late-bound because the worker's buildStart can run before
  // configureServer finishes.
  let devServerRef: Vite.ViteDevServer | undefined;
  // Captured in configResolved; the custom overlay only applies in serve.
  let resolvedCommand: "serve" | "build" | undefined;

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
    // Runtime hasn't pinged yet. Schedule a one-shot degrade check: no ping within
    // the grace window means a DOM-less environment, so warn once and stop pushing.
    // A browser client loading inside the window clears the timer in the ping handler.
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

  // serve + customOverlay: print ESLint's formatted output to the terminal as it
  // is. `stylish` already emits ANSI codes, and Vite's logger would wrap them in
  // another color layer, so console.log keeps the original coloring. The overlay
  // renders the structured payload in the browser, so the terminal needs nothing
  // else. context.error/warn stays untouched here: calling it would bring back the
  // native overlay that customOverlay replaces, and print the text twice.
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
      ({ logger, command: resolvedCommand } = config);
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
        // Overlay payloads come back from the worker and go to the browser over
        // WebSocket. The server reference is closed over from configureServer,
        // which may not have run yet, so the payload is also stashed for replay.
        if (customOverlayEnabled) {
          worker.on(
            "message",
            (msg: { type: string; payload?: OverlayPayload }) => {
              if (msg.type === "overlay-payload") {
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
      // serve + customOverlay: swap in the logger emit adapter so the native
      // overlay is replaced. Build mode keeps native context.error, no adapter.
      const useCustomOverlayInServe =
        customOverlayEnabled && resolvedCommand === "serve";
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
    },
    transformIndexHtml() {
      // Only inject in serve (dev). Build mode produces static output and the
      // overlay is a dev feedback tool; build keeps native context.error.
      if (options.customOverlay === false) {
        return;
      }
      if (resolvedCommand !== "serve") {
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
  // biome-ignore lint/suspicious/noUnnecessaryConditions: `withFilter` only exists from Vite 6 on, but the installed types always declare it.
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
