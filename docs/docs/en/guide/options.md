# Options

You can pass ESLint [Node.js API constructor options](https://eslint.org/docs/developer-guide/nodejs-api#-new-eslintoptions) to the plugin, and you can also pass the extra options it adds on top.

## Constructor Options

The common ones are listed below; the link above has the full set.

### `fix`

- Type: `boolean`
- Default: `false`

Fix problems automatically.

### `cache`

- Type: `boolean`
- ESLint default: `false`
- Plugin default: `true`

Turn on ESLint's cache. ESLint disables it, the plugin enables it for speed.

### `cacheLocation`

- Type: `string`
- Default: `.eslintcache`

Where the cache file lives.

## Extra Options

These are the options the plugin adds.

### `test`

- Type: `boolean`
- Default: `false`

Run ESLint under `test` mode. See [Command Line Interface](https://vite.dev/guide/#command-line-interface) and [Configuring Vitest](https://vitest.dev/guide/#configuring-vitest).

### `dev`

- Type: `boolean`
- Default: `true`

Run ESLint under the `serve` command. See [Command Line Interface](https://vite.dev/guide/#command-line-interface).

### `build`

- Type: `boolean`
- Default: `false`

Run ESLint under the `build` command. See [Command Line Interface](https://vite.dev/guide/#command-line-interface).

### `include`

- Type: `string | string[]`
- Default: `['src/**/*.{js,jsx,ts,tsx,vue,svelte}']`

The files you want linted. You rarely need to change it, unless `include` and `exclude` overlap.

How the value is used depends on which hooks run:

- With the defaults, the plugin only calls [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns) from the `transform` hook. The value goes through [createFilter](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter) to decide whether to lint and what to pass, so it has to satisfy [picomatch@2.3.1](https://github.com/micromatch/picomatch/tree/2.3.1).
- With `lintOnStart` on, the plugin also calls it from `buildStart`. No filter there — the value is the argument — so it also has to satisfy [minimatch@3.1.2](https://github.com/isaacs/minimatch/tree/3.1.2).
- With `lintDirtyOnly` off, the value is the argument for every call outside `buildStart`, so it needs [minimatch@3.1.2](https://github.com/isaacs/minimatch/tree/3.1.2) too.

### `exclude`

- Type: `string | string[]`
- Default: `['node_modules', 'virtual:']`

The files you do not want linted. You rarely need to change it, unless `include` and `exclude` overlap.

Virtual modules are always ignored, so you do not need to list them here.

With the defaults, the same `transform` filter as `include` applies, so the value has to satisfy [picomatch@2.3.1](https://github.com/micromatch/picomatch/tree/2.3.1).

With `lintOnStart` on or `lintDirtyOnly` off, this value is not passed to ESLint; put the patterns into `include` instead. It still decides which modules get linted.

### `eslintPath`

- Type: `string`
- Default: `"eslint"`

Which ESLint to lint with. Loaded through [dynamic import](https://javascript.info/modules-dynamic-imports), so read [server.fs](https://vite.dev/config/server-options#server-fs-allow) first.

For the flat config system in ESLint v8, set it to `'eslint/use-at-your-own-risk'` and put a flat config file in the project root. If your config lives elsewhere, set the `ESLINT_USE_FLAT_CONFIG` environment variable to true and pass `overrideConfigFile`.

See [Flat config rollout plans](https://eslint.org/blog/2023/10/flat-config-rollout-plans/) and [Configuration Files (New)](https://eslint.org/docs/latest/use/configure/configuration-files-new).

ESLint v10.0.0 and newer only read flat config and no longer provide `'eslint/use-at-your-own-risk'`. See [ESLint v10.0.0 released](https://eslint.org/blog/2026/02/eslint-v10.0.0-released/).

### `formatter`

- Type: `string`
- Default: `"stylish"`

Name or path of a formatter, [loaded](https://eslint.org/docs/developer-guide/nodejs-api#-eslintloadformatternameorpath) to turn results into a human- or machine-readable string.

### `lintInWorker`

- Type: `boolean`
- Default: `false`

Lint in a [worker thread](https://nodejs.org/api/worker_threads.html#portpostmessagevalue-tran).

Vite builds faster this way. The trade-off: no error overlay, and the build is not stopped even when the terminal shows errors.

[@nabla/vite-plugin-eslint](https://github.com/nabla/vite-plugin-eslint) and [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker) work along the same lines. The former only lints in a worker; the latter shows errors and warnings in the browser.

### `customOverlay`

- Type: `false | true | CustomOverlayOptions`
- Default: `false`

Use the plugin's own overlay instead of Vite's native error overlay. The native one pastes ESLint's ANSI-colored `stylish` output in verbatim, so the colors are lost (or the escape codes show up). The custom overlay renders structured results instead, and unlike the native one it still works with `lintInWorker`.

- `false`: keep Vite's native overlay. No overlay in worker mode.
- `true`: custom overlay, default styling.
- `{...}`: custom overlay with the styling you pass.

Only applies under `serve`. In `build` mode the native `context.error` blocking behaviour stays.

Environments without a DOM entry (mini-programs, SSR, headless tests) never get the runtime injected: the plugin warns once and falls back to terminal output only.

```js
eslint({
  customOverlay: true,
});
// or with styling
eslint({
  customOverlay: {
    position: "tl",
    initialIsOpen: true,
    zIndex: 99999,
    theme: {
      "--vite-plugin-eslint2-bg": "#1a1a2e",
      "--vite-plugin-eslint2-panel-bg": "#16213e",
      "--vite-plugin-eslint2-error": "#ff6b6b",
    },
  },
});
```

#### `customOverlay.position`

- Type: `"tl" | "tr" | "bl" | "br"`
- Default: `"br"`

Corner of the viewport that holds the badge and panel.

#### `customOverlay.initialIsOpen`

- Type: `boolean | "error"`
- Default: `"error"`

Whether the panel starts open. `"error"` opens it only when there is at least one error.

#### `customOverlay.zIndex`

- Type: `number`
- Default: `99998`

The overlay's z-index. Configurable because design systems sometimes sit on high layers.

#### `customOverlay.theme`

- Type: `Partial<Record<ThemeKey, string>>`

Override the overlay's CSS variables. The keys are fixed:

- `--vite-plugin-eslint2-bg`
- `--vite-plugin-eslint2-panel-bg`
- `--vite-plugin-eslint2-error`
- `--vite-plugin-eslint2-warning`
- `--vite-plugin-eslint2-text`
- `--vite-plugin-eslint2-font-mono`
- `--vite-plugin-eslint2-radius`

### `lintOnStart`

- Type: `boolean`
- Default: `false`

Lint the files matched by `include` once, in `buildStart`, to catch problems early.

Without a warm cache and with `lintInWorker` off, this makes the first Vite startup noticeably slower.

### `lintDirtyOnly`

- Type: `boolean`
- Default: `true`

Outside `buildStart`, lint only the files that changed and are not matched by `exclude`.

When off, ESLint gets the `include` and `exclude` patterns themselves.

### `emitError`

- Type: `boolean`
- Default: `true`

Report errors.

### `emitErrorAsWarning`

- Type: `boolean`
- Default: `false`

Report errors as warnings. Handy while prototyping.

### `emitWarning`

- Type: `boolean`
- Default: `true`

Report warnings.

### `emitWarningAsError`

- Type: `boolean`
- Default: `false`

Report warnings as errors.
