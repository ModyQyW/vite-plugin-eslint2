# Getting Started

## Overview

`vite-plugin-eslint2` is a project providing ESLint plugin for Vite. Supports Vite v2 ~ v6 and ESLint v7 ~ v9. Requires `node>=18`.

> For Nuxt projects, please use [@nuxt/eslint](https://github.com/nuxt/eslint).

> You may also want [Vite Stylelint plugin](https://github.com/ModyQyW/vite-plugin-stylelint).

## Install

```sh
npm install vite-plugin-eslint2 -D
```

`vite-plugin-eslint2` does not install and config ESLint for you. You should handle these yourself.

::: details ESLint v9

```sh
npm install eslint@^9 @types/eslint@^9 -D
```

> If you are using v9.10.0 or higher, you don't need to install `@types/eslint`.

:::

::: details ESLint v8

```sh
npm install eslint@^8 @types/eslint@^8 -D
```

:::

::: details ESLint v7

```sh
npm install eslint@^7 @types/eslint@^7 -D
```

:::

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

If this package is helpful to you, please consider [sponsoring](https://github.com/ModyQyW/sponsors), which will benefit the ongoing development and maintenance of the project.

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/ModyQyW/sponsors/sponsorkit/sponsors.svg">
    <img src="https://cdn.jsdelivr.net/gh/ModyQyW/sponsors/sponsorkit/sponsors.svg"/>
  </a>
</p>
