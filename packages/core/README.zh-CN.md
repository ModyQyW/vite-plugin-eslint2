# vite-plugin-eslint2

[English](./README.md) | 简体中文

<div style="display: flex; justify-content: center; align-items: center; gap: 8px;">
  <a href="https://github.com/ModyQyW/vite-plugin-eslint2/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/ModyQyW/vite-plugin-eslint2?style=for-the-badge" alt="License" />
  </a>
  <a href="https://www.npmjs.com/package/ModyQyW/vite-plugin-eslint2">
    <img src="https://img.shields.io/npm/v/vite-plugin-eslint2?style=for-the-badge" alt="npm" />
  </a>
  <a href="https://www.npmjs.com/package/ModyQyW/vite-plugin-eslint2">
    <img src="https://img.shields.io/npm/dm/vite-plugin-eslint2?style=for-the-badge" alt="npm downloads" />
  </a>
</div>

## 介绍

Vite ESLint 插件。支持 Vite v2 ~ v8 和 ESLint v7 ~ v10。要求 `node>=18`。

👇 请查看文档了解具体用法和示例。

[Cloudflare Pages](https://vite-plugin-eslint2.modyqyw.top/)

> 你也可能想要 [Vite Stylelint 插件](https://github.com/ModyQyW/vite-plugin-stylelint)。

## 安装

```sh
npm install vite-plugin-eslint2 -D
```

`vite-plugin-eslint2` 不会为你安装和配置 ESLint。你应该自己处理这些。

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

> 如果你使用 v9.10.0 或更高版本，你不需要安装 `@types/eslint`。

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

👇 请查看文档了解具体用法和示例。

[Cloudflare Pages](https://vite-plugin-eslint2.modyqyw.top/)

## 致谢

最初从 [gxmari007/vite-plugin-eslint](https://github.com/gxmari007/vite-plugin-eslint) 分叉出来。

## 贡献者们

该项目由 [ModyQyW](https://github.com/ModyQyW) 创建。

感谢 [所有贡献者](https://github.com/ModyQyW/vite-plugin-eslint2/graphs/contributors) 的付出！

## 赞助

如果这个包对你有所帮助，请考虑 [赞助](https://github.com/ModyQyW/sponsors) 支持，这将有利于项目持续开发和维护。

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/ModyQyW/sponsors/sponsorkit/sponsors.svg">
    <img src="https://cdn.jsdelivr.net/gh/ModyQyW/sponsors/sponsorkit/sponsors.svg"/>
  </a>
</p>
