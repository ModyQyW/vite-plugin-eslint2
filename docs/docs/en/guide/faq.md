# FAQ

## Should I use this plugin?

Most of the time you don't need it.

[eslint-webpack-plugin](https://github.com/webpack-contrib/eslint-webpack-plugin) is common in Webpack, and this plugin does roughly the same job for Vite.

Your editor already shows the same information. In VS Code you add the [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint); WebStorm ships the feature. You can also run ESLint from the CLI or in CI.

With all of those options, running ESLint inside Vite is rarely necessary. If you do want errors and warnings while Vite runs, turn on `lintInWorker` so the checks stay off the build thread and print to the console. [@nabla/vite-plugin-eslint](https://github.com/nabla/vite-plugin-eslint) and [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker) are other choices.

If you also lint styles, [vite-plugin-stylelint](https://github.com/ModyQyW/vite-plugin-stylelint) does the same job for Stylelint.

## Cache looks broken?

Delete the cache file, fix the problem by hand, then restart Vite.

## The plugin is slow?

By default the plugin lints on the main thread, which can block. Turn on `lintInWorker` to keep Vite responsive and print results to the console. [@nabla/vite-plugin-eslint](https://github.com/nabla/vite-plugin-eslint) and [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker) are alternatives, as is running ESLint next to Vite instead of inside it.

## Recommended configuration?

```ts
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint2";

export default defineConfig({
  plugins: [eslint({
    fix: true,
    lintInWorker: true,
    lintOnStart: true,
  })],
});
```

`fix` rewrites files while you work — drop it if that does not suit your setup.

## Why is the error output all red?

Vite's native error overlay does not render `PluginContext.warn` output and shows ESLint's ANSI-colored `stylish` output verbatim, which loses the color distinctions in the browser. These limitations are tracked upstream in [#2076](https://github.com/vitejs/vite/issues/2076), [#6274](https://github.com/vitejs/vite/pull/6274) and [#8327](https://github.com/vitejs/vite/discussions/8327).

Set `customOverlay: true` to render the results natively instead, with errors and warnings styled separately.
