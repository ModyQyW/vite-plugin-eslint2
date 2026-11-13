---
pageType: home
title: vite-plugin-eslint2
titleSuffix: Vite 的 ESLint 插件
description: vite-plugin-eslint2 在 Vite 里跑 ESLint，带浏览器浮层、worker 校验和自动修复。支持 Vite 2-8 和 ESLint 7-10。

hero:
  name: vite-plugin-eslint2
  text: Vite 的 ESLint 插件
  tagline: 几分钟就能把 ESLint 接进 Vite 🚀
  actions:
    - theme: brand
      text: 起步 →
      link: /zh/guide/getting-started
    - theme: alt
      text: 为什么用，为什么不用
      link: /zh/guide/why
    - theme: alt
      text: 在 GitHub 查看
      link: https://github.com/ModyQyW/vite-plugin-eslint2
    - theme: alt
      text: "Ask AI 🤖"
      link: https://deepwiki.com/ModyQyW/vite-plugin-eslint2
  image:
    src: /vite-plugin-eslint2.svg
    alt: vite-plugin-eslint2

features:
  - title: Vite 2-8，ESLint 7-10
    icon: 🚀
    details: 支持的版本区间里任意组合都能用。插件本身要 Node.js 18，各个 ESLint 大版本另有自己的 Node.js 下限。
    link: /zh/guide/getting-started
  - title: 不占主线程
    icon: 🧵
    details: 打开 lintInWorker，ESLint 在 worker 里跑，dev server 不卡，结果打到控制台。
    link: /zh/guide/options
  - title: 看得清的浮层
    icon: 🎨
    details: customOverlay 用 Shadow DOM 渲染错误和警告，不再把带 ANSI 颜色的终端输出塞进 Vite 原生浮层。
    link: /zh/guide/options
---

