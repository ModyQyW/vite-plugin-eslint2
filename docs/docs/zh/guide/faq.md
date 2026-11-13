---
description: 什么时候值得加 vite-plugin-eslint2，校验为什么慢，缓存坏了怎么恢复，以及报错浮层为什么直接显示 ANSI 颜色。
---

# 常见问题

## 我需要这个插件吗？

大多数情况下不需要。什么时候用、什么时候不用，见 [为什么用，为什么不用](/zh/guide/why)。

想在 Vite 跑的时候看到错误和警告，就打开这个插件。把 `lintInWorker` 打开，校验不占构建线程。

## 缓存好像坏了？

1. 删掉缓存文件。
2. 手动修好问题。
3. 重启 Vite。

## 插件跑得很慢？

默认情况下插件在主线程校验，可能拖住构建。

打开 `lintInWorker`，Vite 不会被卡住，结果打到控制台。

也可以在 Vite 外面单独跑 ESLint。[@nabla/vite-plugin-eslint](https://github.com/nabla/vite-plugin-eslint) 和 [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker) 是另外的选择。

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

`fix` 会在你开发时直接改文件。不适合就关掉。

## 报错为什么一片红？

Vite 原生的错误遮罩不渲染 `PluginContext.warn` 的内容。它把 ESLint `stylish` 输出的 ANSI 颜色原样贴上去，浏览器里就看不出颜色区别了。

这些限制在上游 [#2076](https://github.com/vitejs/vite/issues/2076)、[#6274](https://github.com/vitejs/vite/pull/6274) 和 [#8327](https://github.com/vitejs/vite/discussions/8327) 里有记录。

打开 `customOverlay: true`，插件会自己渲染结果。错误和警告分开显示。
