# Migrate from vite-plugin-eslint

`vite-plugin-eslint2` is forked from [gxmari007/vite-plugin-eslint](https://github.com/gxmari007/vite-plugin-eslint) and has been actively maintained with new features, broader compatibility, and bug fixes. This guide walks you through the migration.

## Install

```sh
npm uninstall vite-plugin-eslint
npm install vite-plugin-eslint2 -D
```

## Update Import

```diff
- import eslint from 'vite-plugin-eslint'
+ import eslint from 'vite-plugin-eslint2'
```

## Options Changes

### Default Value Changes

| Option | vite-plugin-eslint | vite-plugin-eslint2 |
|--------|--------------------|---------------------|
| `cache` | `false` | `true` |
| `include` | `['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx', '**/*.vue', '**/*.svelte']` | `['src/**/*.{js,jsx,ts,tsx,vue,svelte}']` |
| `exclude` | `['**/node_modules/**']` | `['node_modules', 'virtual:']` |

The `cache` default change means caching is enabled out of the box. The `include` default is now scoped to `src/` — if your source files are outside `src/`, you need to override `include`.

### Removed Options

| Option | Replacement |
|--------|-------------|
| `failOnError` | Use `emitErrorAsWarning` (set to `true` to downgrade errors to warnings and prevent build failure) |
| `failOnWarning` | Use `emitWarningAsError` (set to `true` to upgrade warnings to errors and cause build failure) |

### New Options

| Option | Default | Description |
|--------|---------|-------------|
| `test` | `false` | Run ESLint under `test` mode (Vitest) |
| `dev` | `true` | Run ESLint under `vite dev` |
| `build` | `false` | Run ESLint under `vite build` |
| `cacheLocation` | `'.eslintcache'` | Path to the cache file |
| `eslintPath` | `'eslint'` | Custom path to ESLint |
| `lintInWorker` | `false` | Lint in a worker thread for better performance |
| `lintOnStart` | `false` | Lint all matching files on project startup |
| `lintDirtyOnly` | `true` | Only lint modified files outside `buildStart` |
| `emitErrorAsWarning` | `false` | Emit found errors as warnings |
| `emitWarningAsError` | `false` | Emit found warnings as errors |

### Type Changes

| Option | vite-plugin-eslint | vite-plugin-eslint2 |
|--------|--------------------|---------------------|
| `formatter` | `string \| (results) => string` | `string` |

The `formatter` option no longer accepts a function. Pass the name or path of a formatter instead.

### `cacheLocation` Behavior

In `vite-plugin-eslint`, `cacheLocation` defaults to Vite's `cacheDir + '/.eslintcache'`. In `vite-plugin-eslint2`, it defaults to `.eslintcache` in the project root (following ESLint's own default).

## Behavior Changes

### `apply` Hook

`vite-plugin-eslint` runs in all modes unconditionally. `vite-plugin-eslint2` uses an `apply` hook to control when the plugin is active:

| Scenario | vite-plugin-eslint | vite-plugin-eslint2 |
|----------|-------------------|---------------------|
| `vite dev` | Runs | Runs (`dev: true`) |
| `vite build` | Runs | Does **not** run (`build: false`) |
| Vitest | Runs | Does **not** run (`test: false`) |

If you need to lint during build, set `build: true`:

```ts
eslint({ build: true })
```

### Virtual Module Handling

`vite-plugin-eslint2` force-ignores virtual modules (`virtual:`, `\0`-prefixed, and module IDs without `/`). You no longer need to manually exclude them.

## Version Compatibility

| | vite-plugin-eslint | vite-plugin-eslint2 |
|-|-------------------|---------------------|
| Vite | v2 ~ v3 | v2 ~ v8 |
| ESLint | v7 | v7 ~ v10 |
| Node | — | >= 18 |

## Example After Migration

```ts
// vite.config.ts
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint2";

export default defineConfig({
  plugins: [eslint()],
});
```

If you need lint during build (matching the old default behavior):

```ts
export default defineConfig({
  plugins: [eslint({ build: true })],
});
```

Recommended configuration for best developer experience:

```ts
export default defineConfig({
  plugins: [eslint({
    fix: true,
    lintInWorker: true,
    lintOnStart: true,
  })],
});
```
