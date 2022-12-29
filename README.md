# @modyqyw/vite-plugin-eslint

[![npm](https://img.shields.io/npm/v/@modyqyw/vite-plugin-eslint)](https://www.npmjs.com/package/@modyqyw/vite-plugin-eslint)
[![GitHub license](https://img.shields.io/github/license/ModyQyW/vite-plugin-eslint)](https://github.com/ModyQyW/vite-plugin-eslint/blob/master/LICENSE)

Vite ESLint plugin. Supports Vite v2, v3 and v4. Requires `node >= 14.18`.

You may want [Vite Stylelint plugin](https://github.com/ModyQyW/vite-plugin-stylelint).

## Install

```sh
npm install @modyqyw/vite-plugin-eslint -D
```

`@modyqyw/vite-plugin-eslint` does not install and config ESLint for you. You should handle these yourself.

<details>

<summary>ESLint@7</summary>

```sh
npm install eslint@^7 @types/eslint@^7 -D
```

</details>

<details>

<summary>ESLint@8</summary>

```sh
npm install eslint@^8 @types/eslint@^8 -D
```

</details>

## Usage

```js
import { defineConfig } from 'vite';
import ESLintPlugin from '@modyqyw/vite-plugin-eslint';

export default defineConfig({
  plugins: [ESLintPlugin(options)],
});
```

## Options

You can pass ESLint [Node.js API constructor options](https://eslint.org/docs/developer-guide/nodejs-api#-new-eslintoptions) to the plugin.

```ts
import { defineConfig } from 'vite';
import ESLintPlugin from 'vite-plugin-eslint';

export default defineConfig({
  plugins: [
    ESLintPlugin({
      // recommend to enable auto fix
      fix: true,
      ...,
    }),
  ],
});
```

Additional options and explanations are listed below.

### `dev`

- Type: `boolean`
- Default: `true`

Run ESLint under `serve` command. See [Command Line Interface](https://vitejs.dev/guide/#command-line-interface) for more.

### `build`

- Type: `boolean`
- Default: `false`

Run ESLint under `build` command. See [Command Line Interface](https://vitejs.dev/guide/#command-line-interface) for more.

### `cache`

- Type: `boolean`
- Default: `true`

Store the results of processed files when enabled. This is enabled by default to improve speed.

### `cacheLocation`

- Type: `string`
- Default: `.eslintcache`

Path to a file or directory for the cache location. `.eslintcache` is the default cache location of ESLint.

### `include`

- Type: `string | string[]`
- Default: `['src/**/*.{js,jsx,ts,tsx,vue,svelte}']`

A valid [picomatch](https://github.com/micromatch/picomatch#globbing-features) pattern, or array of patterns.

This is used to [create a filter](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter) to determine [`eslint.lintFiles` params](https://eslint.org/docs/developer-guide/nodejs-api#-eslintlintfilespatterns).

You may want to change this option if you are using `nuxt`.

<details>
  <summary>nuxt example</summary>

```typescript
// nuxt.config.ts
import viteEslint from 'vite-plugin-eslint';

export default defineNuxtConfig({
  vite: {
    plugins: [
      viteEslint({
        ...,
        include: [
          'components/**/*.{js,jsx,ts,tsx,vue}',
          'composables/**/*.{js,jsx,ts,tsx,vue}',
          'constants/**/*.{js,jsx,ts,tsx,vue}',
          'content/**/*.{js,jsx,ts,tsx,vue}',
          'helpers/**/*.{js,jsx,ts,tsx,vue}',
          'layouts/**/*.{js,jsx,ts,tsx,vue}',
          'middleware/**/*.{js,jsx,ts,tsx,vue}',
          'middlewares/**/*.{js,jsx,ts,tsx,vue}',
          'pages/**/*.{js,jsx,ts,tsx,vue}',
          'plugins/**/*.{js,jsx,ts,tsx,vue}',
          'server/**/*.{js,jsx,ts,tsx,vue}',
          'src/**/*.{js,jsx,ts,tsx,vue}',
          'stores/**/*.{js,jsx,ts,tsx,vue}',
          'styles/**/*.{js,jsx,ts,tsx,vue}',
          'utils/**/*.{js,jsx,ts,tsx,vue}',
          'app.vue',
          'App.vue',
          'error.vue',
          'Error.vue',
          'app.config.ts',
          'nuxt.config.ts',
        ],
      }),
    ],
  },
});
```

</details>

### `exclude`

- Type: `string | string[]`
- Default: `['node_modules', 'virtual:']`

A valid [picomatch](https://github.com/micromatch/picomatch#globbing-features) pattern, or array of patterns.

This is used to [create a filter](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter) to determine [`eslint.lintFiles` params](https://eslint.org/docs/developer-guide/nodejs-api#-eslintlintfilespatterns).

### `eslintPath`

- Type: `string`
- Default: `'eslint'`

Path to ESLint that will be used for linting. Use [dynamic import](https://javascript.info/modules-dynamic-imports) under the hood. Read [vite server.fs options](https://vitejs.dev/config/server-options.html#server-fs-strict) first.

### `formatter`

- Type: `string`
- Default: `'stylish'`

The name or the path of a formatter.

This is used to [load a formatter](https://eslint.org/docs/developer-guide/nodejs-api#-eslintloadformatternameorpath) in order to convert lint results to a human- or machine-readable string.

### `lintInWorker`

- Type: `boolean`
- Default: `false`

Lint in [worker](https://nodejs.org/api/worker_threads.html#portpostmessagevalue-tran). This is disabled by default.

When lint in worker, Vite build process will be faster. Vite build process will not be stopped, even with errors shown in terminal.

It is similar with [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker), but [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker) can show you errors and warnings in browsers.

### `lintOnStart`

- Type: `boolean`
- Default: `false`

Lint on start (in `buildStart` hook). Useful to lint all files once to find potential errors. This is disabled by default.

This will significantly slow down Vite first starting if you has no caches and don't enable `lintInWorker`.

### `emitError`

- Type: `boolean`
- Default: `true`

The errors found will be emitted when enabled. This is enabled by default.

### `emitErrorAsWarning`

- Type: `boolean`
- Default: `false`

The errors found will be emitted as warnings when enabled. This is disabled by default but you may want it enabled when prototyping.

### `emitWarning`

- Type: `boolean`
- Default: `true`

The warnings found will be emitted when enabled. This is enabled by default.

### `emitWarningAsError`

- Type: `boolean`
- Default: `false`

The warnings found will be emitted as errors when enabled. This is disabled by default.

## FAQ

<details>
  <summary>Cache is broken</summary>
  <ul>
    <li>Disable <code>cache</code> option.</li>
    <li>Or delete the cache file (default <code>.eslintcache</code>), fix errors manully and restart Vite.
    </li>
  </ul>
  This problem should only happens when starting Vite with ESLint errors. Have a better solution? PR welcome. :)
</details>

<details>
  <summary><code>Vite</code> is slow when using this plugin</summary>
  <ul>
    <li>Try enable <code>lintInWorker</code> option</li>
    <li>Or try <a href="https://github.com/fi3ework/vite-plugin-checker">vite-plugin-checker</a></li>
    <li>Or run ESLint directly besides Vite</li>
  </ul>
</details>

<details>
  <summary>What's the difference between <a href="https://github.com/gxmari007/vite-plugin-eslint">gxmari007/vite-plugin-eslint</a> and this project?</summary>
  <p>This project is initially forked from <a href="https://github.com/gxmari007/vite-plugin-eslint">gxmari007/vite-plugin-eslint</a>. Because the project looked like dead at that time, leaving issues and PRs. I sent an email to the author but I got no response.<p>
  <p>I add some functions to meet my needs, like <code>eslint@8</code> support, <code>eslintPath</code> option, <code>lintInWorker</code> option, <code>lintOnStart</code> option and ignore virtual modules by default.</p>
  <p>I will still keep updating this project. Feel free to choose one.</p>
</details>

## Examples

See [examples](https://github.com/ModyQyW/vite-plugin-eslint/tree/main/examples).

## CHANGELOG

See [CHANGELOG.md](./CHANGELOG.md).

## Acknowledge

Initially forked from [gxmari007/vite-plugin-eslint](https://github.com/gxmari007/vite-plugin-eslint).

## License

MIT
