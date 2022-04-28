# CHANGELOG

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
