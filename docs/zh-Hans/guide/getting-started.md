# 起步

## 总览

`vite-plugin-eslint2` 是 Vite ESLint 插件。支持 Vite v2 ~ v5 和 ESLint v7 ~ v9。要求 `node>=18`。

> 对于 Nuxt 项目，请使用 [@nuxt/eslint](https://github.com/nuxt/eslint)。

> 你也可能想要 [Vite Stylelint 插件](https://github.com/ModyQyW/vite-plugin-stylelint)。

## 安装

```sh
npm install vite-plugin-eslint2 -D
```

`vite-plugin-eslint2` 不会为你安装和配置 ESLint。你应该自己处理这些。

::: details ESLint v9

```sh
npm install eslint@^9 @types/eslint@^9 -D
```

> 如果你使用 v9.10.0 或更高版本，你不需要安装 `@types/eslint`。

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

如果这个包对你有所帮助，请考虑 [赞助](https://github.com/ModyQyW/sponsors) 支持，这将有利于项目持续开发和维护。

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/ModyQyW/sponsors/sponsorkit/sponsors.svg">
    <img src="https://cdn.jsdelivr.net/gh/ModyQyW/sponsors/sponsorkit/sponsors.svg"/>
  </a>
</p>
