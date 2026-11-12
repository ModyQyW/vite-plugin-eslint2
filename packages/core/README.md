# vite-plugin-eslint2

English | [简体中文](./README.zh-CN.md)

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

## Introduction

ESLint plugin for Vite. Supports Vite v2 to v8 and ESLint v7 to v10. Requires `node>=18`.

See the [documentation](https://vite-plugin-eslint2.modyqyw.top/) for usage, options and examples.

> You may also want the [Stylelint plugin for Vite](https://github.com/ModyQyW/vite-plugin-stylelint).

## Install

```sh
npm install vite-plugin-eslint2 -D
```

`vite-plugin-eslint2` does not install or configure ESLint for you. Install the ESLint major you want; each one has its own Node.js requirement, listed in the [getting started guide](https://vite-plugin-eslint2.modyqyw.top/guide/getting-started).

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

> You don't need `@types/eslint` from v9.10.0 on.

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

## Acknowledge

Initially forked from [gxmari007/vite-plugin-eslint](https://github.com/gxmari007/vite-plugin-eslint).

## Contributors

This project was created by [ModyQyW](https://github.com/ModyQyW).

Thanks to [all contributors](https://github.com/ModyQyW/vite-plugin-eslint2/graphs/contributors) for their contributions!

## Sponsors

If this package is helpful to you, please consider [sponsoring](https://github.com/ModyQyW/sponsors). It keeps the project developed and maintained.

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/ModyQyW/sponsors/sponsorkit/sponsors.svg">
    <img src="https://cdn.jsdelivr.net/gh/ModyQyW/sponsors/sponsorkit/sponsors.svg"/>
  </a>
</p>
