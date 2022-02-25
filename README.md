# @modyqyw/vite-plugin-eslint

[![npm](https://img.shields.io/npm/v/@modyqyw/vite-plugin-eslint)](https://www.npmjs.com/package/@modyqyw/vite-plugin-eslint)
[![GitHub license](https://img.shields.io/github/license/ModyQyW/vite-plugin-eslint)](https://github.com/ModyQyW/vite-plugin-eslint/blob/master/LICENSE)

Vite ESLint plugin.

You may want [Vite Stylelint plugin](https://github.com/ModyQyW/vite-plugin-stylelint).

## Install

```sh
npm install @modyqyw/vite-plugin-eslint --save-dev
# or
yarn add @modyqyw/vite-plugin-eslint --dev
```

`@modyqyw/vite-plugin-eslint` does not install and config ESLint for you. You should handle these yourself.

## Usage

```js
import { defineConfig } from 'vite';
import ESLintPlugin from '@modyqyw/vite-plugin-eslint';

export default defineConfig({
  plugins: [ESLintPlugin()],
});
```

## Options

### `cache`

- Type: `boolean`
- Default: `true`

Decrease execution time.

### `cacheLocation`

- Type: `string`
- Default: `path.resolve(process.cwd(), 'node_modules', '.vite', 'vite-plugin-eslint')`

Path to a file or directory for the cache location.

### `fix`

- Type: `boolean`
- Default: `false`

Auto fix source code.

### `include`

- Type: `string | string[] | RegExp`
- Default: `/.*\.(vue|js|jsx|ts|tsx)$/`

A single file, array of files, or RegExp to include when linting.

### `exclude`

- Type: `string | string[] | RegExp`
- Default: `/node_modules/`

A single file, array of files, or RegExp to exclude when linting.

### `formatter`

- Type: `ESLint.Formatter | string`
- Default: `'stylish'`

Custom error formatter or the name of a built-in formatter.

### `throwOnWarning`

- Type: `boolean`
- Default: `true`

The warnings found will be emitted, default to true.

### `throwOnError`

- Type: `boolean`
- Default: `true`

The errors found will be emitted, default to true.

## License

MIT
