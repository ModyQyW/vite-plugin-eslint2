// Browser-side custom overlay runtime. Self-contained: no imports from node-side
// modules, because this file is built to a single ESM bundle and inlined into the
// served page. Native DOM + Shadow DOM; zero runtime dependencies.
//
// The runtime is injected only in environments with an `index.html` entry
// (transformIndexHtml). In SSR/headless it is still served but `inject()` guards
// on `typeof document`, so it no-ops. Mini-program builds never trigger
// transformIndexHtml, so the runtime is never injected there.

// #region
// NOTE: keep in sync with packages/core/src/constants.ts. Inlined as string
// literals (not imported) so this file bundles to a standalone browser ESM.
const WS_RUNTIME_LOADED_EVENT = "vite:eslint2:runtime-loaded";
const WS_OVERLAY_EVENT = "vite:eslint2:overlay";

// #endregion

// Type-only import is erased at build time; does not create a runtime dep.
import type { CustomOverlayOptions, OverlayPayload } from "../types";

const OVERLAY_TAG = "vite-plugin-eslint2-overlay";

const DEFAULT_THEME: Record<string, string> = {
  "--vite-plugin-eslint2-bg": "#1e1e1e",
  "--vite-plugin-eslint2-panel-bg": "#252526",
  "--vite-plugin-eslint2-error": "#f48771",
  "--vite-plugin-eslint2-warning": "#cca700",
  "--vite-plugin-eslint2-text": "#d4d4d4",
  "--vite-plugin-eslint2-font-mono":
    "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
  "--vite-plugin-eslint2-radius": "6px",
};

const POSITION_STYLES: Record<
  NonNullable<CustomOverlayOptions["position"]>,
  string
> = {
  tl: "top:0;left:0;",
  tr: "top:0;right:0;",
  bl: "bottom:0;left:0;",
  br: "bottom:0;right:0;",
};

const normalizeConfig = (
  overlayConfig: false | true | CustomOverlayOptions,
): Required<Omit<CustomOverlayOptions, "theme">> & {
  theme: CustomOverlayOptions["theme"];
} => {
  const cfg = overlayConfig === true ? {} : (overlayConfig ?? {});
  return {
    position: cfg.position ?? "br",
    initialIsOpen: cfg.initialIsOpen ?? "error",
    zIndex: cfg.zIndex ?? 99_998,
    theme: cfg.theme,
  };
};

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

class VitePluginESLint2Overlay extends HTMLElement {
  private readonly shadow: ShadowRoot;
  private payload: OverlayPayload | undefined;
  private isOpen = false;
  private config = normalizeConfig(false);

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  // Public API called by inject() before the element is connected.
  setConfig(config: ReturnType<typeof normalizeConfig>) {
    this.config = config;
  }

  connectedCallback() {
    this.renderShell();
  }

  private get hasError(): boolean {
    return (
      this.payload?.results.some((r) =>
        r.messages.some((m) => m.severity === "error"),
      ) ?? false
    );
  }

  private get totalCount(): { errors: number; warnings: number } {
    let errors = 0;
    let warnings = 0;
    for (const result of this.payload?.results ?? []) {
      for (const message of result.messages) {
        if (message.severity === "error") {
          errors++;
        } else {
          warnings++;
        }
      }
    }
    return { errors, warnings };
  }

  private resolveOpenState(): boolean {
    const { initialIsOpen } = this.config;
    if (initialIsOpen === true) {
      return true;
    }
    if (initialIsOpen === false) {
      return false;
    }
    // "error": open iff there is at least one error
    return this.hasError;
  }

  setPayload(payload: OverlayPayload | undefined) {
    this.payload = payload;
    // Respect explicit toggles once the user has interacted; otherwise follow
    // initialIsOpen policy on each update so fixing the last error collapses.
    if (!this.userToggled) {
      this.isOpen = this.resolveOpenState();
    }
    if (this.isConnected) {
      this.renderBody();
    }
  }

  private userToggled = false;

  private toggle() {
    this.userToggled = true;
    this.isOpen = !this.isOpen;
    this.renderBody();
  }

