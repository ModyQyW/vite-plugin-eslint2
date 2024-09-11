# FAQ

## Should I use this plugin?

Most of the time, you don't need this plugin.

It is common to use [eslint-webpack-plugin](https://github.com/webpack-contrib/eslint-webpack-plugin) in Webpack. And this plugin does almost the same in Vite.

However, our IDE is already probably giving all the info we need. We only need to add [ESLint plugin](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) in VSCode. WebStorm already includes the functionality. We can also run ESLint in CI or CLI.

Since we have these ways to run ESLint, it is unnecessary to run ESLint in Vite, which means we don't need this plugin in most cases.

If you really want to check errors and warnings, try enable `lintInWorker` option, which keeps Vite speed and prints in console. Or try [@nabla/vite-plugin-eslint](https://github.com/nabla/vite-plugin-eslint) and [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker).

## Cache is broken?

You can disable `cache` option, or delete the cache, fix errors manully and restart Vite.

## Plugin is running very slow?

By default, the plugin is synchronous, which may cause blocking. Please try to enable `lintInWorker` option, which keeps Vite speed and prints in console. You can also try [@nabla/vite-plugin-eslint](https://github.com/nabla/vite-plugin-eslint) and [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker), or run ESLint directly besides Vite.
