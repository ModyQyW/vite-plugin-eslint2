# 常见问题

## 我需要这个插件吗？

大多数情况下不需要。

Webpack 里常配 [eslint-webpack-plugin](https://github.com/webpack-contrib/eslint-webpack-plugin)，这个插件在 Vite 里做差不多的事。

编辑器其实已经把信息都给你了。VS Code 装个 [ESLint 扩展](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)，WebStorm 自带这功能。你也可以在命令行或 CI 里跑 ESLint。

路子里有这么多，专门在 Vite 里再跑一遍 ESLint 就没多大必要了。真想边开发边看错误和警告，打开 `lintInWorker`，它不占构建线程，结果打到控制台。也可以试试 [@nabla/vite-plugin-eslint](https://github.com/nabla/vite-plugin-eslint) 和 [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker)。

如果你还要校验样式，[vite-plugin-stylelint](https://github.com/ModyQyW/vite-plugin-stylelint) 在 Stylelint 上做着同样的事。

## 缓存好像坏了？

删掉缓存文件，手动修好问题，然后重启 Vite。

## 插件跑得很慢？

默认在主线程校验，会卡住构建。打开 `lintInWorker`，Vite 不卡了，结果打到控制台。也可以换 [@nabla/vite-plugin-eslint](https://github.com/nabla/vite-plugin-eslint) 或 [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker)，或者在 Vite 外面单独跑 ESLint。

## 推荐的配置？

```ts
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint2";

export default defineConfig({
  plugins: [eslint({
    fix: true,
    lintInWorker: true,
    lintOnStart: true,
  })],
});
```

`fix` 会在你开发时直接改文件，不适合就关掉。

## 报错为什么一片红？

Vite 原生的错误遮罩不渲染 `PluginContext.warn` 的内容，ESLint `stylish` 输出的 ANSI 颜色也会被原样贴上去，浏览器里看不出区别。这些问题在上游 [#2076](https://github.com/vitejs/vite/issues/2076)、[#6274](https://github.com/vitejs/vite/pull/6274) 和 [#8327](https://github.com/vitejs/vite/discussions/8327) 里有记录。

打开 `customOverlay: true`，插件会自己渲染结果，错误和警告分开显示。
