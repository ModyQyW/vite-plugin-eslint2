# 从 vite-plugin-eslint 迁移

`vite-plugin-eslint2` 从 [gxmari007/vite-plugin-eslint](https://github.com/gxmari007/vite-plugin-eslint) 分叉而来，持续维护中，增加了新功能、更广泛的兼容性和错误修复。本指南帮助你完成迁移。

## 安装

```sh
npm uninstall vite-plugin-eslint
npm install vite-plugin-eslint2 -D
```

## 更新导入

```diff
- import eslint from 'vite-plugin-eslint'
+ import eslint from 'vite-plugin-eslint2'
```

## 选项变更

### 默认值变更

| 选项 | vite-plugin-eslint | vite-plugin-eslint2 |
|------|--------------------|---------------------|
| `cache` | `false` | `true` |
| `include` | `['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx', '**/*.vue', '**/*.svelte']` | `['src/**/*.{js,jsx,ts,tsx,vue,svelte}']` |
| `exclude` | `['**/node_modules/**']` | `['node_modules', 'virtual:']` |

`cache` 默认值变更意味着缓存默认启用。`include` 默认值现在限定在 `src/` 目录下——如果你的源文件在 `src/` 之外，需要手动设置 `include`。

### 移除的选项

| 选项 | 替代方案 |
|------|----------|
| `failOnError` | 使用 `emitErrorAsWarning`（设为 `true` 将错误降级为警告，避免构建失败） |
| `failOnWarning` | 使用 `emitWarningAsError`（设为 `true` 将警告升级为错误，导致构建失败） |

### 新增选项

| 选项 | 默认值 | 说明 |
|------|--------|------|
| `test` | `false` | 是否在 `test` 模式（Vitest）下运行 ESLint |
| `dev` | `true` | 是否在 `vite dev` 下运行 ESLint |
| `build` | `false` | 是否在 `vite build` 下运行 ESLint |
| `cacheLocation` | `'.eslintcache'` | 缓存文件路径 |
| `eslintPath` | `'eslint'` | ESLint 自定义路径 |
| `lintInWorker` | `false` | 在 worker 线程中校验以提升性能 |
| `lintOnStart` | `false` | 项目启动时校验所有匹配文件 |
| `lintDirtyOnly` | `true` | 在 `buildStart` 之外只校验修改过的文件 |
| `emitErrorAsWarning` | `false` | 将发现的错误作为警告输出 |
| `emitWarningAsError` | `false` | 将发现的警告作为错误输出 |

### 类型变更

| 选项 | vite-plugin-eslint | vite-plugin-eslint2 |
|------|--------------------|---------------------|
| `formatter` | `string \| (results) => string` | `string` |

`formatter` 选项不再接受函数，只接受格式化器的名称或路径。

### `cacheLocation` 行为

`vite-plugin-eslint` 的 `cacheLocation` 默认为 Vite 的 `cacheDir + '/.eslintcache'`。`vite-plugin-eslint2` 默认为项目根目录的 `.eslintcache`（遵循 ESLint 自身的默认值）。

## 行为变更

### `apply` 钩子

`vite-plugin-eslint` 在所有模式下无条件运行。`vite-plugin-eslint2` 使用 `apply` 钩子控制插件的生效时机：

| 场景 | vite-plugin-eslint | vite-plugin-eslint2 |
|------|-------------------|---------------------|
| `vite dev` | 运行 | 运行（`dev: true`） |
| `vite build` | 运行 | **不运行**（`build: false`） |
| Vitest | 运行 | **不运行**（`test: false`） |

如果需要在构建时校验，设置 `build: true`：

```ts
eslint({ build: true })
```

### 虚拟模块处理

`vite-plugin-eslint2` 强制忽略虚拟模块（`virtual:`、`\0` 前缀、以及不包含 `/` 的模块 ID）。你不再需要手动排除它们。

## 版本兼容性

| | vite-plugin-eslint | vite-plugin-eslint2 |
|-|-------------------|---------------------|
| Vite | v2 ~ v3 | v2 ~ v8 |
| ESLint | v7 | v7 ~ v10 |
| Node | — | >= 18 |

## 迁移后示例

```ts
// vite.config.ts
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint2";

export default defineConfig({
  plugins: [eslint()],
});
```

如果需要在构建时校验（匹配旧行为）：

```ts
export default defineConfig({
  plugins: [eslint({ build: true })],
});
```

推荐配置以获得最佳开发体验：

```ts
export default defineConfig({
  plugins: [eslint({
    fix: true,
    lintInWorker: true,
    lintOnStart: true,
  })],
});
```
