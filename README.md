# @modyqyw/vite-plugin-eslint

[![npm](https://img.shields.io/npm/v/@modyqyw/vite-plugin-eslint)](https://www.npmjs.com/package/@modyqyw/vite-plugin-eslint)
[![GitHub license](https://img.shields.io/github/license/ModyQyW/vite-plugin-eslint)](https://github.com/ModyQyW/vite-plugin-eslint/blob/master/LICENSE)

Vite ESLint plugin. Supports vite@2 and vite@3.

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
      fix: true,
      ...,
    }),
  ],
});
```

Additional options and explanations are listed below.

### `cache`

- Type: `boolean`
- Default: `true`

Store the results of processed files when enabled. This is enabled by default to improve speed.

### `cacheLocation`

- Type: `string`
- Default: `path.join('node_modules', '.vite', 'vite-plugin-eslint')`

Path to a file or directory for the cache location.

### `include`

- Type: `string | string[]`
- Default: `['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue', 'src/**/*.svelte']`

A valid [picomatch](https://github.com/micromatch/picomatch#globbing-features) pattern, or array of patterns.

This is used to [create a filter](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter) to determine [`eslint.lintFiles` params](https://eslint.org/docs/developer-guide/nodejs-api#-eslintlintfilespatterns).

### `exclude`

- Type: `string | string[]`
- Default: `['node_modules', 'virtual:']`

A valid [picomatch](https://github.com/micromatch/picomatch#globbing-features) pattern, or array of patterns.

This is used to [create a filter](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter) to determine [`eslint.lintFiles` params](https://eslint.org/docs/developer-guide/nodejs-api#-eslintlintfilespatterns).

### `eslintPath`

- Type: `string`
- Default: `'eslint'`

Path to ESLint instance that will be used for linting. Read [vite server.fs options](https://vitejs.dev/config/#server-fs-strict) first.

### `formatter`

- Type: `string`
- Default: `'stylish'`

The name or the path of a formatter.

This is used to [load a formatter](https://eslint.org/docs/developer-guide/nodejs-api#-eslintloadformatternameorpath) in order to convert lint results to a human- or machine-readable string.

### `lintOnStart`

- Type: `boolean`
- Default: `false`

Lint on start. Useful to check all codes, but slow down speed. This is disabled by default.

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
    <li>Or delete the cache file (default <code>node_modules/.vite/vite-plugin-eslint</code>), fix errors manully and restart Vite.
    </li>
  </ul>
  This problem should only happens when starting Vite with ESLint errors. Have a better solution? PR welcome. :)
</details>

<details>
  <summary><code>Vite</code> is slow when using this plugin</summary>
  <p>You can try <a href="https://github.com/fi3ework/vite-plugin-checker">vite-plugin-checker</a>, or just run <code>ESLint</code> besides <code>Vite</code>.</p>
</details>

## Examples

See [examples](https://github.com/ModyQyW/vite-plugin-eslint/tree/main/examples).

## CHANGELOG

See [CHANGELOG.md](./CHANGELOG.md).

## Acknowledge

Initially forked from [gxmari007/vite-plugin-eslint](https://github.com/gxmari007/vite-plugin-eslint).

## License

MIT
