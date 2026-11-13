---
description: Why this fork exists, and when your editor, the ESLint CLI or CI already does the job.
---

# Why & Why not?

## Why

This project was forked from [gxmari007/vite-plugin-eslint](https://github.com/gxmari007/vite-plugin-eslint). The original had issues and pull requests piling up with nobody maintaining it. I emailed the author and got no reply.

My fork added what I needed at the time. That was ESLint v8 support, the `eslintPath`, `lintInWorker`, `lintOnStart` and `lintDirtyOnly` options, and a forced ignore for virtual modules. Back then it was published as `@modyqyw/vite-plugin-eslint`. I renamed it to `vite-plugin-eslint2` in early 2023 so it is easier to find.

## Why not

Most projects do not need this plugin.

Your editor already shows the same problems. VS Code needs the [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint). WebStorm ships the feature.

You can also run ESLint from the CLI or in CI.

Webpack projects use [eslint-webpack-plugin](https://github.com/webpack-contrib/eslint-webpack-plugin) for the same job.

Turn the plugin on when you want errors and warnings while Vite runs. Set `lintInWorker` so the checks stay off the build thread. Results print to the console.

## Alternatives

[@nabla/vite-plugin-eslint](https://github.com/nabla/vite-plugin-eslint) and [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker) cover similar ground. Pick the one that fits your needs.

ESLint only checks JavaScript and TypeScript. To run Stylelint in Vite with the same setup, use [vite-plugin-stylelint](https://github.com/ModyQyW/vite-plugin-stylelint).

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
