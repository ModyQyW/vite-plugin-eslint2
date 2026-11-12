# Migrate from vite-plugin-eslint

`vite-plugin-eslint2` is forked from [gxmari007/vite-plugin-eslint](https://github.com/gxmari007/vite-plugin-eslint) and is still maintained. It adds features, supports more versions and fixes bugs. These are the steps to move over.

## Install

```sh
npm uninstall vite-plugin-eslint
npm install vite-plugin-eslint2 -D
```

## Update the import

```diff
- import eslint from 'vite-plugin-eslint'
+ import eslint from 'vite-plugin-eslint2'
```

## Option changes

### Defaults

| Option    | vite-plugin-eslint                                                            | vite-plugin-eslint2                     |
| --------- | ----------------------------------------------------------------------------- | --------------------------------------- |
| `cache`   | `false`                                                                       | `true`                                  |
| `include` | `['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx', '**/*.vue', '**/*.svelte']`     | `['src/**/*.{js,jsx,ts,tsx,vue,svelte}']` |
| `exclude` | `['**/node_modules/**']`                                                      | `['node_modules', 'virtual:']`          |

`cache` is now on out of the box. `include` is limited to `src/`, so override it if your sources live elsewhere.

### Removed options

| Option          | Replacement                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------- |
| `failOnError`   | `emitErrorAsWarning` — set it to `true` to downgrade errors to warnings and keep the build green |
| `failOnWarning` | `emitWarningAsError` — set it to `true` to upgrade warnings to errors and fail the build         |

### New options

| Option                | Default         | Description                                          |
| --------------------- | --------------- | ---------------------------------------------------- |
| `test`                | `false`         | Run ESLint under `test` mode (Vitest)                 |
| `dev`                 | `true`          | Run ESLint under `vite dev`                           |
| `build`               | `false`         | Run ESLint under `vite build`                         |
| `cacheLocation`       | `'.eslintcache'` | Path to the cache file                               |
| `eslintPath`          | `'eslint'`       | Custom path to ESLint                                |
| `lintInWorker`        | `false`         | Lint in a worker thread                              |
| `lintOnStart`         | `false`         | Lint everything that matches on startup              |
| `lintDirtyOnly`       | `true`          | Outside `buildStart`, lint only changed files         |
| `emitErrorAsWarning`  | `false`         | Report errors as warnings                            |
| `emitWarningAsError`  | `false`         | Report warnings as errors                            |

### Type changes

| Option      | vite-plugin-eslint                | vite-plugin-eslint2 |
| ----------- | --------------------------------- | ------------------- |
| `formatter` | `string \| (results) => string`   | `string`            |

`formatter` no longer takes a function. Pass the name or path of a formatter.

### `cacheLocation`

`vite-plugin-eslint` defaults it to Vite's `cacheDir + '/.eslintcache'`. `vite-plugin-eslint2` defaults to `.eslintcache` in the project root, which is ESLint's own default.

## Behaviour changes

### The `apply` hook

`vite-plugin-eslint` runs in every mode. `vite-plugin-eslint2` uses `apply` to decide when it is active:

| Scenario     | vite-plugin-eslint | vite-plugin-eslint2    |
| ------------ | ------------------ | ---------------------- |
| `vite dev`   | Runs               | Runs (`dev: true`)      |
| `vite build` | Runs               | Does not run (`build: false`) |
| Vitest       | Runs               | Does not run (`test: false`)  |

To lint during a build, set `build: true`:

```ts
eslint({ build: true })
```

### Virtual modules

`vite-plugin-eslint2` always ignores virtual modules: `virtual:`, the `\0` prefix, and module IDs without a `/`. You no longer have to exclude them yourself.

## Version compatibility

|        | vite-plugin-eslint | vite-plugin-eslint2 |
| ------ | ------------------ | ------------------- |
| Vite   | v2 to v3           | v2 to v8            |
| ESLint | v7                 | v7 to v10           |
| Node   | —                  | >= 18               |

## After the migration

```ts
// vite.config.ts
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint2";

export default defineConfig({
  plugins: [eslint()],
});
```

To lint during a build, which is what the old plugin did by default:

```ts
export default defineConfig({
  plugins: [eslint({ build: true })],
});
```

A good starting point for day-to-day work:

```ts
export default defineConfig({
  plugins: [eslint({
    fix: true,
    lintInWorker: true,
    lintOnStart: true,
  })],
});
```
