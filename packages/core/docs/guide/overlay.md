# Runtime Overlay / 运行时遮罩层

## Introduction / 简介

The Runtime Overlay feature displays ESLint errors and warnings directly in your browser during development. This allows you to see and fix linting issues without switching between your editor and the terminal.

运行时遮罩层功能在开发过程中直接在浏览器中显示 ESLint 错误和警告。这让您无需在编辑器和终端之间切换即可查看和修复代码检查问题。

### Key Benefits / 主要优势

- **Real-time Feedback** - See linting issues immediately as you develop
- **Better Developer Experience** - No need to check the terminal for ESLint output
- **Auto-detection** - Automatically enabled in supported environments, disabled in unsupported ones (e.g., mini-programs)
- **Customizable** - Configure position, style, and behavior to fit your workflow

- **实时反馈** - 开发时立即查看代码检查问题
- **更好的开发体验** - 无需在终端中查看 ESLint 输出
- **自动检测** - 在支持的环境中自动启用，在不支持的环境中自动禁用（如小程序）
- **可定制** - 配置位置、样式和行为以适应您的工作流程

## Quick Start / 快速开始

The overlay is enabled by default in development mode for supported environments:

在支持的环境中，开发模式下默认启用遮罩层：

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint2";

export default defineConfig({
  plugins: [
    eslint()
    // overlay is enabled by default / 默认启用
  ],
});
```

To disable the overlay:

要禁用遮罩层：

```typescript
export default defineConfig({
  plugins: [
    eslint({
      overlay: false
    })
  ],
});
```

## Configuration Options / 配置选项

The `overlay` option accepts either a boolean or an `OverlayConfig` object:

`overlay` 选项接受布尔值或 `OverlayConfig` 对象：

| Option / 选项 | Type / 类型 | Default / 默认值 | Description / 描述 |
|---------------|-------------|------------------|---------------------|
| `position` | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left'` | `'bottom-right'` | Position of the overlay on the screen / 遮罩层在屏幕上的位置 |
| `initialIsOpen` | `boolean` | `true` (when there are errors / 有错误时) | Whether the overlay is expanded initially / 初始是否展开遮罩层 |
| `maxIssues` | `number` | `50` | Maximum number of issues to display per file / 单个文件最大显示问题数 |
| `style` | `Record<string, string>` | `undefined` | Custom CSS styles for the overlay / 遮罩层的自定义 CSS 样式 |

### Example Configuration / 配置示例

```typescript
export default defineConfig({
  plugins: [
    eslint({
      overlay: {
        position: 'top-right',
        initialIsOpen: true,
        maxIssues: 100,
        style: {
          zIndex: '9999'
        }
      }
    })
  ],
});
```

## Environment Support / 环境支持

The overlay feature is automatically enabled or disabled based on your environment:

遮罩层功能会根据您的环境自动启用或禁用：

### Supported Environments / 支持的环境

- Web applications / Web 应用
- Electron apps / Electron 应用
- Any environment with `window` and `document` objects / 任何具有 `window` 和 `document` 对象的环境

### Unsupported Environments / 不支持的环境

- Mini-programs (WeChat, Alipay, etc.) / 小程序（微信、支付宝等）
- Server-side rendering (SSR) / 服务端渲染
- Any environment without browser APIs / 任何没有浏览器 API 的环境

In unsupported environments, the overlay is automatically disabled and the plugin continues to function with terminal output only.

在不支持的环境中，遮罩层会自动禁用，插件继续运行并仅在终端输出结果。

## Complete Example / 完整示例

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint2";

export default defineConfig({
  plugins: [
    eslint({
      // Basic overlay configuration / 基础遮罩层配置
      overlay: {
        // Position at top-right corner / 位于右上角
        position: 'top-right',

        // Expand when there are errors / 有错误时展开
        initialIsOpen: true,

        // Show up to 100 issues per file / 每个文件最多显示 100 个问题
        maxIssues: 100,

        // Custom styles / 自定义样式
        style: {
          zIndex: '9999',
          backgroundColor: 'rgba(0, 0, 0, 0.85)'
        }
      },

      // Other plugin options / 其他插件选项
      cache: true,
      lintInWorker: false,
      lintDirtyOnly: true,
    })
  ],
});
```

## FAQ / 常见问题

### Q: Why is the overlay not showing? / 问：为什么遮罩层没有显示？

A: The overlay only works in development mode (`vite dev` or `vite serve`). Make sure you're running Vite in development mode, not build mode. Also, check if your environment is supported (see Environment Support above).

答：遮罩层仅在开发模式（`vite dev` 或 `vite serve`）下工作。请确保您正在以开发模式而非构建模式运行 Vite。另外，请检查您的环境是否受支持（见上面的环境支持）。

### Q: Can I use the overlay in production? / 问：我可以在生产环境使用遮罩层吗？

A: No, the overlay is only available in development mode. It's automatically disabled in production builds.

答：不可以，遮罩层仅在开发模式下可用。在生产构建中会自动禁用。

### Q: Does the overlay work with mini-programs? / 问：遮罩层支持小程序吗？

A: No, the overlay requires browser APIs like `window` and `document`, which are not available in mini-program environments. The plugin automatically detects and disables the overlay for mini-programs.

答：不支持，遮罩层需要浏览器 API（如 `window` 和 `document`），而这些在小程序环境中不可用。插件会自动检测并在小程序环境中禁用遮罩层。

### Q: How do I customize the overlay appearance? / 问：如何自定义遮罩层外观？

A: Use the `style` option in `OverlayConfig` to apply custom CSS styles. For example:

答：使用 `OverlayConfig` 中的 `style` 选项应用自定义 CSS 样式。例如：

```typescript
overlay: {
  style: {
    width: '400px',
    fontSize: '14px',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    color: '#ffffff'
  }
}
```

### Q: Can I change the overlay position dynamically? / 问：我可以动态更改遮罩层位置吗？

A: The position is set during plugin initialization and cannot be changed dynamically. If you need different positions for different projects, configure them in their respective `vite.config.ts` files.

答：位置在插件初始化时设置，无法动态更改。如果您需要在不同项目中使用不同位置，请在各自的 `vite.config.ts` 文件中配置。

### Q: What happens if there are too many issues? / 问：如果问题太多会发生什么？

A: The overlay limits the number of issues displayed per file using the `maxIssues` option (default: 50). Issues beyond this limit are not displayed in the overlay but still appear in the terminal output.

答：遮罩层使用 `maxIssues` 选项（默认：50）限制每个文件显示的问题数量。超过此限制的问题不会在遮罩层中显示，但仍然会出现在终端输出中。
