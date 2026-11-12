# vite-plugin-eslint2

A Vite plugin that runs ESLint against the modules Vite processes. Published from a monorepo whose only published package is `packages/core`.

## Project

- **Runtime.** The repo toolchain needs Node `^22.22.2 || >=24.15.0` (root `engines`), which is what ultracite 8 requires. `.node-version` is `24`; CI tests 22, 24 and 26. The published package declares `engines.node: ">=18"` because it still works with ESLint 7 and Vite 2 — do not raise that floor to match the toolchain.
- **Package manager.** pnpm 12, pinned by `packageManager: pnpm@12.18.0`; `preinstall` runs `only-allow pnpm`. Settings live in `pnpm-workspace.yaml`, not `.npmrc` (pnpm 12 reads only auth, registry, TLS, proxy and `local-address` from `.npmrc`). `allowBuilds` is the map that replaced pnpm 10's `onlyBuiltDependencies`.
- **Dependency versions.** Every `dependencies`/`devDependencies` entry is written as `catalog:` (peer ranges and `workspace:*` are the exceptions). Bump the version in the `catalog:` map of `pnpm-workspace.yaml`; editing a member's `package.json` version string breaks the convention.
- **Build.** `packages/core/tsdown.config.ts` runs two builds. `src/index.ts` + `src/worker.ts` emit ESM and CJS with `.d.mts`/`.d.cts` at target `node18`, plus a shared `linter-*.mjs`/`.cjs` chunk. `src/client/runtime.ts` emits a browser-only ESM bundle (`dist/client-runtime.js`, `platform: browser`, `target: es2020`, no types) that `index.ts` inlines with `readFileSync`. The public entry is dual: `exports["."].import` (ESM) and `exports["."].require` (CJS), each with its own types file.
- **Bundled vs external.** `@rollup/pluginutils` and `debug` are real dependencies and stay external. `picocolors` is a devDependency because tsdown bundles it into the output — move it to `dependencies` and the bundle would import it at runtime instead.
- **Peer dependencies** (`packages/core`): `eslint ^7 || ^8 || ^9 || ^10`, `vite ^2 … ^8`, plus optional `@types/eslint`, `rolldown`, `rollup`. Widening a peer range is a user-facing change.
- **Workspace.** `docs`, `packages/*`, `examples/*`. Only `packages/core` is published; `docs` and `examples/react-ts` are private. `dist/` is git-ignored and never committed.

## Commands

```bash
pnpm install           # workspace install; pnpm 12 verifies the lockfile against supply-chain policy
pnpm build             # rimraf packages/*/dist, then tsdown per package, then build-post
pnpm dev               # tsdown --watch for packages/* — required while working on an example
pnpm test              # vitest run (no config file; picks up **/*.test.ts)
pnpm test:coverage     # same, with @vitest/coverage-v8
pnpm typecheck         # tsc --noEmit, then tsc --noEmit inside docs/
pnpm check             # ultracite check (Biome): report only
pnpm fix               # ultracite fix (Biome): apply safe fixes
pnpm docs:dev          # rspress dev for docs/
pnpm docs:build        # rspress build; also emits llms.txt, llms-full.txt and one .md per page
pnpm docs:preview      # serve the built docs site
pnpm -C examples/react-ts dev    # dev server against the current dist
pnpm -r --filter=./examples/* run build   # needs `pnpm build` first, see below
```

`pnpm build` must run before any example builds or runs: the example resolves `vite-plugin-eslint2` through `packages/core`'s `exports`, which points at `dist/`, so an unbuilt tree fails with `TS2307: Cannot find module 'vite-plugin-eslint2'`.

The plugin only lints in `serve` (`build` and `test` default to off), so `vite build` in the example exercises the bundle but not the lint path. To see it lint, run the dev server and request a module.

## Architecture

| Module | Role |
| --- | --- |
| `packages/core/src/index.ts` | The Vite plugin object. Wires `apply`, `configResolved`, `configureServer`, `buildStart`, `resolveId`, `load`, `transformIndexHtml`, `transform`, `buildEnd`; owns the overlay handshake state and the worker instance. |
| `packages/core/src/linter.ts` | The deep module. `createLinter(options, adapters)` returns `{ lint, lintAll }`; also exports `filterResults`, `buildOverlayPayload`, `OverlayManager` and `shouldIgnoreModule` for testing. Knows ESLint and the Vite plugin-context type; no Vite hooks. |
| `packages/core/src/worker.ts` | Worker adapter, under 40 lines. Forwards `parentPort` messages to `linter.lint(id)` and overlay payloads back to the main thread. |
| `packages/core/src/client/preamble.ts` | Builds the inline `<script>` that imports the runtime virtual module and calls `inject()`. |
| `packages/core/src/client/runtime.ts` | Browser half of the custom overlay. Standalone ESM, Shadow DOM, zero imports at runtime. |
| `packages/core/src/types.ts` | Public option types. JSDoc here is bilingual (English block, then Chinese) and is the source the docs mirror. |
| `packages/core/src/constants.ts` | Plugin name, ESLint severity values, WebSocket event names, virtual module IDs, `PLUGIN_OPTION_KEYS`. |
| `packages/core/src/utils.ts` | `getOptions`, which turns user options into the fully-defaulted shape. |

