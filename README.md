# vite-plugin-eslint2

[![npm](https://img.shields.io/npm/v/vite-plugin-eslint2)](https://www.npmjs.com/package/vite-plugin-eslint2)
[![GitHub license](https://img.shields.io/github/license/ModyQyW/vite-plugin-eslint2)](https://github.com/ModyQyW/vite-plugin-eslint2/blob/master/LICENSE)

Vite ESLint plugin. Runs ESLint in `transform` hook by default.

Supports Vite v2 ~ v5. Requires `node>=18`.

You may want [Vite Stylelint plugin](https://github.com/ModyQyW/vite-plugin-stylelint).

## Install

```sh
npm install vite-plugin-eslint2 -D
```

`vite-plugin-eslint2` does not install and config ESLint for you. You should handle these yourself.

<details>

<summary>ESLint@8</summary>

```sh
npm install eslint@^8 @types/eslint@^8 -D
```

</details>

<details>

<summary>ESLint@7</summary>

```sh
npm install eslint@^7 @types/eslint@^7 -D
```

</details>

## Usage

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint2';

export default defineConfig({
  plugins: [eslint(options)],
});
```

## Options

You can pass ESLint [Node.js API constructor options](https://eslint.org/docs/developer-guide/nodejs-api#-new-eslintoptions) to the plugin.

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint2';

export default defineConfig({
  plugins: [
    eslint({
      // recommend to enable auto fix
      fix: true,
      ...,
    }),
  ],
});
```

Additional options and explanations are listed below.

### `test`

- Type: `boolean`
- Default: `false`

Run ESLint under `test` mode. See [Command Line Interface](https://vitejs.dev/guide/#command-line-interface) and [Configuring Vitest](https://vitest.dev/guide/#configuring-vitest) for more.

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

This option specifies the files you want to lint. You don't need to change it in most cases, unless you're using a framework like Nuxt, or if the `include` and `exclude` ranges overlap.

If you're using the plugin defaults, the plugin will only call [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns) in the `transform` hook. The option value will be used to [create a filter](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter) to determine if the call should be made and the parameter of the call, which means that the option value needs to fulfill the requirements of [picomatch@2.3.1](https://github.com/micromatch/picomatch/tree/2.3.1).

If you enable the `lintOnStart` option, the plugin will also call `eslint.lintFiles` in the `buildStart` hook. The option value will not be used to create a filter, but will be used directly as the call parameter, which means that the option value also needs to fulfill the [minimatch@3.1.2](https://github.com/isaacs/minimatch/tree/3.1.2) requirement.

If you disable the `lintDirtyOnly` option, the plugin will use the option value as the call parameter every time it calls `eslint.lintFiles`, which means that the option value also needs to fulfill the requirements of `minimatch@3.1.2`.

### `exclude`

- Type: `string | string[]`
- Default: `['node_modules', 'virtual:']`

This option specifies the files you don't want to lint. You don't need to change it in most cases, unless you're using a framework such as Nuxt, or if the `include` and `exclude` ranges overlap.

If you're using the plugin defaults, the plugin will only call [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns) in the `transform` hook. The option value will be used to [create a filter](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter) to determine if the call should be made and the parameter of the call, which means that the option value needs to fulfill the requirements of [picomatch@2.3.1](https://github.com/micromatch/picomatch/tree/2.3.1).

If you enable the `lintOnStart` option or disable the `lintDirtyOnly` option, the option value will not take effect. You need to change `include` value to include this option value.

### `eslintPath`

- Type: `string`
- Default: `'eslint'`

Path to ESLint that will be used for linting. Use [dynamic import](https://javascript.info/modules-dynamic-imports) under the hood. Read [vite server.fs options](https://vitejs.dev/config/server-options.html#server-fs-strict) first.

Set `'eslint/use-at-your-own-risk'` if you want to use the flat config system in ESLint v8. Place an `eslint.config.js` file in the root of your project or set the `ESLINT_USE_FLAT_CONFIG` environment variable to true and pass the option `overrideConfigFile` to the plugin if you are using other config files. You can learn more from [Flat config rollout plans](https://eslint.org/blog/2023/10/flat-config-rollout-plans/) and [Configuration Files (New)](https://eslint.org/docs/latest/use/configure/configuration-files-new).

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

Lint `include` option specified files once in `buildStart` hook to find potential errors. This is disabled by default.

This will significantly slow down Vite first starting if you have no caches and don't enable `lintInWorker`.

### `lintDirtyOnly`

- Type: `boolean`
- Default: `true`

Lint changed files only when running ESLint except from `buildStart` hook. This is enabled by default.

This plugin will lint `include` option specified files when disabled.

### `chokidar`

- Type: `boolean`
- Default: `false`

Run ESLint in Chokidar `change` event instead of `transform` hook. This is disabled by default.

Recommend to enable `lintOnStart` if you enable this one.

### `emitError`

- Type: `boolean`
- Default: `true`

Emit found errors. This is enabled by default.

### `emitErrorAsWarning`

- Type: `boolean`
- Default: `false`

Emit found errors as warnings. This is disabled by default but you may want it enabled when prototyping.

### `emitWarning`

- Type: `boolean`
- Default: `true`

Emit found warnings. This is enabled by default.

### `emitWarningAsError`

- Type: `boolean`
- Default: `false`

Emit found warnings as errors when enabled. This is disabled by default.

## FAQ

<details>
  <summary>Do I need this plugin?</summary>
  <p><strong>You don't need this in most cases</strong>.</p>
  <p>It is usual to use <a href="https://github.com/webpack-contrib/eslint-webpack-plugin">eslint-webpack-plugin</a> in Webpack. And this plugin does almost the same in Vite.</p>
  <p>However, our IDE is already probably giving all the info we need. We only need to add <a href="https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint">ESLint plugin</a> in VSCode. WebStorm already includes the functionality. We can also run ESLint in CI or CLI.</p>
  <p>Since we have these ways to run ESLint, it is unnecessary to run ESLint in Vite, which means we don't need this plugin in most cases.</p>
  <p>If you really want to check errors and warnings, try enable <code>lintInWorker</code> option, which keeps Vite speed and prints in console. Or try <a href="https://github.com/fi3ework/vite-plugin-checker">vite-plugin-checker</a>, which prints in browser.
</details>

<details>
  <summary>What's the difference between <a href="https://github.com/gxmari007/vite-plugin-eslint">gxmari007/vite-plugin-eslint</a> and this project?</summary>
  <p>This project is initially forked from <a href="https://github.com/gxmari007/vite-plugin-eslint">gxmari007/vite-plugin-eslint</a> and named <code>@modyqyw/vite-plugin-eslint</code>. Because the project looked like dead at that time, leaving issues and PRs. I sent an email to the author but I got no response.<p>
  <p>I add some functions to meet my needs, like <code>eslint@8</code> support, <code>eslintPath</code> option, <code>lintInWorker</code> option, <code>lintOnStart</code> option, <code>lintDirtyOnly</code> option, ignore virtual modules by default, .etc</p>
  <p>I think <code>vite-plugin-eslint</code> is dead. So I rename this project to <code>vite-plugin-eslint2</code> in early 2023, hoping I can provide a better DX. Feel free to choose one.</p>
</details>

<details>
  <summary>Cache is broken</summary>
  <ul>
    <li>Disable <code>cache</code> option.</li>
    <li>Or delete the cache file (default <code>.eslintcache</code>), fix errors manully and restart Vite.
    </li>
  </ul>
  <p>This problem should only happens when starting Vite with ESLint errors. Have a better solution? PR welcome. :)</p>
</details>

<details>
  <summary><code>Vite</code> is slow when using this plugin</summary>
  <ul>
    <li>Try enable <code>lintInWorker</code> option.</li>
    <li>Or try <a href="https://github.com/fi3ework/vite-plugin-checker">vite-plugin-checker</a>.</li>
    <li>Or run ESLint directly besides Vite.</li>
  </ul>
</details>

## Examples

See [examples](https://github.com/ModyQyW/vite-plugin-eslint2/tree/main/examples).

## CHANGELOG

See [CHANGELOG.md](./CHANGELOG.md).

## Acknowledge

Initially forked from [gxmari007/vite-plugin-eslint](https://github.com/gxmari007/vite-plugin-eslint).

## License

MIT

## [Sponsors](https://github.com/ModyQyW/sponsors)

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/ModyQyW/sponsors/sponsorkit/sponsors.svg">
    <img alt="Sponsors" src="https://cdn.jsdelivr.net/gh/ModyQyW/sponsors/sponsorkit/sponsors.svg"/>
  </a>
</p>
