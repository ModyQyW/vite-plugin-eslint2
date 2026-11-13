---
description: When vite-plugin-eslint2 is worth adding, why linting feels slow, how to recover a broken cache, and why the error overlay shows raw ANSI colors.
---

# FAQ

## Should I use this plugin?

Usually not. Read [Why & Why not?](/guide/why) for the cases where the plugin helps, and for the cases where your editor, the CLI or CI already cover it.

Turn the plugin on when you want errors and warnings while Vite runs. Set `lintInWorker` so the checks stay off the build thread.

## Cache looks broken?

1. Delete the cache file.
2. Fix the problem by hand.
3. Restart Vite.

## The plugin is slow?

The plugin lints on the main thread by default. That can block the build.

Set `lintInWorker` to keep Vite responsive. Results print to the console.

You can also run ESLint next to Vite instead of inside it. [@nabla/vite-plugin-eslint](https://github.com/nabla/vite-plugin-eslint) and [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker) are other choices.

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

`fix` rewrites files while you work. Drop it if that does not suit your setup.

## Why is the error output all red?

Vite's native error overlay does not render `PluginContext.warn` output. It shows ESLint's ANSI-colored `stylish` output verbatim, so the color distinctions disappear in the browser.

These limits are tracked upstream in [#2076](https://github.com/vitejs/vite/issues/2076), [#6274](https://github.com/vitejs/vite/pull/6274) and [#8327](https://github.com/vitejs/vite/discussions/8327).

Set `customOverlay: true` to render the results natively. Errors and warnings get separate styling.