  private renderShell() {
    const { position, zIndex, theme } = this.config;
    const themeVars = { ...DEFAULT_THEME, ...theme };
    const themeDecls = Object.entries(themeVars)
      .map(([k, v]) => `${k}:${v};`)
      .join("");
    const pos = POSITION_STYLES[position];

    this.shadow.innerHTML = `
      <style>
        :host {
          all: initial;
          ${themeDecls}
          position: fixed;
          ${pos}
          z-index: ${zIndex};
          font-family: var(--vite-plugin-eslint2-font-mono);
          color: var(--vite-plugin-eslint2-text);
        }
        .badge {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 12px;
          padding: 6px 10px;
          background: var(--vite-plugin-eslint2-bg);
          color: var(--vite-plugin-eslint2-text);
          border-radius: var(--vite-plugin-eslint2-radius);
          cursor: pointer;
          user-select: none;
          font-size: 12px;
          line-height: 1;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        }
        .badge .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--vite-plugin-eslint2-error);
        }
        .badge .dot.warn { background: var(--vite-plugin-eslint2-warning); }
        .badge .dot.ok { background: #4ec9b0; }
        .panel {
          display: none;
          position: absolute;
          margin: 12px;
          max-width: 90vw;
          max-height: 70vh;
          overflow: auto;
          background: var(--vite-plugin-eslint2-panel-bg);
          border-radius: var(--vite-plugin-eslint2-radius);
          box-shadow: 0 4px 24px rgba(0,0,0,0.5);
          padding: 8px 0;
        }
        .panel.open { display: block; }
        .file {
          padding: 6px 12px;
          font-size: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .file:last-child { border-bottom: none; }
        .file-path {
          color: var(--vite-plugin-eslint2-text);
          opacity: 0.7;
          margin-bottom: 4px;
          word-break: break-all;
        }
        .msg {
          display: flex;
          gap: 8px;
          padding: 2px 0;
          font-size: 12px;
        }
        .msg .sev {
          flex: 0 0 auto;
          font-weight: 600;
        }
        .msg .sev.error { color: var(--vite-plugin-eslint2-error); }
        .msg .sev.warning { color: var(--vite-plugin-eslint2-warning); }
        .msg .loc {
          flex: 0 0 auto;
          opacity: 0.6;
        }
        .msg .rule {
          opacity: 0.6;
          font-style: italic;
        }
        .empty {
          padding: 12px;
          opacity: 0.6;
          font-size: 12px;
        }
      </style>
      <div class="badge" part="badge">
        <span class="dot"></span>
        <span class="label">ESLint</span>
      </div>
      <div class="panel" part="panel"></div>
    `;

    const badge = this.shadow.querySelector(".badge") as HTMLDivElement;
    badge.addEventListener("click", () => this.toggle());

    this.isOpen = this.resolveOpenState();
    this.renderBody();
  }

  private renderBody() {
    const badge = this.shadow.querySelector(".badge") as HTMLDivElement | null;
    const panel = this.shadow.querySelector(".panel") as HTMLDivElement | null;
    if (!(badge && panel)) {
      return;
    }

    const dot = badge.querySelector(".dot") as HTMLSpanElement;
    const label = badge.querySelector(".label") as HTMLSpanElement;
    const { errors, warnings } = this.totalCount;

    if (errors > 0) {
      dot.className = "dot";
      label.textContent = `ESLint ${errors} error${errors > 1 ? "s" : ""}${
        warnings > 0 ? ` / ${warnings} warning${warnings > 1 ? "s" : ""}` : ""
      }`;
    } else if (warnings > 0) {
      dot.className = "dot warn";
      label.textContent = `ESLint ${warnings} warning${warnings > 1 ? "s" : ""}`;
    } else {
      dot.className = "dot ok";
      label.textContent = "ESLint";
    }

    panel.classList.toggle("open", this.isOpen && errors + warnings > 0);

    if (!this.isOpen || errors + warnings === 0 || !this.payload) {
      panel.innerHTML = `<div class="empty">No problems</div>`;
      return;
    }

    const html = this.payload.results
      .map((result) => {
        const msgs = result.messages
          .map((m) => {
            const sev = m.severity === "error" ? "error" : "warning";
            return `<div class="msg">
              <span class="sev ${sev}">${m.severity}</span>
              <span class="loc">${m.line}:${m.column}</span>
              <span class="text">${escapeHtml(m.message)}</span>
              ${m.ruleId ? `<span class="rule">${escapeHtml(m.ruleId)}</span>` : ""}
            </div>`;
          })
          .join("");
        return `<div class="file">
          <div class="file-path">${escapeHtml(result.filePath)}</div>
          ${msgs}
        </div>`;
      })
      .join("");
    panel.innerHTML = html;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vite-plugin-eslint2-overlay": VitePluginESLint2Overlay;
  }
}

/**
 * Mount the overlay custom element and wire the WebSocket events.
 *
 * Guarded for non-DOM environments (SSR, headless tests): if `document` is
 * absent, this is a no-op and the runtime-loaded ping is skipped, which tells
 * the server to fall back to terminal-only output.
 */
export function inject({
  overlayConfig,
}: {
  overlayConfig: false | true | CustomOverlayOptions;
}) {
  if (typeof document === "undefined") {
    return;
  }

  if (!customElements.get(OVERLAY_TAG)) {
    customElements.define(OVERLAY_TAG, VitePluginESLint2Overlay);
  }

  if (document.querySelector(OVERLAY_TAG)) {
    return;
  }

  const config = normalizeConfig(overlayConfig);
  const el = document.createElement(OVERLAY_TAG);
  el.setConfig(config);
  document.body.appendChild(el);

  if (import.meta.hot) {
    import.meta.hot.on(
      WS_OVERLAY_EVENT,
      (payload: OverlayPayload | undefined) => {
        el.setPayload(payload);
      },
    );
    // Tell the server this client loaded; the server gates WS pushes on this so
    // it can warn + degrade to terminal-only in environments where the runtime
    // never loads (mini-programs, no index.html entry).
    import.meta.hot.send(WS_RUNTIME_LOADED_EVENT);
  }
}
