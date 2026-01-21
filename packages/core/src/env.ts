import type { ResolvedConfig } from 'vite'

/**
 * Detects whether the current environment supports runtime injection
 *
 * 检测当前环境是否支持运行时注入
 *
 * Runtime injection is supported in Web and H5 environments, but not in:
 * - Build mode
 * - Mini-programs (isMp)
 * - App environments (isApp)
 *
 * 运行时注入在 Web 和 H5 环境中支持，但在以下环境中不支持：
 * - 构建模式
 * - 小程序环境
 * - App 环境
 *
 * @param config - Vite resolved config
 * @returns Promise<boolean> - true if runtime injection is supported
 *
 * @example
 * ```typescript
 * const supported = await supportsRuntimeInjection(config)
 * if (supported) {
 *   // Enable runtime injection
 * }
 * ```
 */
export async function supportsRuntimeInjection(
  config: ResolvedConfig
): Promise<boolean> {
  // 不支持构建模式
  // Build mode is not supported
  if (config.command === 'build') return false

  try {
    // 尝试导入 @uni-helper/uni-env 检测是否为小程序或 App
    // Try importing @uni-helper/uni-env to detect mini-program or App environment
    const { isMp, isApp } = await import('@uni-helper/uni-env')

    // 小程序和 App 不支持运行时注入
    // Mini-programs and Apps do not support runtime injection
    return !(isMp || isApp)
  } catch {
    // 导入失败时，默认支持（Web、H5 等环境）
    // Default to supported when import fails (Web, H5, etc.)
    return true
  }
}
