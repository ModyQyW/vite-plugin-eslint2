# Getting Started

## Overview

`vite-plugin-eslint2` runs ESLint inside Vite. It supports Vite v2 to v8 and ESLint v7 to v10. The plugin itself needs Node.js 18 or newer; each ESLint major has its own Node.js requirement, listed below.

> For Nuxt projects, use [@nuxt/eslint](https://github.com/nuxt/eslint).

> You may also want the [Vite Stylelint plugin](https://github.com/ModyQyW/vite-plugin-stylelint).

## Install

```sh
npm install vite-plugin-eslint2 -D
```

`vite-plugin-eslint2` does not install or configure ESLint for you. Install the ESLint major you want and the types it needs.

| ESLint | Install                                     | Node.js                             |
| ------ | ------------------------------------------- | ----------------------------------- |
| 10     | `npm install eslint@^10 -D`                 | `^20.19.0 \|\| ^22.13.0 \|\| >=24`  |
| 9      | `npm install eslint@^9 @types/eslint@^9 -D` | `^18.18.0 \|\| ^20.9.0 \|\| >=21.1.0` |
| 8      | `npm install eslint@^8 @types/eslint@^8 -D` | `^12.22.0 \|\| ^14.17.0 \|\| >=16.0.0` |
| 7      | `npm install eslint@^7 @types/eslint@^7 -D` | `^10.12.0 \|\| >=12.0.0`          |

ESLint 9.10.0 and newer ship their own types, so `@types/eslint` is only needed below that.

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
