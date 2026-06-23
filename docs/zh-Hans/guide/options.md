# 选项配置

你可以给这个插件传递 ESLint [Node.js API constructor options](https://eslint.org/docs/developer-guide/nodejs-api#-new-eslintoptions)，也可以传递这个插件特有的额外选项。

## 构造器选项

常见的自带选项和说明如下，完整内容请查看上方链接。

### `fix`

- 类型：`boolean`
- 默认值：`false`

是否自动修复。

### `cache`

- 类型：`boolean`
- ESLint 默认值：`false`
- 插件默认值：`true`

是否启用缓存。ESLint 默认禁用，插件默认启用以提高速度。

### `cacheLocation`

- 类型：`string`
- 默认值：`.eslintcache`

缓存位置。

## 额外选项

额外的选项和说明如下。

### `test`

- 类型：`boolean`
- 默认值：`false`

是否在 `test` 模式下运行 ESLint。查看 [命令行界面](https://cn.vitejs.dev/guide/#command-line-interface) 和 [配置 Vitest](https://cn.vitest.dev/guide/) 了解更多。

### `dev`

- 类型：`boolean`
- 默认值：`true`

是否在 `serve` 命令下运行 ESLint。查看 [命令行界面](https://cn.vitejs.dev/guide/#command-line-interface) 了解更多。

### `build`

- 类型：`boolean`
- 默认值：`false`

是否在 `build` 命令下运行 ESLint。查看 [命令行界面](https://cn.vitejs.dev/guide/#command-line-interface) 了解更多。

### `include`

- 类型：`string | string[]`
- 默认值：`['src/**/*.{js,jsx,ts,tsx,vue,svelte}']`

这个选项指定你想要校验的文件模式。在绝大部分情况下，你并不需要调整它，除非 `include` 和 `exclude` 范围有重合。

如果你正在使用插件默认设置，插件只会在 `transform` 生命周期中调用 [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns)。这个选项值会被用于 [创建一个过滤器](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter) 来确定是否该调用以及调用参数。这意味着选项值需要满足 [picomatch@2.3.1](https://github.com/micromatch/picomatch/tree/2.3.1) 的要求。

如果你启用了 `lintOnStart` 选项，插件还会在 `buildStart` 生命周期中调用 [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns)。这个选项值不会用于创建过滤器，而是直接用作调用参数。这意味着这个选项值还需要满足 [minimatch@3.1.2](https://github.com/isaacs/minimatch/tree/3.1.2) 的要求。

如果你禁用了 `lintDirtyOnly` 选项，插件在 `buildStart` 生命周期外调用 [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns) 时都会将该选项值作为调用参数。这意味着这个选项值也需要满足 [minimatch@3.1.2](https://github.com/isaacs/minimatch/tree/3.1.2) 的要求。

### `exclude`

- 类型：`string | string[]`
- 默认值：`['node_modules', 'virtual:']`

这个选项指定你不想要校验的文件模式。在绝大部分情况下，你并不需要调整它，除非 `include` 和 `exclude` 范围有重合。

插件强制忽略虚拟模块，你不需要在这里进行任何相关配置。

如果你正在使用插件默认设置，插件只会在 `transform` 生命周期中调用 [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns)。这个选项值会被用于 [创建一个过滤器](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter) 来确定是否该调用以及调用参数。这意味着选项值需要满足 [picomatch@2.3.1](https://github.com/micromatch/picomatch/tree/2.3.1) 的要求。

如果你启用了 `lintOnStart` 选项或禁用了 `lintDirtyOnly` 选项，这个选项值不会生效。你需要调整 `include` 值以包含该选项值。

### `eslintPath`

- 类型：`string`
- 默认值：`"eslint"`

ESLint 路径，用于校验文件。底层使用使用 [dynamic import](https://javascript.info/modules-dynamic-imports)。请先查看 [server.fs](https://cn.vitejs.dev/guide/#command-line-interface)。

如果你想在 ESLint v8 中使用平面配置，将值设置为 `'eslint/use-at-your-own-risk'`。在你的项目根放置一个平面配置文件，或者设置 `ESLINT_USE_FLAT_CONFIG` 环境变量。如果你在使用其它位置的配置文件，请传递选项 `overrideConfigFile` 给插件。

查看 [Flat config rollout plans](https://eslint.org/blog/2023/10/flat-config-rollout-plans/) 和 [Configuration Files (New)](https://eslint.org/docs/latest/use/configure/configuration-files-new) 了解更多。

自 ESLint v10.0.0 起，你只能使用平面配置，ESLint 不再提供 `'eslint/use-at-your-own-risk'` 及相关选项。

### `formatter`

- 类型：`string`
- 默认值：`"stylish"`

格式化器的名称或路径。用于 [读取格式化器](https://eslint.org/docs/developer-guide/nodejs-api#-eslintloadformatternameorpath)，以便将校验结果转换为人类或机器可读的字符串。

### `lintInWorker`

- 类型：`boolean`
- 默认值：`false`

在 [worker](https://nodejs.org/api/worker_threads.html#portpostmessagevalue-tran) 中校验。默认禁用。

在 worker 中校验时，Vite 的构建过程会更快。即使终端显示了 ESLint 校验错误，你也不会看到 Vite 错误遮罩层，Vite 构建也不会停止。

这与 [@nabla/vite-plugin-eslint](https://github.com/nabla)、[vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker) 类似。不同的是，@nabla/vite-plugin-eslint 只支持在 worker 中校验，vite-plugin-checker 可以在浏览器中显示错误和警告。

### `customOverlay`

- 类型：`false | true | CustomOverlayOptions`
- 默认值：`false`

使用插件的自定义遮罩层，替代 Vite 原生错误遮罩层。原生遮罩层会把 ESLint 带 ANSI 颜色的 `stylish` 输出原样渲染，在浏览器中颜色丢失（或显示转义字符）。自定义遮罩层原生渲染结构化结果，并且与原生遮罩层不同——在启用 `lintInWorker` 时也能工作。

- `false`：保留 Vite 原生遮罩层（当前行为；worker 模式下无遮罩层）。
- `true`：使用自定义遮罩层，默认样式。
- `{...}`：使用自定义遮罩层，并按给定配置定制样式。

仅在 `serve` 下生效。`build` 模式下始终保留原生 `context.error` 的阻塞行为。

在没有 DOM 入口的环境（小程序、SSR、无头测试）中，运行时不会被注入；插件会警告一次并降级为仅终端输出。

```js
eslint({
  customOverlay: true,
});
// 或带样式配置
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

- 类型：`"tl" | "tr" | "bl" | "br"`
- 默认值：`"br"`

遮罩层徽标/面板在视口中的位置。

#### `customOverlay.initialIsOpen`

- 类型：`boolean | "error"`
- 默认值：`"error"`

面板是否默认展开。`"error"` 表示仅当存在错误时展开。

#### `customOverlay.zIndex`

- 类型：`number`
- 默认值：`99998`

遮罩层的 z-index。暴露此选项是因为设计系统可能占用高 z-index 层级。

#### `customOverlay.theme`

- 类型：`Partial<Record<ThemeKey, string>>`

覆盖遮罩层的 CSS 变量。键是预定义的变量名：

- `--vite-plugin-eslint2-bg`
- `--vite-plugin-eslint2-panel-bg`
- `--vite-plugin-eslint2-error`
- `--vite-plugin-eslint2-warning`
- `--vite-plugin-eslint2-text`
- `--vite-plugin-eslint2-font-mono`
- `--vite-plugin-eslint2-radius`

### `lintOnStart`

- 类型：`boolean`
- 默认值：`false`

在 `buildStart` 生命周期中校验 `include` 选项指定的文件一次以发现潜在的错误。默认禁用。

如果你没有缓存而且没有启用 `lintInWorker`，这将大大降低 Vite 的初次启动速度。

### `lintDirtyOnly`

- 类型：`boolean`
- 默认值：`true`

在 `buildStart` 生命周期之外运行 ESLint 时，是否只校验修改过且没有包含在 `exclude` 选项值内的文件。默认启用。

禁用时，会根据 `include` 和 `exclude` 选项值确定需要校验文件。

### `emitError`

- 类型：`boolean`
- 默认值：`true`

输出发现的错误。默认启用。

### `emitErrorAsWarning`

- 类型：`boolean`
- 默认值：`false`

将发现的错误作为警告输出。默认禁用，但你可能会在开发原型时启用这个。

### `emitWarning`

- 类型：`boolean`
- 默认值：`true`

输出发现的警告。默认启用。

### `emitWarningAsError`

- 类型：`boolean`
- 默认值：`false`

将发现的警告作为错误输出。默认禁用。
