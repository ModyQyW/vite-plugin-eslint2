# @modyqyw/vite-plugin-eslint

[![npm](https://img.shields.io/npm/v/vite-plugin-eslint2)](https://www.npmjs.com/package/vite-plugin-eslint2)
[![GitHub license](https://img.shields.io/github/license/ModyQyW/vite-plugin-eslint2)](https://github.com/ModyQyW/vite-plugin-eslint2/blob/master/LICENSE)

Vite ESLint 插件，默认在 `transform` 生命周期中运行 ESLint，支持自定义。

支持 Vite v2 ~ v5。要求 `node>=18`。

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

### `test`

- 类型：`boolean`
- 默认值：`false`

在 `test` 模式下运行 ESLint。查看 [命令行界面](https://cn.vitejs.dev/guide/#command-line-interface) 和 [配置 Vitest](https://cn.vitest.dev/guide/) 了解更多。

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

这个选项指定你想要校验的文件模式。在绝大部分情况下，你并不需要调整它，除非你正在使用 Nuxt 等框架，或者 `include` 和 `exclude` 范围有重合。

如果你正在使用插件默认设置，插件只会在 `transform` 生命周期中调用 [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns)。这个选项值会被用于 [创建一个过滤器](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter) 来确定是否该调用以及调用参数。这意味着选项值需要满足 [picomatch@2.3.1](https://github.com/micromatch/picomatch/tree/2.3.1) 的要求。

如果你启用了 `lintOnStart` 选项，插件还会在 `buildStart` 生命周期中调用 `eslint.lintFiles`。这个选项值不会用于创建过滤器，而是直接用作调用参数。这意味着这个选项值还需要满足 [minimatch@3.1.2](https://github.com/isaacs/minimatch/tree/3.1.2) 的要求。

如果你禁用了 `lintDirtyOnly` 选项，插件每次调用 `eslint.lintFiles` 时都会将该选项值作为调用参数。这意味着这个选项值也需要满足 `minimatch@3.1.2` 的要求。

### `exclude`

- 类型：`string | string[]`
- 默认值：`['node_modules', 'virtual:']`

这个选项指定你不想要校验的文件模式。在绝大部分情况下，你并不需要调整它，除非你正在使用 Nuxt 等框架，或者 `include` 和 `exclude` 范围有重合。

如果你正在使用插件默认设置，插件只会在 `transform` 生命周期中调用 [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns)。这个选项值会被用于 [创建一个过滤器](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter) 来确定是否该调用以及调用参数。这意味着选项值需要满足 [picomatch@2.3.1](https://github.com/micromatch/picomatch/tree/2.3.1) 的要求。

如果你启用了 `lintOnStart` 选项或者禁用了 `lintDirtyOnly` 选项，这个选项值不会生效。你需要调整 `include` 值以包含该选项值。

### `eslintPath`

- 类型：`string`
- 默认值：`'eslint'`

ESLint 路径，用于校验文件。底层使用使用 [dynamic import](https://javascript.info/modules-dynamic-imports)。请先阅读 [Vite server.fs 选项](https://cn.vitejs.dev/config/server-options.html#server-fs-strict)。

如果你想在 ESLint v8 中使用 flat config，将值设置为 `'eslint/use-at-your-own-risk'`。在你的项目根放置一个 `eslint.config.js` 文件，或者设置 `ESLINT_USE_FLAT_CONFIG` 环境变量。如果你在使用其它位置的配置文件，请传递选项 `overrideConfigFile` 给插件。你可以从 [Flat config rollout plans](https://eslint.org/blog/2023/10/flat-config-rollout-plans/) 和 [Configuration Files (New)](https://eslint.org/docs/latest/use/configure/configuration-files-new) 了解更多。

### `formatter`

- 类型：`string`
- 默认值：`'stylish'`

格式化器的名称或路径。

用于 [读取格式化器](https://eslint.org/docs/developer-guide/nodejs-api#-eslintloadformatternameorpath)，以便将校验结果转换为人类或机器可读的字符串。

### `lintInWorker`

- 类型：`boolean`
- 默认值：`false`

在 [worker](https://nodejs.org/api/worker_threads.html#portpostmessagevalue-tran) 中校验。默认禁用。

在 worker 中校验时，Vite 的构建过程会更快。即使终端显示了错误，Vite 的构建过程也不会停止。

这与 [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker) 类似，但 [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker) 可以在浏览器中显示错误。

### `lintOnStart`

- 类型：`boolean`
- 默认值：`false`

在 `buildStart` 生命周期中校验 `include` 选项指定的文件一次以发现潜在的错误。默认禁用。

如果你没有缓存而且没有启用 `lintInWorker`，这将大大降低 Vite 的初次启动速度。

### `lintDirtyOnly`

- 类型：`boolean`
- 默认值：`true`

在 `buildStart` 生命周期之外运行 ESLint 时，只校验修改过的文件。默认启用。

禁用时，会校验 `include` 选项值对应的文件。

### `chokidar`

- 类型：`boolean`
- 默认值：`false`

在 Chokidar `change` 事件中而不是在 `transform` 生命周期中运行 ESLint。默认禁用。

如果你启用这个选项，建议也启用 `lintOnStart`。

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

## FAQ

<details>
  <summary>我需要这个插件吗？</summary>
  <p><strong>绝大部分情况下不需要</strong>。</p>
  <p>在 Webpack 使用 <a href="https://github.com/webpack-contrib/eslint-webpack-plugin">eslint-webpack-plugin</a> 是很常见的，而这个插件在 Vite 中做着几乎一样的事情。</p>
  <p>但是，我们的 IDE 可能已经提供了我们需要的所有信息。对于 VSCode，我们只需要添加 <a href="https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint">ESLint 插件</a>。 WebStorm 已经内置了这个功能。我们也可以在命令行或者 CI 中运行 ESLint。</p>
  <p>我们有这么多方法运行 ESLint，没有太大必要再在 Vite 中运行 ESLint，这也就意味着我们在绝大部分情况下不需要这个插件。</p>
  <p>如果你真的很需要查看错误和警告，请尝试启用 <code>lintInWorker</code> 选项，它保持了 Vite 的速度，在 console 中打印信息。或者尝试一下 <a href="https://github.com/fi3ework/vite-plugin-checker">vite-plugin-checker</a>，它会在浏览器中打印信息。
</details>

<details>
  <summary>这个项目和 <a href="https://github.com/gxmari007/vite-plugin-eslint">gxmari007/vite-plugin-eslint</a> 的区别是什么？</summary>
  <p>这个项目最初从 <a href="https://github.com/gxmari007/vite-plugin-eslint">gxmari007/vite-plugin-eslint</a> 分叉出来，因为当时它有很多 issue 和 PR 等待处理，看起来没有人维护。我给作者发了邮件但我没有得到任何回应。<p>
  <p>我增加了一些功能来满足我自己的需求，包括<code>eslint@8</code> 支持、<code>eslintPath</code> 选项、<code>lintInWorker</code> 选项、<code>lintOnStart</code> 选项、<code>lintDirtyOnly</code> 选项、默认忽略虚拟模块等。</p>
  <p>我认为 <code>vite-plugin-eslint</code> 缺少维护，所以我在 2023 年初将这个项目重命名为 <code>vite-plugin-eslint2</code>，期望我能提供更好的开发者体验。请根据你的意愿选择一个来使用。</p>
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
    <img alt="Sponsors" src="https://cdn.jsdelivr.net/gh/ModyQyW/sponsors/sponsorkit/sponsors.svg"/>
  </a>
</p>
