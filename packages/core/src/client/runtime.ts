/// <reference types="vite/client" />
// Browser half of the custom overlay. Self-contained on purpose: no imports from
// node-side modules, because this file is bundled into one ESM file and inlined
// into the served page. Plain DOM plus Shadow DOM, no runtime dependencies.
//
// The runtime only gets injected where there is an `index.html` entry
// (transformIndexHtml). SSR and headless still serve it, but `inject()` returns
// early when `document` is missing. Mini-program builds never hit
// transformIndexHtml, so the runtime is never injected there.

// Type-only import, erased at build time, so it adds no runtime dependency.
import type { CustomOverlayOptions, OverlayPayload } from "../types";

// #region
// Keep in sync with packages/core/src/constants.ts. These are string literals
// rather than imports so this file bundles to a standalone browser ESM.
const WS_RUNTIME_LOADED_EVENT = "vite:eslint2:runtime-loaded";
const WS_OVERLAY_EVENT = "vite:eslint2:overlay";

// #endregion

const OVERLAY_TAG = "vite-plugin-eslint2-overlay";

const DEFAULT_THEME: Record<string, string> = {
  "--vite-plugin-eslint2-bg": "#1e1e1e",
  "--vite-plugin-eslint2-panel-bg": "#252525ee",
  "--vite-plugin-eslint2-error": "#f48771",
  "--vite-plugin-eslint2-warning": "#cca700",
  "--vite-plugin-eslint2-text": "#d4d4d4",
  "--vite-plugin-eslint2-font-mono":
    "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
  "--vite-plugin-eslint2-radius": "6px",
};

const POSITION_STYLES: Record<
  NonNullable<CustomOverlayOptions["position"]>,
  { host: string; panel: string }
> = {
  // The panel is position: fixed, so percentages resolve against the viewport and
  // not :host. Use explicit offsets: badge (about 48px with its margin) plus a gap.
  tl: { host: "top:0;left:0;", panel: "top:56px;left:16px;" },
  tr: { host: "top:0;right:0;", panel: "top:56px;right:16px;" },
  bl: { host: "bottom:0;left:0;", panel: "bottom:56px;left:16px;" },
  br: { host: "bottom:0;right:0;", panel: "bottom:56px;right:16px;" },
};

const normalizeConfig = (
  overlayConfig: false | true | CustomOverlayOptions,
): Required<Omit<CustomOverlayOptions, "theme">> & {
  theme: CustomOverlayOptions["theme"];
} => {
  // `false` and `true` both become an empty object, so the property reads below
  // stay type-safe.
  const cfg: CustomOverlayOptions =
    overlayConfig === true || overlayConfig === false ? {} : overlayConfig;
  return {
    position: cfg.position ?? "br",
    initialIsOpen: cfg.initialIsOpen ?? "error",
    zIndex: cfg.zIndex ?? 99_998,
    theme: cfg.theme,
  };
};

const escapeHtml = (s: string): string =>
  s
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;");

class VitePluginESLint2Overlay extends HTMLElement {
  private readonly shadow: ShadowRoot;
  private payload: OverlayPayload | undefined;
  private isOpen = false;
  private config = normalizeConfig(false);

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  // Public API, called by inject() before the element is connected.
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
          errors += 1;
        } else {
          warnings += 1;
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
    // "error": open only when at least one error is present.
    return this.hasError;
  }

  setPayload(payload: OverlayPayload | undefined) {
    this.payload = payload;
    // Respect the user's toggle once they have touched it; until then follow the
    // initialIsOpen policy on every update, so fixing the last error collapses it.
    // biome-ignore lint/suspicious/noUnnecessaryConditions: `userToggled` is set in `toggle()`; Biome reads the field initializer as a constant.
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
          display: block;
          position: fixed;
          ${pos.host}
          z-index: ${zIndex};
          font-family: var(--vite-plugin-eslint2-font-mono);
          color: var(--vite-plugin-eslint2-text);
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 16px;
          padding: 8px 14px;
          background: var(--vite-plugin-eslint2-bg);
          color: var(--vite-plugin-eslint2-text);
          border-radius: var(--vite-plugin-eslint2-radius);
          cursor: pointer;
          user-select: none;
          font-size: 13px;
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
          position: fixed;
          ${pos.panel}
          width: calc(100vw - 32px);
          height: calc(100dvh - 96px);
          overflow: auto;
          background: var(--vite-plugin-eslint2-panel-bg);
          border-radius: var(--vite-plugin-eslint2-radius);
          box-shadow: 0 4px 24px rgba(0,0,0,0.5);
          padding: 12px 0;
          opacity: 0;
          visibility: hidden;
          transform: translateY(8px);
          transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
          pointer-events: none;
        }
        .panel.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
          pointer-events: auto;
        }
        .file {
          padding: 10px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .file:last-child { border-bottom: none; }
        .file-path {
          color: var(--vite-plugin-eslint2-text);
          opacity: 0.75;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 600;
          word-break: break-all;
        }
        .msg {
          display: flex;
          gap: 10px;
          padding: 3px 0;
          font-size: 13px;
          line-height: 1.5;
        }
        .msg .sev {
          flex: 0 0 auto;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
        }
        .msg .sev.error { color: var(--vite-plugin-eslint2-error); }
        .msg .sev.warning { color: var(--vite-plugin-eslint2-warning); }
        .msg .loc {
          flex: 0 0 auto;
          opacity: 0.6;
        }
        .msg .text {
          flex: 1 1 auto;
        }
        .msg .rule {
          opacity: 0.55;
          font-style: italic;
        }
        .empty {
          padding: 16px;
          opacity: 0.6;
          font-size: 13px;
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

    // biome-ignore lint/suspicious/noUnnecessaryConditions: `isOpen` is reassigned in `setPayload`, `toggle` and `renderShell`; Biome reads the field initializer as a constant.
    panel.classList.toggle("open", this.isOpen && errors + warnings > 0);

    // biome-ignore lint/suspicious/noUnnecessaryConditions: same `isOpen` field as above.
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
 * Mount the overlay element and wire up the WebSocket events.
 *
 * A no-op when `document` is missing (SSR, headless tests). Skipping the ping then
 * tells the server to fall back to terminal-only output.
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
    // Tell the server this client is ready. It gates WebSocket pushes on this ping,
    // which is how it knows to warn and fall back to terminal output where the
    // runtime never loads (mini-programs, no index.html entry).
    import.meta.hot.send(WS_RUNTIME_LOADED_EVENT);
  }
}
