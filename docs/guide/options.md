# Options

You can pass ESLint [Node.js API constructor options](https://eslint.org/docs/developer-guide/nodejs-api#-new-eslintoptions) to the plugin, or you can pass the extra options.

## Constructor Options

Common options and descriptions are listed below, complete links are provided above.

### `fix`

- Type: `boolean`
- Default: `false`

Whether to automatically fix.

### `cache`

- Type: `boolean`
- ESLint default: `false`
- Plugin default: `true`

Whether to enable the cache. This is disabled in ESLint by default and enabled in plugin by default to improve speed.

### `cacheLocation`

- Type: `string`
- Default: `.eslintcache`

The path to the cache.

## Extra Options

Extra options and explanations are listed below.

### `test`

- Type: `boolean`
- Default: `false`

Whether to run ESLint under `test` mode. See [Command Line Interface](https://vitejs.dev/guide/#command-line-interface) and [Configuring Vitest](https://vitest.dev/guide/#configuring-vitest) for more.

### `dev`

- Type: `boolean`
- Default: `true`

Whether to run ESLint under `serve` command. See [Command Line Interface](https://vitejs.dev/guide/#command-line-interface) for more.

### `build`

- Type: `boolean`
- Default: `false`

Whether to run ESLint under `build` command. See [Command Line Interface](https://vitejs.dev/guide/#command-line-interface) for more.

### `include`

- Type: `string | string[]`
- Default: `['src/**/*.{js,jsx,ts,tsx,vue,svelte}']`

This option specifies the files you want to lint. You don't need to change it in most cases, unless the `include` and `exclude` ranges overlap.

If you're using the plugin defaults, the plugin will only call [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns) in the `transform` hook. The option value will be used to [create a filter](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter) to determine if the call should be made and the parameter of the call, which means that the option value needs to fulfill the requirements of [picomatch@2.3.1](https://github.com/micromatch/picomatch/tree/2.3.1).

If you enable the `lintOnStart` option, the plugin will also call [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns) in the `buildStart` hook. The option value will not be used to create a filter, but will be used directly as the call parameter, which means that the option value also needs to fulfill the [minimatch@3.1.2](https://github.com/isaacs/minimatch/tree/3.1.2) requirement.

If you disable the `lintDirtyOnly` option, the plugin will use the option value as the call parameter every time it calls [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns), which means that the option value also needs to fulfill the requirements of [minimatch@3.1.2](https://github.com/isaacs/minimatch/tree/3.1.2).

If you disable the `lintDirtyOnly` option, the plugin will use the option value as the call parameter when it calls [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns) outside of the `buildStart` lifecycle. This means that this option value also needs to fulfill the requirements of [minimatch@3.1.2](https://github.com/isaacs/minimatch/tree/3.1.2).

### `exclude`

- Type: `string | string[]`
- Default: `['node_modules', 'virtual:']`

This option specifies the files you don't want to lint. You don't need to change it in most cases, unless the `include` and `exclude` ranges overlap.

The plugin forces the virtual module to be ignored and you don't need to do any configuration related to it here.

If you're using the plugin defaults, the plugin will only call [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns) in the `transform` hook. The option value will be used to [create a filter](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter) to determine if the call should be made and the parameter of the call, which means that the option value needs to fulfill the requirements of [picomatch@2.3.1](https://github.com/micromatch/picomatch/tree/2.3.1).

If you enable the `lintOnStart` option or disable the `lintDirtyOnly` option, the option value will not take effect. You need to change `include` value to include this option value.

### `eslintPath`

- Type: `string`
- Default: `"eslint"`

Path to ESLint that will be used for linting. Use [dynamic import](https://javascript.info/modules-dynamic-imports) under the hood. Read [server.fs](https://vitejs.dev/guide/#command-line-interface) first.

If you want to use the flat config system in ESLint v8, set the value to `'eslint/use-at-your-own-risk'`. Place a flat config file in the root of your project or set the `ESLINT_USE_FLAT_CONFIG` environment variable to true and pass the option `overrideConfigFile` to the plugin if you are using other config files.

You can learn more from [Flat config rollout plans](https://eslint.org/blog/2023/10/flat-config-rollout-plans/) and [Configuration Files (New)](https://eslint.org/docs/latest/use/configure/configuration-files-new).

Since ESLint v10.0.0, the flat config system is enforced and the `'eslint/use-at-your-own-risk'` option is no longer provided. You can learn more form [ESLint v10.0.0 released](https://eslint.org/blog/2026/02/eslint-v10.0.0-released/).

### `formatter`

- Type: `string`
- Default: `"stylish"`

The name or the path of a formatter. This is used to [load a formatter](https://eslint.org/docs/developer-guide/nodejs-api#-eslintloadformatternameorpath) in order to convert lint results to a human- or machine-readable string.

### `lintInWorker`

- Type: `boolean`
- Default: `false`

Lint in [worker](https://nodejs.org/api/worker_threads.html#portpostmessagevalue-tran). This is disabled by default.

When lint in worker, Vite build process will be faster. You will not see Vite error overlay, Vite build process will not be stopped, even with errors shown in terminal.

It is similar with [@nabla/vite-plugin-eslint](https://github.com/nabla) and [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker), but @nabla/vite-plugin-eslint only supports linting in worker, vite-plugin-checker can show you errors and warnings in browsers.

### `lintOnStart`

- Type: `boolean`
- Default: `false`

Lint `include` option specified files once in `buildStart` hook to find potential errors. This is disabled by default.

This will significantly slow down Vite first starting if you have no caches and don't enable `lintInWorker`.

### `lintDirtyOnly`

- Type: `boolean`
- Default: `true`

Whether or not to checkout only modified files that are not included in the `exclude` option value when running ESLint outside of the `buildStart` lifecycle. Enabled by default.

When disabled, files are checked against the `include` and `exclude` option values.

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
