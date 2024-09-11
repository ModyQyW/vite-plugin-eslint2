import type * as ESLint from 'eslint';
import type * as Rollup from 'rollup';
import type { CreateFilter } from '@rollup/pluginutils';

export type FilterPattern = string | string[];
export type Filter = ReturnType<CreateFilter>;

export interface ESLintPluginOptions extends ESLint.ESLint.Options {
  /**
   * Run ESLint under `test` mode. See [Command Line
   * Interface](https://vitejs.dev/guide/#command-line-interface) and [Configuring
   * Vitest](https://vitest.dev/guide/#configuring-vitest) for more.
   *
   * 在 `test` 模式下运行 ESLint。查看 [命令行界面](https://cn.vitejs.dev/guide/#command-line-interface) 和 [配置
   * Vitest](https://cn.vitest.dev/guide/) 了解更多。
   *
   * @default false
   */
  test: boolean;
  /**
   * Run ESLint under `serve` command. See [Command Line
   * Interface](https://vitejs.dev/guide/#command-line-interface) for more.
   *
   * 在 `serve` 命令下运行 ESLint。查看 [命令行界面](https://cn.vitejs.dev/guide/#command-line-interface) 了解更多。
   *
   * @default true
   */
  dev: boolean;
  /**
   * Run ESLint under `build` command. See [Command Line
   * Interface](https://vitejs.dev/guide/#command-line-interface) for more.
   *
   * 在 `build` 命令下运行 ESLint。查看 [命令行界面](https://cn.vitejs.dev/guide/#command-line-interface) 了解更多。
   *
   * @default false
   */
  build: boolean;
  /**
   * Store the results of processed files when enabled. This is enabled by default to improve speed.
   *
   * 启用时，存储已处理的文件的结果。默认启用以提高速度。
   *
   * @default true
   */
  cache: boolean;
  /**
   * Path to a file or directory for the cache location. `.eslintcache` is the default cache
   * location of ESLint.
   *
   * 缓存位置的文件或目录的路径。`.eslintcache` 是 ESLint 的默认缓存位置。
   *
   * @default '.eslintcache'
   */
  cacheLocation: string;
  /**
   * This option specifies the files you want to lint. You don't need to change it in most cases,
   * unless you're using a framework like Nuxt, or if the `include` and `exclude` ranges overlap.
   *
   * If you're using the plugin defaults, the plugin will only call
   * [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns)
   * in the `transform` hook. The option value will be used to [create a
   * filter](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter)
   * to determine if the call should be made and the parameter of the call, which means that the
   * option value needs to fulfill the requirements of
   * [picomatch@2.3.1](https://github.com/micromatch/picomatch/tree/2.3.1).
   *
   * If you enable the `lintOnStart` option, the plugin will also call `eslint.lintFiles` in the
   * `buildStart` hook. The option value will not be used to create a filter, but will be used
   * directly as the call parameter, which means that the option value also needs to fulfill the
   * [minimatch@3.1.2](https://github.com/isaacs/minimatch/tree/3.1.2) requirement.
   *
   * If you disable the `lintDirtyOnly` option, the plugin will use the option value as the call
   * parameter every time it calls `eslint.lintFiles`, which means that the option value also needs
   * to fulfill the requirements of `minimatch@3.1.2`.
   *
   * 这个选项指定你想要校验的文件模式。在绝大部分情况下，你并不需要调整它，除非你正在使用 Nuxt 等框架，或者 `include` 和 `exclude` 范围有重合。
   *
   * 如果你正在使用插件默认设置，插件只会在 `transform` 生命周期中调用
   * [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns)。这个选项值会被用于
   * [创建一个过滤器](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter)
   * 来确定是否该调用以及调用参数。这意味着选项值需要满足
   * [picomatch@2.3.1](https://github.com/micromatch/picomatch/tree/2.3.1) 的要求。
   *
   * 如果你启用了 `lintOnStart` 选项，插件还会在 `buildStart` 生命周期中调用
   * `eslint.lintFiles`。这个选项值不会用于创建过滤器，而是直接用作调用参数。这意味着这个选项值还需要满足
   * [minimatch@3.1.2](https://github.com/isaacs/minimatch/tree/3.1.2) 的要求。
   *
   * 如果你禁用了 `lintDirtyOnly` 选项，插件每次调用 `eslint.lintFiles` 时都会将该选项值作为调用参数。这意味着这个选项值也需要满足
   * `minimatch@3.1.2` 的要求。
   */
  include: FilterPattern;
  /**
   * This option specifies the files you don't want to lint. You don't need to change it in most
   * cases, unless you're using a framework such as Nuxt, or if the `include` and `exclude` ranges
   * overlap.
   *
   * If you're using the plugin defaults, the plugin will only call
   * [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns)
   * in the `transform` hook. The option value will be used to [create a
   * filter](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter)
   * to determine if the call should be made and the parameter of the call, which means that the
   * option value needs to fulfill the requirements of
   * [picomatch@2.3.1](https://github.com/micromatch/picomatch/tree/2.3.1).
   *
   * If you enable the `lintOnStart` option or disable the `lintDirtyOnly` option, the option value
   * will not take effect. You need to change `include` value to include this option value.
   *
   * 这个选项指定你不想要校验的文件模式。在绝大部分情况下，你并不需要调整它，除非你正在使用 Nuxt 等框架，或者 `include` 和 `exclude` 范围有重合。
   *
   * 如果你正在使用插件默认设置，插件只会在 `transform` 生命周期中调用
   * [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns)。这个选项值会被用于
   * [创建一个过滤器](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter)
   * 来确定是否该调用以及调用参数。这意味着选项值需要满足
   * [picomatch@2.3.1](https://github.com/micromatch/picomatch/tree/2.3.1) 的要求。
   *
   * 如果你启用了 `lintOnStart` 选项或者禁用了 `lintDirtyOnly` 选项，这个选项值不会生效。你需要调整 `include` 值以包含该选项值。
   */
  exclude: FilterPattern;
  /**
   * Path to ESLint that will be used for linting. Use [dynamic
   * import](https://javascript.info/modules-dynamic-imports) under the hood. Read [vite server.fs
   * options](https://vitejs.dev/config/server-options.html#server-fs-strict) first.
   *
   * ESLint 路径，用于校验文件。底层使用使用 [dynamic import](https://javascript.info/modules-dynamic-imports)。请先阅读
   * [Vite server.fs 选项](https://cn.vitejs.dev/config/server-options.html#server-fs-strict)。
   *
   * @default 'eslint'
   */
  eslintPath: string;
  /**
   * The name or the path of a formatter.
   *
   * This is used to [load a
   * formatter](https://eslint.org/docs/developer-guide/nodejs-api#-eslintloadformatternameorpath)
   * in order to convert lint results to a human- or machine-readable string.
   *
   * 格式化器的名称或路径。
   *
   * 用于
   * [读取格式化器](https://eslint.org/docs/developer-guide/nodejs-api#-eslintloadformatternameorpath)，以便将校验结果转换为人类或机器可读的字符串。
   *
   * @default 'stylish'
   */
  formatter: string;
  /**
   * Lint in [worker](https://nodejs.org/api/worker_threads.html#portpostmessagevalue-tran). This is
   * disabled by default.
   *
   * When lint in worker, Vite build process will be faster. Vite build process will not be stopped,
   * even with errors shown in terminal.
   *
   * It is similar with [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker), but
   * [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker) can show you errors and
   * warnings in browsers.
   *
   * 在 [worker](https://nodejs.org/api/worker_threads.html#portpostmessagevalue-tran) 中校验。默认禁用。
   *
   * 在 worker 中校验时，Vite 的构建过程会更快。即使终端显示了错误，Vite 的构建过程也不会停止。
   *
   * 这与 [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker) 类似，但
   * [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker) 可以在浏览器中显示错误。
   *
   * @default false
   */
  lintInWorker: boolean;
  /**
   * Lint `include` option specified files once in `buildStart` hook to find potential errors. This
   * is disabled by default.
   *
   * This will significantly slow down Vite first starting if you have no caches and don't enable
   * `lintInWorker`.
   *
   * 在 `buildStart` 生命周期中校验 `include` 选项指定的文件一次以发现潜在的错误。默认禁用。
   *
   * 如果你没有缓存而且没有启用 `lintInWorker`，这将大大降低 Vite 的初次启动速度。
   *
   * @default false
   */
  lintOnStart: boolean;
  /**
   * Lint changed files only when running ESLint except from `buildStart` hook. This is enabled by
   * default.
   *
   * This plugin will lint `include` option specified files when disabled.
   *
   * 在 `buildStart` 生命周期之外运行 ESLint 时，只校验修改过的文件。默认启用。
   *
   * 禁用时，会校验 `include` 选项值对应的文件。
   *
   * @default true
   */
  lintDirtyOnly: boolean;
  /**
   * Run ESLint in Chokidar `change` event instead of `transform` hook. This is disabled by default.
   *
   * Recommend to enable `lintOnStart` if you enable this one.
   *
   * 在 Chokidar `change` 事件中而不是在 `transform` 生命周期中运行 ESLint。默认禁用。
   *
   * 如果你启用这个选项，建议也启用 `lintOnStart`。
   *
   * @default false
   */
  chokidar: boolean;
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

export type TextType = 'error' | 'warning' | 'plugin';
