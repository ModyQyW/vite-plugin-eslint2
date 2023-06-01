# @modyqyw/vite-plugin-eslint

[![npm](https://img.shields.io/npm/v/vite-plugin-eslint2)](https://www.npmjs.com/package/vite-plugin-eslint2)
[![GitHub license](https://img.shields.io/github/license/ModyQyW/vite-plugin-eslint2)](https://github.com/ModyQyW/vite-plugin-eslint2/blob/master/LICENSE)

Vite ESLint 插件。支持 Vite v2、v3 和 v4。要求 `node >= 14.18`。

你可能需要 [Vite Stylelint 插件](https://github.com/ModyQyW/vite-plugin-stylelint)。

## Install

```sh
npm install vite-plugin-eslint2 -D
```

`vite-plugin-eslint2` 不会为你安装和配置 ESLint。你应该自己处理这些。

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

## 使用

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint2';

export default defineConfig({
  plugins: [eslint(options)],
});
```

## 选项

你可以给这个插件传递 ESLint [Node.js API constructor options](https://eslint.org/docs/developer-guide/nodejs-api#-new-eslintoptions)。

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint2';

export default defineConfig({
  plugins: [
    eslint({
      // 推荐启用自动修复
      fix: true,
      ...,
    }),
  ],
});
```

额外的选项和解释列写在下方。

### `dev`

- 类型：`boolean`
- 默认值：`true`

在 `serve` 命令下运行 ESLint。查看 [命令行界面](https://cn.vitejs.dev/guide/#command-line-interface) 了解更多。

### `build`

- 类型：`boolean`
- 默认值：`false`

在 `build` 命令下运行 ESLint。查看 [命令行界面](https://cn.vitejs.dev/guide/#command-line-interface) 了解更多。

### `cache`

- 类型：`boolean`
- 默认值：`true`

启用时，存储已处理的文件的结果。默认启用以提高速度。

### `cacheLocation`

- 类型：`string`
- 默认值：`.eslintcache`

缓存位置的文件或目录的路径。`.eslintcache` 是 ESLint 的默认缓存位置。

### `include`

- 类型：`string | string[]`
- 默认值：`['src/**/*.{js,jsx,ts,tsx,vue,svelte}']`

一个有效的 [picomatch](https://github.com/micromatch/picomatch#globbing-features) 模式或模式数组。

这用于 [创建一个过滤器](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter) 来确定 `files` 选项，这意味着你的 `files` 选项将被覆盖。

如果你正在使用 `nuxt`，你可能需要改变这个选项的值。

<details>
  <summary>nuxt 例子</summary>

```typescript
// nuxt.config.ts
import viteEslint from 'vite-plugin-eslint2';

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
          'styles/**/*.{js,jsx,ts,tsx,vue}', // vanilla-extract may need
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

- 类型：`string | string[]`
- 默认值：`['node_modules', 'virtual:']`

一个有效的 [picomatch](https://github.com/micromatch/picomatch#globbing-features) 模式或模式数组。

这用于 [创建一个过滤器](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter) 来确定 `files` 选项，这意味着你的 `files` 选项将被覆盖。

### `eslintPath`

- 类型：`string`
- 默认值：`'eslint'`

ESLint 路径，用于校验文件。底层使用使用 [dynamic import](https://javascript.info/modules-dynamic-imports)。请先阅读 [Vite server.fs 选项](https://cn.vitejs.dev/config/server-options.html#server-fs-strict)。

### `formatter`

- 类型：`string`
- 默认值：`'stylish'`

格式化器的名称、路径或函数实现。

用于 [读取格式化器](https://eslint.org/docs/developer-guide/nodejs-api#-eslintloadformatternameorpath)，以便将校验结果转换为人类或机器可读的字符串。

### `lintInWorker`

- 类型：`boolean`
- 默认值：`false`

在 [worker](https://nodejs.org/api/worker_threads.html#portpostmessagevalue-tran) 校验。默认禁用。

在 worker 中校验时，Vite 的构建过程会更快。即使终端显示了错误，Vite 的构建过程也不会停止。

这与 [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker) 类似，但 [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker) 可以在浏览器中显示错误。

### `lintOnStart`

- 类型：`boolean`
- 默认值：`false`

在开始时校验（在 `buildStart` 钩子中）。校验所有文件一次以发现潜在的错误。默认禁用。

如果你没有缓存而且没有启用 `lintInWorker`，这将大大降低 Vite 的初次启动速度。

### `chokidar`

- 类型：`boolean`
- 默认值：`false`

启用时，插件会尝试在 Chokidar `change` 事件中运行 ESLint，而不是在 `transform` 钩子中运行。默认禁用。

如果你启用这个功能，建议同时启用 `lintOnStart`。

### `emitError`

- 类型：`boolean`
- 默认值：`true`

启用后，会输出发现的错误。默认启用。

### `emitErrorAsWarning`

- 类型：`boolean`
- 默认值：`false`

启用后，发现的错误会作为警告被输出。默认禁用，但你可能会在开发原型时启用这个。

### `emitWarning`

- 类型：`boolean`
- 默认值：`true`

启用后，会输出发现的警告。默认启用。

### `emitWarningAsError`

- 类型：`boolean`
- 默认值：`false`

启用后，发现的警告会作为错误被输出。默认禁用。

## FAQ

<details>
  <summary>我需要这个插件吗？</summary>
  <p>长话短说，<strong>不需要</strong>。</p>
  <p>在 <code>webpack</code> 使用 <a href="https://github.com/webpack-contrib/eslint-webpack-plugin">eslint-webpack-plugin</a> 是很常见的。而这个插件在 <code>vite</code> 中做着几乎一样的事情。</p>
  <p>但是，我们的 IDE 可能已经提供了我们需要的所有信息。对于 VSCode，我们只需要添加 <a href="https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint">ESLint 插件</a>。 WebStorm 已经内置了这个功能。我们也可以在 CI 中运行 ESLint，阻止其它人破坏代码。</p>
  <p>既然我们有这么多方法运行 ESLint，那就没有必要在 <code>vite</code> 中运行 ESLint 了，这也就意味着我们并不需要这个插件。</p>
  <p>如果你真的很需要查看错误和警告，尝试一下 <code>lintInWorker</code> 选项，它会在 console 中打印信息。</p>
  <p>或者尝试一下 <a href="https://github.com/fi3ework/vite-plugin-checker">vite-plugin-checker</a>，它会在浏览器中打印信息。
</details>

<details>
  <summary>这个项目和 <a href="https://github.com/gxmari007/vite-plugin-eslint">gxmari007/vite-plugin-eslint</a> 的区别是什么？</summary>
  <p>这个项目最初从 <a href="https://github.com/gxmari007/vite-plugin-eslint">gxmari007/vite-plugin-eslint</a> 分叉出来，因为当时它有很多 issue 和 PR 等待处理，看起来没有人维护。我给作者发了邮件但我没有得到任何回应。<p>
  <p>我增加了一些功能来满足我自己的需求，包括<code>eslint@8</code> 支持，<code>eslintPath</code> 选项，<code>lintInWorker</code> 选项，<code>lintOnStart</code> 选项，还有默认忽略虚拟模块。</p>
  <p>我认为 <code>vite-plugin-eslint</code> 缺少维护，所以我在 2023-01-31 将这个项目重命名为 <code>vite-plugin-eslint2</code>。请根据你的意愿选择一个来使用。</p>
</details>

<details>
  <summary>Cache 失效</summary>
  <ul>
    <li>禁用 <code>cache</code> 选项。</li>
    <li>或删除缓存文件（默认是 <code>.eslintcache</code>），手动修复错误后重启 Vite。
    </li>
  </ul>
  <p>这个问题应该只会在启动 Vite 出现校验错误时出现。如果你有更好的解决方案，欢迎 PR。:)</p>
</details>

<details>
  <summary>使用这个插件时 <code>Vite</code> 很慢</summary>
  <ul>
    <li>试试启用 <code>lintInWorker</code> 选项。</li>
    <li>或试试 <a href="https://github.com/fi3ework/vite-plugin-checker">vite-plugin-checker</a>。</li>
    <li>或在 Vite 外直接运行 ESLint。</li>
  </ul>
</details>

## 例子

查看 [examples](https://github.com/ModyQyW/vite-plugin-eslint/tree/main/examples)。

## 改动日志

查看 [CHANGELOG.md](./CHANGELOG.md)。

## 致谢

最初从 [gxmari007/vite-plugin-eslint](https://github.com/gxmari007/vite-plugin-eslint) 分叉出来。

## License

MIT

## [赞助者们](https://github.com/ModyQyW/sponsors)

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/ModyQyW/sponsors/sponsorkit/sponsors.svg">
    <img src="https://cdn.jsdelivr.net/gh/ModyQyW/sponsors/sponsorkit/sponsors.svg"/>
  </a>
</p>
