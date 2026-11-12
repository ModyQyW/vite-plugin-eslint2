import type { CreateFilter } from "@rollup/pluginutils";
import type * as ESLint from "eslint";

export type FilterPattern = string | string[];
export type Filter = ReturnType<CreateFilter>;

export interface ESLintPluginOptions extends ESLint.ESLint.Options {
  /**
   * Run ESLint under the `build` command. See [Command Line Interface](https://vite.dev/guide/#command-line-interface).
   *
   * 在 `build` 命令下运行 ESLint。见[命令行界面](https://cn.vitejs.dev/guide/#command-line-interface)。
   *
   * @default false
   */
  build: boolean;
  /**
   * Turn on ESLint's cache. ESLint disables it, the plugin enables it for speed.
   *
   * 是否启用 ESLint 的缓存。ESLint 默认关闭，插件默认打开，为了快一些。
   *
   * @default true
   */
  cache: boolean;
  /**
   * Use the plugin's own overlay instead of Vite's native error overlay.
   *
   * The native overlay pastes ESLint's ANSI-colored `stylish` output in verbatim, so the colors are lost (or the escape codes show up). The custom overlay renders structured results instead, and unlike the native one it still works with `lintInWorker`.
   *
   * Environments without a DOM entry (mini-programs, SSR, headless tests) never get the runtime injected: the plugin warns once and falls back to terminal output only.
   *
   * - `false`: keep Vite's native overlay. No overlay in worker mode.
   * - `true`: custom overlay, default styling.
   * - `{...}`: custom overlay with the styling you pass.
   *
   * Only applies under `serve`. In `build` mode the native `context.error` blocking behaviour stays.
   *
   * 用插件自己的遮罩层代替 Vite 原生错误遮罩。
   *
   * 原生遮罩会把 ESLint 带 ANSI 颜色的 `stylish` 输出原样贴上去，浏览器里颜色没了，或者直接露出转义字符。自定义遮罩渲染结构化结果，而且和原生遮罩不一样，开着 `lintInWorker` 也能用。
   *
   * 没有 DOM 入口的环境（小程序、SSR、无头测试）拿不到注入的运行时，插件警告一次，之后只往终端输出。
   *
   * - `false`：保留 Vite 原生遮罩。worker 模式下没有遮罩。
   * - `true`：自定义遮罩，默认样式。
   * - `{...}`：自定义遮罩，样式按你传的来。
   *
   * 只在 `serve` 下生效。`build` 模式里仍然是原生 `context.error` 的阻塞行为。
   *
   * @default false
   */
  customOverlay: false | true | CustomOverlayOptions;
  /**
   * Run ESLint under the `serve` command. See [Command Line Interface](https://vite.dev/guide/#command-line-interface).
   *
   * 在 `serve` 命令下运行 ESLint。见[命令行界面](https://cn.vitejs.dev/guide/#command-line-interface)。
   *
   * @default true
   */
  dev: boolean;
  /**
   * Report errors.
   *
   * 输出错误。
   *
   * @default true
   */
  emitError: boolean;
  /**
   * Report errors as warnings. Handy while prototyping.
   *
   * 把错误当警告输出。写原型的时候有用。
   *
   * @default false
   */
  emitErrorAsWarning: boolean;
  /**
   * Report warnings.
   *
   * 输出警告。
   *
   * @default true
   */
  emitWarning: boolean;
  /**
   * Report warnings as errors.
   *
   * 把警告当错误输出。
   *
   * @default false
   */
  emitWarningAsError: boolean;
  /**
   * Which ESLint to lint with. Loaded through [dynamic import](https://javascript.info/modules-dynamic-imports), so read [server.fs](https://vite.dev/config/server-options#server-fs-allow) first.
   *
   * For the flat config system in ESLint v8, set it to `'eslint/use-at-your-own-risk'` and put a flat config file in the project root. If your config lives elsewhere, set the `ESLINT_USE_FLAT_CONFIG` environment variable to true and pass `overrideConfigFile`.
   *
   * See [Flat config rollout plans](https://eslint.org/blog/2023/10/flat-config-rollout-plans/) and [Configuration Files (New)](https://eslint.org/docs/latest/use/configure/configuration-files-new).
   *
   * ESLint v10.0.0 and newer only read flat config and no longer provide `'eslint/use-at-your-own-risk'`.
   *
   * 用哪个 ESLint 校验。底层是[动态导入](https://javascript.info/modules-dynamic-imports)，请先看 [server.fs](https://cn.vitejs.dev/config/server-options#server-fs-allow)。
   *
   * 想在 ESLint v8 里用平面配置，把它设成 `'eslint/use-at-your-own-risk'`，并在项目根目录放一个平面配置文件。配置文件在别处的话，把 `ESLINT_USE_FLAT_CONFIG` 环境变量设成 true，再传 `overrideConfigFile`。
   *
   * 见 [Flat config rollout plans](https://eslint.org/blog/2023/10/flat-config-rollout-plans/) 和 [Configuration Files (New)](https://eslint.org/docs/latest/use/configure/configuration-files-new)。
   *
   * ESLint v10.0.0 起只认平面配置，不再提供 `'eslint/use-at-your-own-risk'`。
   *
   * @default "eslint"
   */
  eslintPath: string;
  /**
   * The files you do not want linted. You rarely need to change it, unless `include` and `exclude` overlap.
   *
   * Virtual modules are always ignored, so you do not need to list them here.
   *
   * With the defaults, the `transform` filter built from `include` and `exclude` applies, so the value has to satisfy [picomatch@2.3.1](https://github.com/micromatch/picomatch/tree/2.3.1).
   *
   * With `lintOnStart` on or `lintDirtyOnly` off, the value is not passed to ESLint; put the patterns into `include` instead. It still decides which modules get linted.
   *
   * 不要校验的文件。除非 `include` 和 `exclude` 的范围有重合，一般不用改。
   *
   * 虚拟模块一律忽略，这里不用管。
   *
   * 用默认配置时，走的是由 `include` 和 `exclude` 生成的 `transform` 过滤器，所以值得满足 [picomatch@2.3.1](https://github.com/micromatch/picomatch/tree/2.3.1) 的要求。
   *
   * 打开 `lintOnStart` 或关掉 `lintDirtyOnly` 后，这个值不会传给 ESLint，把模式写进 `include` 里。它照样决定哪些模块会被校验。
   */
  exclude: FilterPattern;
  /**
   * Name or path of a formatter, [loaded](https://eslint.org/docs/developer-guide/nodejs-api#-eslintloadformatternameorpath) to turn results into a human- or machine-readable string.
   *
   * 格式化器的名称或路径，用来[加载格式化器](https://eslint.org/docs/developer-guide/nodejs-api#-eslintloadformatternameorpath)，把校验结果转成人类或机器能读的字符串。
   *
   * @default "stylish"
   */
  formatter: string;
  /**
   * The files you want linted. You rarely need to change it, unless `include` and `exclude` overlap.
   *
   * How the value is used depends on which hooks run:
   *
   * - With the defaults, the plugin only calls [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns) from the `transform` hook. The value goes through [createFilter](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter) to decide whether to lint and what to pass, so it has to satisfy [picomatch@2.3.1](https://github.com/micromatch/picomatch/tree/2.3.1).
   * - With `lintOnStart` on, the plugin also calls it from `buildStart`. No filter there - the value is the argument - so it also has to satisfy [minimatch@3.1.2](https://github.com/isaacs/minimatch/tree/3.1.2).
   * - With `lintDirtyOnly` off, the value is the argument for every call outside `buildStart`, so it needs [minimatch@3.1.2](https://github.com/isaacs/minimatch/tree/3.1.2) too.
   *
   * 要校验的文件。除非 `include` 和 `exclude` 的范围有重合，一般不用改。
   *
   * 这个值怎么用，取决于哪个钩子在跑：
   *
   * - 用默认配置时，插件只在 `transform` 里调用 [eslint.lintFiles](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintlintfilespatterns)。值会先过一遍 [createFilter](https://github.com/rollup/plugins/blob/master/packages/pluginutils/README.md#createfilter)，决定要不要校验、传什么参数，所以它得满足 [picomatch@2.3.1](https://github.com/micromatch/picomatch/tree/2.3.1) 的要求。
   * - 打开 `lintOnStart` 后，插件还会在 `buildStart` 里调用。这时不过滤，值直接当参数用，所以它还得满足 [minimatch@3.1.2](https://github.com/isaacs/minimatch/tree/3.1.2) 的要求。
   * - 关掉 `lintDirtyOnly` 后，`buildStart` 之外的每次调用都拿这个值当参数，同样需要满足 [minimatch@3.1.2](https://github.com/isaacs/minimatch/tree/3.1.2)。
   */
  include: FilterPattern;
  /**
   * Outside `buildStart`, lint only the files that changed and are not matched by `exclude`.
   *
   * When off, ESLint gets the `include` and `exclude` patterns themselves.
   *
   * `buildStart` 之外，只校验改过、且没有被 `exclude` 匹配到的文件。
   *
   * 关掉后，直接把 `include` 和 `exclude` 的模式交给 ESLint。
   *
   * @default true
   */
  lintDirtyOnly: boolean;
  /**
   * Lint in a [worker thread](https://nodejs.org/api/worker_threads.html#portpostmessagevalue-transferlist).
   *
   * Vite builds faster this way. The trade-off: no error overlay, and the build is not stopped even when the terminal shows errors.
   *
   * [@nabla/vite-plugin-eslint](https://github.com/nabla/vite-plugin-eslint) and [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker) work along the same lines. The former only lints in a worker; the latter shows errors and warnings in the browser.
   *
   * 在 [worker](https://nodejs.org/api/worker_threads.html#portpostmessagevalue-transferlist) 里校验。
   *
   * 这样 Vite 构建更快，代价是没有错误遮罩，终端里报错时构建也不会停。
   *
   * [@nabla/vite-plugin-eslint](https://github.com/nabla/vite-plugin-eslint) 和 [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker) 是同样的思路。前者只能在 worker 里校验，后者能把错误和警告显示在浏览器里。
   *
   * @default false
   */
  lintInWorker: boolean;
  /**
   * Lint the files matched by `include` once, in `buildStart`, to catch problems early.
   *
   * Without a warm cache and with `lintInWorker` off, this makes the first Vite startup noticeably slower.
   *
   * 在 `buildStart` 里按 `include` 校验一遍，早点发现问题。
   *
   * 没有缓存又没开 `lintInWorker` 时，Vite 第一次启动会明显变慢。
   *
   * @default false
   */
  lintOnStart: boolean;
  /**
   * Run ESLint under `test` mode. See [Command Line Interface](https://vite.dev/guide/#command-line-interface) and [Configuring Vitest](https://vitest.dev/guide/#configuring-vitest).
   *
   * 在 `test` 模式下运行 ESLint。见[命令行界面](https://cn.vitejs.dev/guide/#command-line-interface)和[配置 Vitest](https://cn.vitest.dev/guide/)。
   *
   * @default false
   */
  test: boolean;
}
export type ESLintPluginUserOptions = Partial<ESLintPluginOptions>;

