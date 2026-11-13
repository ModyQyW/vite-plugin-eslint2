---
description: 这个分支为什么存在：vite-plugin-eslint 没人维护了，vite-plugin-eslint2 把它接过来，支持 ESLint 7-10，带 worker 校验和自定义浮层。
---

# 为什么是 vite-plugin-eslint2？

## 原因

这个项目从 [gxmari007/vite-plugin-eslint](https://github.com/gxmari007/vite-plugin-eslint) 分叉出来。原项目的 issue 和 PR 堆着没人处理，我给作者发过邮件，没有收到回复。

分叉后我按自己的需要加了功能：ESLint v8 支持，`eslintPath`、`lintInWorker`、`lintOnStart` 和 `lintDirtyOnly` 几个选项，以及强制忽略虚拟模块。那时候项目叫 `@modyqyw/vite-plugin-eslint`，2023 年初改名 `vite-plugin-eslint2`，方便搜索。

[@nabla/vite-plugin-eslint](https://github.com/nabla/vite-plugin-eslint) 和 [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker) 覆盖了差不多的场景，按你的需要挑一个。

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
