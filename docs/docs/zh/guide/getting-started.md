---
description: 安装 vite-plugin-eslint2，挑好合适的 ESLint 版本和 Node.js 下限，再把插件加到 vite.config.ts 里。
---

# 起步

## 总览

`vite-plugin-eslint2` 在 Vite 里跑 ESLint。支持 Vite v2 到 v8 和 ESLint v7 到 v10。插件本身要求 Node.js 18 以上，各个 ESLint 大版本对 Node.js 的要求不同，见下表。

> Nuxt 项目请用 [@nuxt/eslint](https://github.com/nuxt/eslint)。

> 你可能还需要 [Vite Stylelint 插件](https://github.com/ModyQyW/vite-plugin-stylelint)。

## 安装

```sh
npm install vite-plugin-eslint2 -D
```

`vite-plugin-eslint2` 不会替你安装和配置 ESLint。你需要的大版本和它配套的类型包，自己装。

| ESLint | 安装                                        | Node.js                             |
| ------ | ------------------------------------------- | ----------------------------------- |
| 10     | `npm install eslint@^10 -D`                 | `^20.19.0 \|\| ^22.13.0 \|\| >=24`  |
| 9      | `npm install eslint@^9 @types/eslint@^9 -D` | `^18.18.0 \|\| ^20.9.0 \|\| >=21.1.0` |
| 8      | `npm install eslint@^8 @types/eslint@^8 -D` | `^12.22.0 \|\| ^14.17.0 \|\| >=16.0.0` |
| 7      | `npm install eslint@^7 @types/eslint@^7 -D` | `^10.12.0 \|\| >=12.0.0`          |

ESLint 9.10.0 起自带类型，低于这个版本才需要装 `@types/eslint`。

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