/**
 * Styling and behaviour options for the custom overlay.
 *
 * 自定义遮罩层的样式和行为配置。
 */
export interface CustomOverlayOptions {
  /**
   * Whether the panel starts open.
   * - `true`: always open.
   * - `false`: always collapsed.
   * - `"error"`: open only when there is at least one error.
   *
   * 面板是否默认展开。
   * - `true`：始终展开。
   * - `false`：始终折叠。
   * - `"error"`：至少有一个错误时才展开。
   *
   * @default "error"
   */
  initialIsOpen?: boolean | "error";
  /**
   * Corner of the viewport that holds the badge and panel.
   *
   * 徽标和面板放在视口的哪个角。
   *
   * @default "br"
   */
  position?: "tl" | "tr" | "bl" | "br";
  /**
   * Override the overlay's CSS variables. Keys are the predefined variable names, values are CSS values.
   *
   * 覆盖遮罩层的 CSS 变量。键是预定义的变量名，值是 CSS 值。
   */
  theme?: Partial<Record<ThemeKey, string>>;
  /**
   * The overlay's z-index. Configurable because design systems sometimes sit on high layers.
   *
   * 遮罩层的 z-index。设计系统有时会占用很高的层级，所以开放这个选项。
   *
   * @default 99998
   */
  zIndex?: number;
}

