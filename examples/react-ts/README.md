# react-ts example

A Vite + React + TypeScript app that runs `vite-plugin-eslint2` against the local build in `packages/core`.

## Run it

```sh
# from the repo root
pnpm dev                                   # keep rebuilding packages/core/dist
pnpm -C examples/react-ts dev              # dev server with the plugin active
pnpm -C examples/react-ts build            # production build
```

The plugin only lints in `serve` with the default options. To watch it run during a build, add `build: true` and `lintOnStart: true` to the `eslint(...)` call in `vite.config.ts`.

## What to look at

- `vite.config.ts` — the plugin is called with defaults; commented blocks show the `fix`, worker and `customOverlay` variants, plus a recommended combination.
- `eslint.config.js` — flat config with `@eslint/js`, `typescript-eslint`, `@eslint-react/eslint-plugin`, the React hooks plugin and the React Refresh plugin.
- `src/` — the files the plugin lints.

Add a lint problem (for example an unused variable) and start the dev server to see the plugin report it.
