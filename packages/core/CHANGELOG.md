# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.0.1](https://github.com/ModyQyW/vite-plugin-eslint2/compare/v5.0.0...v5.0.1) (2024-10-19)

**Note:** Version bump only for package vite-plugin-eslint2

## [5.0.0](https://github.com/ModyQyW/vite-plugin-eslint2/compare/v4.4.2...v5.0.0) (2024-10-01)

### ⚠ BREAKING CHANGES

* remove chokidar option

### Features

* remove chokidar option ([e33e7f0](https://github.com/ModyQyW/vite-plugin-eslint2/commit/e33e7f0f09b61eba0a0d686c62004658d2a01380)) - by @ModyQyW

### Bug Fixes

* fix wrong colorize ([cc20565](https://github.com/ModyQyW/vite-plugin-eslint2/commit/cc20565c1463c73ce31641771ccbdcf25c2ea05a)) - by @ModyQyW
* remove extra parsing ([495b39f](https://github.com/ModyQyW/vite-plugin-eslint2/commit/495b39f41b278224690e636f2e1745cd9eefcb0d)) - by @ModyQyW
* terminate worker if possible ([3304fb4](https://github.com/ModyQyW/vite-plugin-eslint2/commit/3304fb4719121f1a0b7be9610a7a1e21efaf5935)) - by @ModyQyW

## [4.4.2](https://github.com/ModyQyW/vite-plugin-eslint2/compare/v4.4.1...v4.4.2) (2024-09-25)

### Bug Fixes

* eslintInstance may not be initialized when calling lintFiles in the worker ([#40](https://github.com/ModyQyW/vite-plugin-eslint2/issues/40)) ([afc7bee](https://github.com/ModyQyW/vite-plugin-eslint2/commit/afc7bee0f04a7eb467dab49351bbb25e94bbd2f4)) - by @fuxichen
* fix types ([654c4bc](https://github.com/ModyQyW/vite-plugin-eslint2/commit/654c4bc018225f8805e597fde27aee8ec810e0b9)) - by @

## [4.4.1](https://github.com/ModyQyW/vite-plugin-eslint2/compare/v4.4.0...v4.4.1) (2024-09-11)

- fix: make `@types/eslint` optional

## 4.4.0 (2024-02-24)

- feat: support `eslint@9`
- feat: try `loadESLint` first, fallback to read explicit classes

## 4.3.1 (2023-11-17)

- chore: update `peerDependencies`

## 4.3.0 (2023-10-23)

- feat: support `rollup@4` and `vite@5`, **ATTENTION**: `rollup@4` is supported since `vite@5.0.0-beta.10`

## 4.2.0 (2023-10-19)

- feat: try to support flat config system

## 4.1.0 (2023-08-21)

- feat: add `test` option

## 4.0.3 (2023-08-17)

- revert: revert "fix: transform errors ↔ warnings for real emitErrorAsWarning and emitWarningAsError"

## 4.0.2 (2023-08-16)

- fix: transform errors ↔ warnings for real emitErrorAsWarning and emitWarningAsError

## 4.0.1 (2023-08-16)

- fix: fix internal function `shouldIgnoreModule` judgement

## 4.0.0 (2023-08-15)

I completely rewrote the plugin. It's still backward compatible, but there is still a possibility that the changes may affect some projects. So I bumped a major version.

- feat: add `lintDirtyOnly` option
- feat: add `debug`
- types: add descriptions
- docs: update README
- feat!: update **internal functions**

## 3.3.0 (2023-03-09)

- build: switch to `unbuild`
- feat: export more types

## 3.2.1 (2023-01-31)

- fix: fix eslint initial params

## 3.2.0 (2023-01-31)

This project is named `vite-plugin-eslint2` now.

- feat: add `chokidar` option
- fix: use `__dirname` directly by accident
- fix: maybe lint files should be ignored
- build: update minify and generate sourcemap

## 3.1.6 (2023-01-04)

- perf: better emit handling

## 3.1.5 (2023-01-04)

- build: switch to rollup
- refactor: `shouldIgnore` function

## 3.1.4 (2022-12-28)

- fix: fix judge order

## 3.1.3 (2022-12-27)

- fix: fix judge order

## 3.1.2 (2022-12-20)

- perf: avoid empty log

## 3.1.1 (2022-12-20)

- perf: avoid logging twice for one file

## 3.1.0 (2022-12-16)

- feat: add `lintInWorker` option
- perf: initialESLint params

## 3.0.1 (2022-12-15)

- fix: fix build

## 3.0.0 (2022-12-09)

- feat: support `vite@4`
- feat!: require `node>=14.18`
- feat!: `build` option defaults to `false`
- feat!: `cacheLocation` option defaults to `.eslintcache`
- feat: esm by default
  - don't be afraid as commonjs is also supported

## 2.1.1 (2022-12-04)

- fix: fix ESLint options lost

## 2.1.0 (2022-11-28)

- feat: add `dev` and `build` option

## 2.0.14 (2022-11-25)

- perf: improve types

## 2.0.13 (2022-11-25)

- refactor

## 2.0.12 (2022-11-25)

- revert: revert `perf: reduce dependencies`, which breaks vite@2

## 2.0.11 (2022-11-24)

- perf: reduce dependencies

## 2.0.10

- fix: fix build

## 2.0.9

- perf: use `config.cacheDir` to get default `cacheLocation`

## 2.0.8

- fix: pass `ctx` to lintFiles method

## 2.0.7

- fix: warning styles

## 2.0.6

- fix: fix typo

## 2.0.5

- perf: warn when `lintOnStart` is true

## 2.0.4

- perf: import path from `node:path` instead of `path`
- fix: fix `type: "module"` support

## 2.0.3

Just update `peerDependencies` in `package.json`.

## 2.0.2

- fix: omit keys to avoid `new ESLint` error

## 2.0.1

- fix: fix type

## 2.0.0

This version supports vite@2 and vite@3. The breaking changes are caused by aligning behaviors with `ESLint` Node.js API.

- feat!: remove `throwOnError` and `throwOnWarning` options (marked as `deprecated` before)
- feat!: `include` and `exclude` options now accept `string | string[]` only to align with `eslint.lintFiles`
- feat: add `lintOnStart` option
- feat: exclude `virtual:` by default

## 1.4.1

- fix: show error message when importing `eslint` if possible
- fix: include `shims` into `dist`

## 1.4.0

- feat: support `vite@3`
- feat: ignore virtual modules
- perf: not to add `build.outDir` into `exclude`
- fix: fix `then` handling

## 1.3.2

- fix: remove `allowSyntheticDefaultImports` and `esModuleInterop` in `tsconfig.json`

## 1.3.1

- fix: fix regressions

## 1.3.0

- feat: include `.svelte` files by default

## 1.2.0

- perf: better output format
- feat: add `emitErrorAsWarning` and `emitWarningAsError` options

## 1.1.0

- fix: fix `index.html` dealing

## 1.1.0-beta.1

- feat: support ESLint options
- feat: recommend `throwOnError` -> `emitError` and `throwOnWarning` -> `emitWarning`

The plugin recommends `emitError` / `emitWarning` instead of `throwOnError` / `throwOnWarning` now. However, you can stay with `throwOnError` / `throwOnWarning` safely. This is a backward-compatible version update.

## 1.1.0-beta.0

- feat: add `eslintPath` option

## 1.0.0

Initial release.
