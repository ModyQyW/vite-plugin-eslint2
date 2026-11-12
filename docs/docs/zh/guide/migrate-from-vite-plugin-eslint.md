# 从 vite-plugin-eslint 迁移

`vite-plugin-eslint2` 从 [gxmari007/vite-plugin-eslint](https://github.com/gxmari007/vite-plugin-eslint) 分叉出来，一直在维护，加了新功能、支持更多版本、修了问题。下面是把项目迁过来的步骤。

## 安装

```sh
npm uninstall vite-plugin-eslint
npm install vite-plugin-eslint2 -D
```

## 换导入

```diff
- import eslint from 'vite-plugin-eslint'
+ import eslint from 'vite-plugin-eslint2'
```

## 选项变化

### 默认值

| 选项      | vite-plugin-eslint                                                        | vite-plugin-eslint2                       |
| --------- | ------------------------------------------------------------------------- | ----------------------------------------- |
| `cache`   | `false`                                                                   | `true`                                    |
| `include` | `['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx', '**/*.vue', '**/*.svelte']` | `['src/**/*.{js,jsx,ts,tsx,vue,svelte}']`   |
| `exclude` | `['**/node_modules/**']`                                                  | `['node_modules', 'virtual:']`            |

`cache` 现在默认开着。`include` 限定在 `src/`，源文件在别处就自己改。

### 去掉的选项

| 选项            | 替代                                                                       |
| --------------- | -------------------------------------------------------------------------- |
| `failOnError`   | `emitErrorAsWarning`，设成 `true` 把错误降级成警告，构建不中断                  |
| `failOnWarning` | `emitWarningAsError`，设成 `true` 把警告升级成错误，构建失败                   |

### 新增选项

| 选项                  | 默认值          | 说明                                  |
| --------------------- | --------------- | ------------------------------------- |
| `test`                | `false`         | 是否在 `test` 模式（Vitest）下运行 ESLint |
| `dev`                 | `true`          | 是否在 `vite dev` 下运行 ESLint        |
| `build`               | `false`         | 是否在 `vite build` 下运行 ESLint      |
| `cacheLocation`       | `'.eslintcache'` | 缓存文件路径                          |
| `eslintPath`          | `'eslint'`       | 自定义 ESLint 路径                    |
| `lintInWorker`        | `false`         | 在 worker 线程里校验                   |
| `lintOnStart`         | `false`         | 启动时把匹配到的文件全跑一遍              |
| `lintDirtyOnly`       | `true`          | `buildStart` 之外只校验改过的文件        |
| `emitErrorAsWarning`  | `false`         | 把错误当警告输出                       |
| `emitWarningAsError`  | `false`         | 把警告当错误输出                       |

### 类型变化

| 选项        | vite-plugin-eslint              | vite-plugin-eslint2 |
| ----------- | ------------------------------- | ------------------- |
| `formatter` | `string \| (results) => string` | `string`            |

`formatter` 不再接受函数，只能传格式化器的名称或路径。

### `cacheLocation`

`vite-plugin-eslint` 默认是 Vite 的 `cacheDir + '/.eslintcache'`。`vite-plugin-eslint2` 默认是项目根目录的 `.eslintcache`，也就是 ESLint 自己的默认值。

## 行为变化

### `apply` 钩子

`vite-plugin-eslint` 什么模式下都跑。`vite-plugin-eslint2` 用 `apply` 决定什么时候生效：

| 场景         | vite-plugin-eslint | vite-plugin-eslint2   |
| ------------ | ------------------ | --------------------- |
| `vite dev`   | 运行               | 运行（`dev: true`）     |
| `vite build` | 运行               | 不运行（`build: false`） |
| Vitest       | 运行               | 不运行（`test: false`）  |

要在构建时校验，设 `build: true`：

```ts
eslint({ build: true })
```

### 虚拟模块

`vite-plugin-eslint2` 总是忽略虚拟模块：`virtual:`、`\0` 前缀，以及不带 `/` 的模块 ID。你不用再手动排除。

## 版本兼容

|      | vite-plugin-eslint | vite-plugin-eslint2 |
| ---- | ------------------ | ------------------- |
| Vite | v2 到 v3           | v2 到 v8            |
| ESLint | v7               | v7 到 v10           |
| Node | —                  | >= 18               |

## 迁移之后

```ts
// vite.config.ts
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint2";

export default defineConfig({
  plugins: [eslint()],
});
```

要在构建时校验（旧插件的默认行为）：

```ts
export default defineConfig({
  plugins: [eslint({ build: true })],
});
```

日常开发可以从这个配置开始：

```ts
export default defineConfig({
  plugins: [eslint({
    fix: true,
    lintInWorker: true,
    lintOnStart: true,
  })],
});
```
