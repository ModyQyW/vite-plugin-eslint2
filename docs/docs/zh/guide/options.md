# 选项配置

你可以给插件传 ESLint [Node.js API 构造器选项](https://eslint.org/docs/developer-guide/nodejs-api#-new-eslintoptions)，也可以传插件额外加的选项。

## 构造器选项

常用的几个列在下面，完整列表见上面的链接。

### `fix`

- 类型：`boolean`
- 默认值：`false`

自动修复问题。

### `cache`

- 类型：`boolean`
- ESLint 默认值：`false`
- 插件默认值：`true`

是否启用 ESLint 的缓存。ESLint 默认关闭，插件默认打开，为了快一些。

### `cacheLocation`

- 类型：`string`
- 默认值：`.eslintcache`

缓存文件的位置。

## 额外选项

下面是插件自己加的选项。

### `test`

- 类型：`boolean`
- 默认值：`false`

是否在 `test` 模式下运行 ESLint。见[命令行界面](https://cn.vitejs.dev/guide/#command-line-interface)和[配置 Vitest](https://cn.vitest.dev/guide/)。

### `dev`

- 类型：`boolean`
- 默认值：`true`

是否在 `serve` 命令下运行 ESLint。见[命令行界面](https://cn.vitejs.dev/guide/#command-line-interface)。

### `build`

- 类型：`boolean`
- 默认值：`false`

是否在 `build` 命令下运行 ESLint。见[命令行界面](https://cn.vitejs.dev/guide/#command-line-interface)。

### `include`

- 类型：`string | string[]`
- 默认值：`['src/**/*.{js,jsx,ts,tsx,vue,svelte}']`

要校验的文件。除非 `include` 和 `exclude` 的范围有重合，一般不用改。

这个值怎么用，取决于哪个钩子在跑：

- 用默认配置时，插件只在 `transform` 里调用 [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns)。值会先过一遍 [createFilter](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter)，决定要不要校验、传什么参数，所以它得满足 [picomatch@2.3.1](https://github.com/micromatch/picomatch/tree/2.3.1) 的要求。
- 打开 `lintOnStart` 后，插件还会在 `buildStart` 里调用。这时不过滤，值直接当参数用，所以它还得满足 [minimatch@3.1.2](https://github.com/isaacs/minimatch/tree/3.1.2) 的要求。
- 关掉 `lintDirtyOnly` 后，`buildStart` 之外的每次调用都拿这个值当参数，同样需要满足 [minimatch@3.1.2](https://github.com/isaacs/minimatch/tree/3.1.2)。

### `exclude`

- 类型：`string | string[]`
- 默认值：`['node_modules', 'virtual:']`

不要校验的文件。除非 `include` 和 `exclude` 的范围有重合，一般不用改。

虚拟模块一律忽略，这里不用管。

用默认配置时，走的是和 `include` 同一个 `transform` 过滤器，所以值得满足 [picomatch@2.3.1](https://github.com/micromatch/picomatch/tree/2.3.1) 的要求。

打开 `lintOnStart` 或关掉 `lintDirtyOnly` 后，这个值不会传给 ESLint，把模式写进 `include` 里。它照样决定哪些模块会被校验。

### `eslintPath`

- 类型：`string`
- 默认值：`"eslint"`

用哪个 ESLint 校验。底层是[动态导入](https://javascript.info/modules-dynamic-imports)，请先看 [server.fs](https://cn.vitejs.dev/config/server-options#server-fs-allow)。

想在 ESLint v8 里用平面配置，把它设成 `'eslint/use-at-your-own-risk'`。在项目根目录放一个平面配置文件。配置文件在别处的话，把 `ESLINT_USE_FLAT_CONFIG` 环境变量设成 true。还要传 `overrideConfigFile`。

见 [Flat config rollout plans](https://eslint.org/blog/2023/10/flat-config-rollout-plans/) 和 [Configuration Files (New)](https://eslint.org/docs/latest/use/configure/configuration-files-new)。

ESLint v10.0.0 起只认平面配置，不再提供 `'eslint/use-at-your-own-risk'`。见 [ESLint v10.0.0 released](https://eslint.org/blog/2026/02/eslint-v10.0.0-released/)。

### `formatter`

- 类型：`string`
- 默认值：`"stylish"`

格式化器的名称或路径，用来[加载格式化器](https://eslint.org/docs/developer-guide/nodejs-api#-eslintloadformatternameorpath)，把校验结果转成人类或机器能读的字符串。

### `lintInWorker`

- 类型：`boolean`
- 默认值：`false`

在 [worker](https://nodejs.org/api/worker_threads.html#portpostmessagevalue-transferlist) 里校验。

这样 Vite 构建更快，代价是没有错误遮罩，终端里报错时构建也不会停。

[@nabla/vite-plugin-eslint](https://github.com/nabla/vite-plugin-eslint) 和 [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker) 是同样的思路。前者只能在 worker 里校验。后者能把错误和警告显示在浏览器里。

### `customOverlay`

- 类型：`false | true | CustomOverlayOptions`
- 默认值：`false`

用插件自己的遮罩层代替 Vite 原生错误遮罩。

原生遮罩把 ESLint 带 ANSI 颜色的 `stylish` 输出原样贴上去。浏览器里颜色没了，或者直接露出转义字符。

自定义遮罩渲染结构化结果。它还能配合 `lintInWorker` 使用，原生遮罩做不到。

- `false`：保留 Vite 原生遮罩。worker 模式下没有遮罩。
- `true`：自定义遮罩，默认样式。
- `{...}`：自定义遮罩，样式按你传的来。

只在 `serve` 下生效。`build` 模式里仍然是原生 `context.error` 的阻塞行为。

没有 DOM 入口的环境（小程序、SSR、无头测试）拿不到注入的运行时，插件警告一次，之后只往终端输出。

```js
eslint({
  customOverlay: true,
});
// 或带样式
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

徽标和面板放在视口的哪个角。

#### `customOverlay.initialIsOpen`

- 类型：`boolean | "error"`
- 默认值：`"error"`

面板是否默认展开。`"error"` 表示至少有一个错误时才展开。

#### `customOverlay.zIndex`

- 类型：`number`
- 默认值：`99998`

遮罩层的 z-index。设计系统有时会占用很高的层级，所以开放这个选项。

#### `customOverlay.theme`

- 类型：`Partial<Record<ThemeKey, string>>`

覆盖遮罩层的 CSS 变量，键名是固定的：

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

在 `buildStart` 里按 `include` 校验一遍，早点发现问题。

没有缓存又没开 `lintInWorker` 时，Vite 第一次启动会明显变慢。

### `lintDirtyOnly`

- 类型：`boolean`
- 默认值：`true`

`buildStart` 之外，只校验改过、且没有被 `exclude` 匹配到的文件。

关掉后，直接把 `include` 和 `exclude` 的模式交给 ESLint。

### `emitError`

- 类型：`boolean`
- 默认值：`true`

输出错误。

### `emitErrorAsWarning`

- 类型：`boolean`
- 默认值：`false`

把错误当警告输出。写原型的时候有用。

### `emitWarning`

- 类型：`boolean`
- 默认值：`true`

输出警告。

### `emitWarningAsError`

- 类型：`boolean`
- 默认值：`false`

把警告当错误输出。
