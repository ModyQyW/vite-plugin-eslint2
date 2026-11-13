---
description: Why this fork exists. vite-plugin-eslint stopped being maintained, and vite-plugin-eslint2 keeps it working with ESLint 7-10, worker linting and a custom overlay.
---

# Why vite-plugin-eslint2?

## Reason

This project was forked from [gxmari007/vite-plugin-eslint](https://github.com/gxmari007/vite-plugin-eslint). The original had issues and pull requests piling up with nobody maintaining it; I emailed the author and got no reply.

My fork added what I needed at the time: ESLint v8 support, the `eslintPath`, `lintInWorker`, `lintOnStart` and `lintDirtyOnly` options, and a forced ignore for virtual modules. Back then it was published as `@modyqyw/vite-plugin-eslint`. I renamed it to `vite-plugin-eslint2` in early 2023 so it is easier to find.

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
