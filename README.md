# @modyqyw/vite-plugin-eslint

[![npm](https://img.shields.io/npm/v/@modyqyw/vite-plugin-eslint)](https://www.npmjs.com/package/@modyqyw/vite-plugin-eslint)
[![GitHub license](https://img.shields.io/github/license/ModyQyW/vite-plugin-eslint)](https://github.com/ModyQyW/vite-plugin-eslint/blob/master/LICENSE)

Vite ESLint plugin.

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

Store the results of processed files. This is enabled by default to improve speed.

### `cacheLocation`

- Type: `string`
- Default: `path.join('node_modules', '.vite', 'vite-plugin-eslint')`

Path to a file or directory for the cache location.

### `include`

- Type: `FilterPattern`
- Default: `[/.*\.(vue|js|jsx|ts|tsx)$/]`

A valid [picomatch](https://github.com/micromatch/picomatch#globbing-features) pattern, or array of patterns.

This is used to [create a filter](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter) to determine [`eslint.lintFiles` params](https://eslint.org/docs/developer-guide/nodejs-api#-eslintlintfilespatterns).

### `exclude`

- Type: `FilterPattern`
- Default: `[/node_modules/, viteConfig.build.outDir]`

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

### `emitError`

- Type: `boolean`
- Default: `true`

The errors found will be emitted by default.

### `emitWarning`

- Type: `boolean`
- Default: `true`

The warnings found will be emitted by default.

## CHANGELOG

See [CHANGELOG.md](./CHANGELOG.md).

## License

MIT
