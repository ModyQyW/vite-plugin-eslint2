# vite-plugin-eslint2

English | [简体中文](./README.zh-CN.md)

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

## Introduction

ESLint plugin for Vite. Supports Vite v2 ~ v6 and ESLint v7 ~ v9. Requires `node>=18`.

👇 See the documentation for specific usage and examples.

[Cloudflare Pages](https://vite-plugin-eslint2.modyqyw.top/)

> You may also want [Stylelint plugin for Vite](https://github.com/ModyQyW/vite-plugin-stylelint).

## Install

```sh
npm install vite-plugin-eslint2 -D
```

`vite-plugin-eslint2` does not install and config ESLint for you. You should handle these yourself.

<details>

<summary>ESLint v9</summary>

```sh
npm install eslint@^9 @types/eslint@^9 -D
```

> You don't need to install `@types/eslint` if you are using v9.10.0 or higher.

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

## Usage

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint2";

export default defineConfig({
  plugins: [eslint()],
});
```

👇 See the documentation for specific usage and examples.

[Cloudflare Pages](https://vite-plugin-eslint2.modyqyw.top/)

## Acknowledge

Initially forked from [gxmari007/vite-plugin-eslint](https://github.com/gxmari007/vite-plugin-eslint).

## Contributors

This project was created by [ModyQyW](https://github.com/ModyQyW).

Thanks to [all contributors](https://github.com/ModyQyW/vite-plugin-eslint2/graphs/contributors) for their contributions!

## Sponsors

If this package is helpful to you, please consider [sponsoring](https://github.com/ModyQyW/sponsors), which will benefit the ongoing development and maintenance of the project.

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/ModyQyW/sponsors/sponsorkit/sponsors.svg">
    <img src="https://cdn.jsdelivr.net/gh/ModyQyW/sponsors/sponsorkit/sponsors.svg"/>
  </a>
</p>
