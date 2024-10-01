# 常见问题

## 我应该使用这个插件吗？

大多数情况下不需要。

在 Webpack 使用 [eslint-webpack-plugin](https://github.com/webpack-contrib/eslint-webpack-plugin) 是很常见的，而这个插件在 Vite 中做着几乎一样的事情。

但是，我们的 IDE 可以直接显示相对应的校验信息。对于 VS Code，我们只需要添加 [ESLint 插件](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)。WebStorm 已经内置了这个功能。此外，我们也可以在命令行或者 CI 中运行 ESLint 来获取反馈。
  
我们有这么多方法运行 ESLint，没有太大必要再在 Vite 中运行 ESLint，这也就意味着我们在大多数情况下不需要这个插件。

如果你真的很需要查看错误和警告，请尝试启用 `lintInWorker` 选项，它保持了 Vite 的速度，并在控制台中打印信息。你也可以尝试一下社区内的 [@nabla/vite-plugin-eslint](https://github.com/nabla/vite-plugin-eslint) 和 [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker)。

## 缓存失效了？

删除缓存文件，手动修复错误后重启 Vite 即可。

## 插件运行非常慢？

默认地，插件是同步运行的，这可能会造成阻塞。请尝试启用 `lintInWorker` 选项，它保持了 Vite 的速度，并在控制台中打印信息。你也可以尝试一下社区内的 [@nabla/vite-plugin-eslint](https://github.com/nabla/vite-plugin-eslint) 和 [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker)，或者在 Vite 之外直接运行 ESLint。

## 推荐配置？

```ts
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint2";

export default defineConfig({
  plugins: [eslint({
    lintInWorker: true,
    lintOnStart: true,
  })],
});

```

## 错误信息全红？

Vite 的错误遮罩层不支持显示 `PluginContext.warn` 信息和全色消息，还有一些限制（参见 [#2076](https://github.com/vitejs/vite/issues/2076)、[#6274](https://github.com/vitejs/vite/pull/6274) 和 [#8327](https://github.com/vitejs/vite/discussions/8327)）。