### Options share one namespace with ESLint

`ESLintPluginOptions extends ESLint.ESLint.Options`, so plugin options and ESLint options live in one flat object. `getOptions` destructures the plugin keys to apply defaults; `getESLintConstructorOptions` filters out everything in `PLUGIN_OPTION_KEYS` and forwards the rest to the ESLint constructor. Adding a plugin option therefore takes four edits:

1. the field in `ESLintPluginOptions` (`types.ts`), with bilingual JSDoc,
2. its default in `getOptions` (`utils.ts`),
3. its name in `PLUGIN_OPTION_KEYS` (`constants.ts`) — miss this and the option is silently forwarded to ESLint,
4. `filterResults` plus a test if it affects filtering or severity.

`cache`, `cacheLocation` and `fix` are deliberately absent from `PLUGIN_OPTION_KEYS`: they are real ESLint options the plugin passes through.

### `context` is per call, never captured

Vite runs `transform` hooks concurrently. The linter takes the `PluginContext` as an argument on every `lint`/`lintAll` call; a captured closure would be overwritten between concurrent lints and emit to the wrong module. The worker omits it entirely and emits to stdout.

### Custom overlay handshake

Under `serve` with `customOverlay` on, `index.ts` injects the runtime via `transformIndexHtml`, then waits for a `vite:eslint2:runtime-loaded` ping over Vite's WebSocket before pushing `vite:eslint2:overlay` payloads. Payloads arriving before the ping are buffered in `pendingPayload` and replayed. No ping within `OVERLAY_DEGRADE_GRACE_MS` (2000 ms) means a DOM-less environment (mini-program, SSR, headless): warn once, stop pushing, keep printing to the terminal. In this mode `index.ts` passes an `emit` adapter that writes to `console.log`, so `report` never reaches `context.error`/`context.warn` — doing so would trigger the native overlay the custom one replaces.

The WebSocket event names are inlined as string literals in `client/runtime.ts` (it must bundle without importing node-side modules) **and** exported from `constants.ts`. Change both or the handshake silently stops matching.

The runtime bundle is read from `dist/client-runtime.js` at first use. Running the plugin from source without `pnpm build` throws `custom overlay runtime bundle not found`.

### Worker color

A worker's stdout is a pipe, so picocolors disables color at module load. `getWorkerEnv` forwards the main thread's color support, honors `NO_COLOR`/`FORCE_COLOR`, and forces color only when the parent is a TTY.

### `.vue` / `.svelte` style submodules are skipped

`shouldIgnoreModule` keeps `x.vue?type=style` and `y.svelte?type=style` out of ESLint: those submodules carry extracted CSS, not JavaScript.

### Two Biome findings are suppressed on purpose

`client/runtime.ts` marks `this.userToggled` and `this.isOpen` with `biome-ignore lint/suspicious/noUnnecessaryConditions`. Biome 2.6 reads those class fields' `false` initializers as constants and calls the checks redundant; the fields are reassigned at runtime, so the guards are real. `index.ts` carries one more for `Vite.withFilter`, which only exists from Vite 6 on while the installed types always declare it.

## Conventions

- **Lint.** Biome through `ultracite` (`biome.json` extends `ultracite/biome/core` and `ultracite/biome/react`, trailing commas everywhere). `biome.json` excludes `**/examples`, `**/.pi`, `**/.claude`, `**/.codex` and `lerna.json`. Biome 2.6 formats SVGs, so `vite-plugin-eslint2.svg` is formatter output, not hand-written. There is no git hook: CI runs `pnpm check` and `.vscode/settings.json` formats on save, nothing else enforces it locally.
- **Comments and docs.** Public option JSDoc in `types.ts` and the guide pages in `docs/docs/*/guide/options.md` are mirrored in English and Chinese; change both in the same commit. File comments are English.
- **Tests.** Vitest at the behavior boundary. `linter.test.ts` covers the pure helpers with hand-built `LinterResult` fixtures. `linter.integration.test.ts` runs the installed ESLint against a temp directory — extend it rather than mocking ESLint's API shape, since it is what catches an ESLint major breaking the plugin. Use `mkdtemp` + `tmpdir` and clean up in `afterEach`.
- **Docs site.** Rspress, content root `docs/docs/`, one directory per locale (`en`, `zh`). Nav and sidebar come from `_nav.json` and `_meta.json` in each locale directory, not from the config. `en` is the default locale so its routes carry no prefix; `zh` keeps `/zh/`. Static files live in `docs/docs/public/`. Page URLs are stable — `/guide/*` and `/zh/guide/*` — so keep file names when editing.
- **Commits.** Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`). `pnpm release` runs `lerna version` on `main` after `preversion` (`fix`, `typecheck`, `test`).
- **This file.** Root only, by design: `docs` and `examples/react-ts` are thin enough that a per-member file would restate it.
