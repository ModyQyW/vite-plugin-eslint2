---
description: 这个分支为什么存在，以及什么情况下编辑器、ESLint 命令行或 CI 已经够用。
---

# 为什么用，为什么不用？

## 为什么用

这个项目从 [gxmari007/vite-plugin-eslint](https://github.com/gxmari007/vite-plugin-eslint) 分叉出来。原项目的 issue 和 PR 堆着没人处理。我给作者发过邮件，没有收到回复。

分叉后我按自己的需要加了功能。当时加的是 ESLint v8 支持，`eslintPath`、`lintInWorker`、`lintOnStart` 和 `lintDirtyOnly` 几个选项，以及强制忽略虚拟模块。那时候项目叫 `@modyqyw/vite-plugin-eslint`。2023 年初改名 `vite-plugin-eslint2`，方便搜索。

## 为什么不用

大多数项目用不上这个插件。

编辑器已经把同样的问题显示出来了。VS Code 装 [ESLint 扩展](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)，WebStorm 自带这个功能。

你也可以在命令行或者 CI 里跑 ESLint。

Webpack 项目用 [eslint-webpack-plugin](https://github.com/webpack-contrib/eslint-webpack-plugin) 做同样的事。

想在 Vite 跑的时候看到错误和警告，就打开这个插件。把 `lintInWorker` 打开，校验不占构建线程，结果打到控制台。

## 其他选择

[@nabla/vite-plugin-eslint](https://github.com/nabla/vite-plugin-eslint) 和 [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker) 覆盖的场景差不多。挑一个适合你的就行。

ESLint 只管 JavaScript 和 TypeScript。想在 Vite 里用同样的方式跑 Stylelint，用 [vite-plugin-stylelint](https://github.com/ModyQyW/vite-plugin-stylelint)。

## 致谢

最初从 [gxmari007/vite-plugin-eslint](https://github.com/gxmari007/vite-plugin-eslint) 分叉出来。

## 贡献者们

该项目由 [ModyQyW](https://github.com/ModyQyW) 创建。

感谢 [所有贡献者](https://github.com/ModyQyW/vite-plugin-eslint2/graphs/contributors) 的付出！

## 赞助

如果这个包对你有所帮助，请考虑 [赞助](https://github.com/ModyQyW/sponsors) 支持，这能让项目持续开发和维护。

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/ModyQyW/sponsors/sponsorkit/sponsors.svg">
    <img src="https://cdn.jsdelivr.net/gh/ModyQyW/sponsors/sponsorkit/sponsors.svg"/>
  </a>
</p>