/**
 * Predefined CSS variable keys available to `CustomOverlayOptions.theme`.
 *
 * `CustomOverlayOptions.theme` 可用的预定义 CSS 变量键。
 */
export type ThemeKey =
  | "--vite-plugin-eslint2-bg"
  | "--vite-plugin-eslint2-panel-bg"
  | "--vite-plugin-eslint2-error"
  | "--vite-plugin-eslint2-warning"
  | "--vite-plugin-eslint2-text"
  | "--vite-plugin-eslint2-font-mono"
  | "--vite-plugin-eslint2-radius";

/**
 * Structured payload pushed from the server to the custom overlay runtime.
 * Deliberately separate from ESLint's `LintResult` so it stays stable across ESLint versions.
 *
 * 从服务端推给自定义遮罩层运行时的结构化数据。故意不沿用 ESLint 的 `LintResult`，这样换 ESLint 版本也不用改。
 */
export interface OverlayPayload {
  results: Array<{
    filePath: string;
    messages: Array<{
      line: number;
      column: number;
      severity: "error" | "warning";
      ruleId: string | null;
      message: string;
    }>;
  }>;
}

export type ESLintInstance = ESLint.ESLint;
export type ESLintConstructorOptions = ESLint.ESLint.Options;
export type ESLintFormatter = ESLint.ESLint.Formatter;
export type ESLintOutputFixes = typeof ESLint.ESLint.outputFixes;
export type ESLintLintResult = ESLint.ESLint.LintResult;
export type ESLintLintResults = ESLintLintResult[];

export type TextType = "error" | "warning" | "plugin";
