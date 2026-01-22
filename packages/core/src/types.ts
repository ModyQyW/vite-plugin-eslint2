import type { CreateFilter } from "@rollup/pluginutils";
import type * as ESLint from "eslint";
import type * as Rollup from "rollup";

export type FilterPattern = string | string[];
export type Filter = ReturnType<CreateFilter>;

export interface OverlayConfig {
  /**
   * Position：'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
   *
   * 位置：'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
   *
   * @default 'bottom-right'
   */
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";

  /**
   * Whether to expand initially
   *
   * 初始是否展开
   *
   * @default true（有错误时 / when there are errors）
   */
  initialIsOpen?: boolean;

  /**
   * Maximum number of issues to display per file
   *
   * 单文件最大显示问题数
   *
   * @default 50
   */
  maxIssues?: number;

  /**
   * Custom styles
   *
   * 自定义样式
   */
  style?: Record<string, string>;
}

export interface ESLintPluginOptions extends ESLint.ESLint.Options {
  /**
   * Whether to enable the cache. This is disabled in ESLint by default and enabled in plugin by default to improve speed.
   *
   * 是否启用缓存。ESLint 默认禁用，插件默认启用以提高速度。
   *
   * @default true
   */
  cache: boolean;

  /**
   * Run ESLint under `test` mode. See [Command Line
   * Interface](https://vitejs.dev/guide/#command-line-interface) and [Configuring Vitest](https://vitest.dev/guide/#configuring-vitest) for more.
   *
   * 在 `test` 模式下运行 ESLint。查看 [命令行界面](https://cn.vitejs.dev/guide/#command-line-interface) 和 [配置 Vitest](https://cn.vitest.dev/guide/) 了解更多。
   *
   * @default false
   */
  test: boolean;
  /**
   * Run ESLint under `serve` command. See [Command Line Interface](https://vitejs.dev/guide/#command-line-interface) for more.
   *
   * 在 `serve` 命令下运行 ESLint。查看 [命令行界面](https://cn.vitejs.dev/guide/#command-line-interface) 了解更多。
   *
   * @default true
   */
  dev: boolean;
  /**
   * Run ESLint under `build` command. See [Command Line Interface](https://vitejs.dev/guide/#command-line-interface) for more.
   *
   * 在 `build` 命令下运行 ESLint。查看 [命令行界面](https://cn.vitejs.dev/guide/#command-line-interface) 了解更多。
   *
   * @default false
   */
  build: boolean;
  /**
   * This option specifies the files you want to lint. You don't need to change it in most cases, unless the `include` and `exclude` ranges overlap.
   *
   * If you're using the plugin defaults, the plugin will only call [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns) in the `transform` hook. The option value will be used to [create a filter](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter) to determine if the call should be made and the parameter of the call, which means that the option value needs to fulfill the requirements of [picomatch@2.3.1](https://github.com/micromatch/picomatch/tree/2.3.1).
   *
   * If you enable the `lintOnStart` option, the plugin will also call [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns) in the `buildStart` hook. The option value will not be used to create a filter, but will be used directly as the call parameter, which means that the option value also needs to fulfill the [minimatch@3.1.2](https://github.com/isaacs/minimatch/tree/3.1.2) requirement.
   *
   * If you disable the `lintDirtyOnly` option, the plugin will use the option value as the call parameter every time it calls [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns), which means that the option value also needs to fulfill the requirements of [minimatch@3.1.2](https://github.com/isaacs/minimatch/tree/3.1.2).
   *
   * If you disable the `lintDirtyOnly` option, the plugin will use the option value as the call parameter when it calls [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns) outside of the `buildStart` lifecycle. This means that this option value also needs to fulfill the requirements of [minimatch@3.1.2](https://github.com/isaacs/minimatch/tree/3.1.2).
   *
   * 这个选项指定你想要校验的文件模式。在绝大部分情况下，你并不需要调整它，除非 `include` 和 `exclude` 范围有重合。
   *
   * 如果你正在使用插件默认设置，插件只会在 `transform` 生命周期中调用 [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns)。这个选项值会被用于 [创建一个过滤器](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter) 来确定是否该调用以及调用参数。这意味着选项值需要满足 [picomatch@2.3.1](https://github.com/micromatch/picomatch/tree/2.3.1) 的要求。
   *
   * 如果你启用了 `lintOnStart` 选项，插件还会在 `buildStart` 生命周期中调用 [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns)。这个选项值不会用于创建过滤器，而是直接用作调用参数。这意味着这个选项值还需要满足 [minimatch@3.1.2](https://github.com/isaacs/minimatch/tree/3.1.2) 的要求。
   *
   * 如果你禁用了 `lintDirtyOnly` 选项，插件每次调用 [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns) 时都会将该选项值作为调用参数。这意味着这个选项值也需要满足 [minimatch@3.1.2](https://github.com/isaacs/minimatch/tree/3.1.2) 的要求。
   */
  include: FilterPattern;
  /**
   * This option specifies the files you don't want to lint. You don't need to change it in most cases, unless the `include` and `exclude` ranges overlap.
   *
   * The plugin forces the virtual module to be ignored and you don't need to do any configuration related to it here.
   *
   * If you're using the plugin defaults, the plugin will only call [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns) in the `transform` hook. The option value will be used to [create a filter](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter) to determine if the call should be made and the parameter of the call, which means that the option value needs to fulfill the requirements of [picomatch@2.3.1](https://github.com/micromatch/picomatch/tree/2.3.1).
   *
   * If you enable the `lintOnStart` option or disable the `lintDirtyOnly` option, the option value will not take effect. You need to change `include` value to include this option value.
   *
   * 这个选项指定你不想要校验的文件模式。在绝大部分情况下，你并不需要调整它，除非 `include` 和 `exclude` 范围有重合。
   *
   * 插件强制忽略虚拟模块，你不需要在这里进行任何相关配置。
   *
   * 如果你正在使用插件默认设置，插件只会在 `transform` 生命周期中调用 [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns)。这个选项值会被用于 [创建一个过滤器](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter) 来确定是否该调用以及调用参数。这意味着选项值需要满足 [picomatch@2.3.1](https://github.com/micromatch/picomatch/tree/2.3.1) 的要求。
   *
   * 如果你启用了 `lintOnStart` 选项或禁用了 `lintDirtyOnly` 选项，这个选项值不会生效。你需要调整 `include` 值以包含该选项值。
   */
  exclude: FilterPattern;
  /**
   * Path to ESLint that will be used for linting. Use [dynamic import](https://javascript.info/modules-dynamic-imports) under the hood. Read [server.fs](https://vitejs.dev/guide/#command-line-interface) first.
   *
   * If you want to use the flat config system in ESLint v8, set the value to `'eslint/use-at-your-own-risk'`. Place a flat config file in the root of your project or set the `ESLINT_USE_FLAT_CONFIG` environment variable to true and pass the option `overrideConfigFile` to the plugin if you are using other config files.
   *
   * You can learn more from [Flat config rollout plans](https://eslint.org/blog/2023/10/flat-config-rollout-plans/) and [Configuration Files (New)](https://eslint.org/docs/latest/use/configure/configuration-files-new).
   *
   * ESLint 路径，用于校验文件。底层使用使用 [dynamic import](https://javascript.info/modules-dynamic-imports)。请先查看 [server.fs](https://cn.vitejs.dev/guide/#command-line-interface)。
   *
   * 如果你想在 ESLint v8 中使用平面配置，将值设置为 `'eslint/use-at-your-own-risk'`。在你的项目根放置一个平面配置文件，或者设置 `ESLINT_USE_FLAT_CONFIG` 环境变量。如果你在使用其它位置的配置文件，请传递选项 `overrideConfigFile` 给插件。
   *
   * 查看 [Flat config rollout plans](https://eslint.org/blog/2023/10/flat-config-rollout-plans/) 和 [Configuration Files (New)](https://eslint.org/docs/latest/use/configure/configuration-files-new) 了解更多。
   *
   * @default "eslint"
   */
  eslintPath: string;
  /**
   * The name or the path of a formatter. This is used to [load a formatter](https://eslint.org/docs/developer-guide/nodejs-api#-eslintloadformatternameorpath) in order to convert lint results to a human- or machine-readable string.
   *
   * 格式化器的名称或路径。用于 [读取格式化器](https://eslint.org/docs/developer-guide/nodejs-api#-eslintloadformatternameorpath)，以便将校验结果转换为人类或机器可读的字符串。
   *
   * @default "stylish"
   */
  formatter: string;
  /**
   * Lint in [worker](https://nodejs.org/api/worker_threads.html#portpostmessagevalue-tran). This is disabled by default.
   *
   * When lint in worker, Vite build process will be faster. You will not see Vite error overlay, Vite build process will not be stopped, even with errors shown in terminal.
   *
   * It is similar with [@nabla/vite-plugin-eslint](https://github.com/nabla) and [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker), but @nabla/vite-plugin-eslint only supports linting in worker, vite-plugin-checker can show you errors and warnings in browsers.
   *
   * 在 [worker](https://nodejs.org/api/worker_threads.html#portpostmessagevalue-tran) 中校验。默认禁用。
   *
   * 在 worker 中校验时，Vite 的构建过程会更快。即使终端显示了 ESLint 校验错误，你也不会看到 Vite 错误遮罩层，Vite 构建也不会停止。
   *
   * 这与 [@nabla/vite-plugin-eslint](https://github.com/nabla)、[vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker) 类似。不同的是，@nabla/vite-plugin-eslint 只支持在 worker 中校验，vite-plugin-checker 可以在浏览器中显示错误和警告。
   *
   * @default false
   */
  lintInWorker: boolean;
  /**
   * Lint `include` option specified files once in `buildStart` hook to find potential errors. This is disabled by default.
   *
   * This will significantly slow down Vite first starting if you have no caches and don't enable `lintInWorker`.
   *
   * 在 `buildStart` 生命周期中校验 `include` 选项指定的文件一次以发现潜在的错误。默认禁用。
   *
   * 如果你没有缓存而且没有启用 `lintInWorker`，这将大大降低 Vite 的初次启动速度。
   *
   * @default false
   */
  lintOnStart: boolean;
  /**
   * Whether or not to checkout only modified files that are not included in the `exclude` option value when running ESLint outside of the `buildStart` lifecycle. Enabled by default.
   *
   * When disabled, files are checked against the `include` and `exclude` option values.
   *
   * 在 `buildStart` 生命周期之外运行 ESLint 时，是否只校验修改过且没有包含在 `exclude` 选项值内的文件。默认启用。
   *
   * 禁用时，会根据 `include` 和 `exclude` 选项值确定需要校验文件。
   *
   * @default true
   */
  lintDirtyOnly: boolean;
  /**
   * Emit found errors. This is enabled by default.
   *
   * 输出发现的错误。默认启用。
   *
   * @default true
   */
  emitError: boolean;
  /**
   * Emit found errors as warnings. This is disabled by default but you may want it enabled when
   * prototyping.
   *
   * 将发现的错误作为警告输出。默认禁用，但你可能会在开发原型时启用这个。
   *
   * @default false
   */
  emitErrorAsWarning: boolean;
  /**
   * Emit found warnings. This is enabled by default.
   *
   * 输出发现的警告。默认启用。
   *
   * @default true
   */
  emitWarning: boolean;
  /**
   * Emit found warnings as errors when enabled. This is disabled by default.
   *
   * 将发现的警告作为错误输出。默认禁用。
   *
   * @default false
   */
  emitWarningAsError: boolean;
  /**
   * Whether to enable runtime overlay in dev mode
   *
   * 是否在 dev 模式启用运行时 overlay
   *
   * @default true（在支持的环境下 / in supported environments）
   */
  overlay?: boolean | OverlayConfig;
  /**
   * Whether to output in terminal
   *
   * 是否在终端输出
   *
   * @default true
   */
  terminal?: boolean;
}
export type ESLintPluginUserOptions = Partial<ESLintPluginOptions>;

export type ESLintInstance = ESLint.ESLint;
export type ESLintConstructorOptions = ESLint.ESLint.Options;
export type ESLintFormatter = ESLint.ESLint.Formatter;
export type ESLintOutputFixes = typeof ESLint.ESLint.outputFixes;
export type ESLintLintResult = ESLint.ESLint.LintResult;
export type ESLintLintResults = ESLintLintResult[];

export type LintFiles = (
  config: {
    files: FilterPattern;
    eslintInstance: ESLintInstance;
    formatter: ESLintFormatter;
    outputFixes: ESLintOutputFixes;
    options: ESLintPluginOptions;
  },
  context?: Rollup.PluginContext,
) => Promise<void>;

export type TextType = "error" | "warning" | "plugin";
