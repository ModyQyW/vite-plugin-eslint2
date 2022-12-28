# CHANGELOG

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
