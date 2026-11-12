# vite-plugin-eslint2

[English](./README.md) | 简体中文

<div style="display: flex; justify-content: center; align-items: center; gap: 8px;">
  <a href="https://github.com/ModyQyW/vite-plugin-eslint2/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/ModyQyW/vite-plugin-eslint2?style=for-the-badge" alt="License" />
  </a>
  <a href="https://www.npmjs.com/package/vite-plugin-eslint2">
    <img src="https://img.shields.io/npm/v/vite-plugin-eslint2?style=for-the-badge" alt="npm" />
  </a>
  <a href="https://www.npmjs.com/package/vite-plugin-eslint2">
    <img src="https://img.shields.io/npm/dm/vite-plugin-eslint2?style=for-the-badge" alt="npm downloads" />
  </a>
</div>

## 介绍

Vite 的 ESLint 插件。支持 Vite v2 到 v8 和 ESLint v7 到 v10。要求 `node>=18`。

用法、选项和示例见[文档](https://vite-plugin-eslint2.modyqyw.top/)。

> 你可能还需要 [Vite 的 Stylelint 插件](https://github.com/ModyQyW/vite-plugin-stylelint)。

## 安装

```sh
npm install vite-plugin-eslint2 -D
```

`vite-plugin-eslint2` 不会替你安装和配置 ESLint。你需要的大版本自己装，各版本对 Node.js 的要求见[起步](https://vite-plugin-eslint2.modyqyw.top/zh/guide/getting-started)。

<details>

<summary>ESLint v10</summary>

```sh
npm install eslint@^10 -D
```

</details>

<details>

<summary>ESLint v9</summary>

```sh
npm install eslint@^9 @types/eslint@^9 -D
```

> v9.10.0 起不用再装 `@types/eslint`。

</details>

<details>

<summary>ESLint v8</summary>

```sh
npm install eslint@^8 @types/eslint@^8 -D
```

</details>

<details>

<summary>ESLint v7</summary>

```sh
npm install eslint@^7 @types/eslint@^7 -D
```

</details>

## 使用

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint2";

export default defineConfig({
  plugins: [eslint()],
});
```

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
