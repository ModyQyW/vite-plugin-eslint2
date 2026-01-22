# Runtime Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 vite-plugin-eslint2 添加运行时 overlay 功能，支持在开发环境浏览器中显示 ESLint 错误和警告。

**Architecture:** 拆分为 core（插件核心）和 runtime（浏览器端运行时）两个包。core 使用 WebSocket 通信，runtime 使用 Vue 实现 Overlay UI。通过环境检测自动决定是否注入运行时。

**Tech Stack:** Vite 7, Vue 3, WebSocket (ws), ESLint 7-9, @uni-helper/uni-env, TypeScript

---

## 阶段 1：准备工作

### Task 1: 创建 runtime 包结构

**Files:**
- Create: `packages/runtime/package.json`
- Create: `packages/runtime/tsconfig.json`
- Create: `packages/runtime/tsconfig.node.json`
- Create: `packages/runtime/vite.config.ts`
- Create: `packages/runtime/index.html`
- Create: `packages/runtime/src/main.ts`
- Create: `packages/runtime/src/client/index.ts`
- Create: `packages/runtime/src/client/ws.ts`
- Create: `packages/runtime/src/client/overlay.ts`

**Step 1: 创建 package.json**

创建文件 `packages/runtime/package.json`:

```json
{
  "name": "@vite-plugin-eslint2/runtime",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "Runtime for vite-plugin-eslint2 overlay",
  "files": [],
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch"
  },
  "dependencies": {
    "vue": "^3.5.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.0",
    "vite": "^7.0.2",
    "typescript": "^5.8.3",
    "vue-tsc": "^3.0.0"
  }
}
```

**Step 2: 创建 tsconfig.json**

创建文件 `packages/runtime/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Step 3: 创建 tsconfig.node.json**

创建文件 `packages/runtime/tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

**Step 4: 创建 vite.config.ts**

创建文件 `packages/runtime/vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    minify: false,
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      formats: ['es'],
      fileName: 'main'
    },
    outDir: resolve(__dirname, '../core/dist/@runtime'),
    emptyOutDir: true
  }
})
```

**Step 5: 创建 index.html**

创建文件 `packages/runtime/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ESLint Runtime</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

**Step 6: 创建占位文件**

创建 `packages/runtime/src/main.ts`:
```typescript
console.log('ESLint Runtime loaded')
```

创建 `packages/runtime/src/client/index.ts`:
```typescript
// Placeholder
export {}
```

创建 `packages/runtime/src/client/ws.ts`:
```typescript
// Placeholder
export {}
```

创建 `packages/runtime/src/client/overlay.ts`:
```typescript
// Placeholder
export {}
```

**Step 7: 验证构建**

运行: `cd packages/runtime && pnpm build`

预期输出: 构建成功，在 `packages/core/dist/@runtime/` 生成 `main.js`

**Step 8: 提交**

```bash
git add packages/runtime/
git commit -m "feat: create runtime package structure"
```

---

### Task 2: 配置 core 包的 Vite 构建

**Files:**
- Create: `packages/core/vite.config.ts`
- Modify: `packages/core/package.json`
- Delete: `packages/core/tsdown.config.ts`

**Step 1: 创建 vite.config.ts**

创建文件 `packages/core/vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true
    })
  ],
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: [
        'eslint',
        'vite',
        'debug',
        'picocolors',
        '@rollup/pluginutils',
        'ws',
        '@uni-helper/uni-env',
        'fs',
        'path',
        'url',
        'node:worker_threads',
        'node:path'
      ]
    },
    target: 'node18',
    minify: false
  }
})
```

**Step 2: 更新 package.json**

修改文件 `packages/core/package.json`:

修改 `scripts` 部分:
```json
{
  "scripts": {
    "build": "vite build",
    "build-post": "cd ../runtime && pnpm build",
    "dev": "vite build --watch"
  }
}
```

修改 `dependencies`，添加 `ws`:
```json
{
  "dependencies": {
    "@rollup/pluginutils": "^5.2.0",
    "debug": "^4.4.1",
    "picocolors": "^1.1.1",
    "ws": "^8.18.0"
  }
}
```

修改 `devDependencies`:
```json
{
  "devDependencies": {
    "@types/debug": "^4.1.12",
    "@types/eslint": "^8.56.12",
    "@types/ws": "^8.5.12",
    "vite": "^7.0.2",
    "vite-plugin-dts": "^4.5.0",
    "typescript": "^5.8.3"
  }
}
```

修改 `peerDependencies`，添加 `@uni-helper/uni-env`:
```json
{
  "peerDependencies": {
    "@types/eslint": "^7.0.0 || ^8.0.0 || ^9.0.0",
    "@uni-helper/uni-env": "optional",
    "eslint": "^7.0.0 || ^8.0.0 || ^9.0.0",
    "rollup": "^2.0.0 || ^3.0.0 || ^4.0.0",
    "vite": "^2.0.0 || ^3.0.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0"
  }
}
```

**Step 3: 删除 tsdown.config.ts**

删除: `packages/core/tsdown.config.ts`

**Step 4: 验证构建**

运行: `cd packages/core && pnpm build`

预期输出: 构建成功，在 `packages/core/dist/` 生成 `index.js` 和类型声明文件

**Step 5: 提交**

```bash
git add packages/core/
git commit -m "build: migrate core package to vite"
```

---

### Task 3: 更新根目录构建配置

**Files:**
- Modify: `package.json`

**Step 1: 更新根 package.json 构建脚本**

修改根目录 `package.json` 的 `scripts.build`:

```json
{
  "scripts": {
    "build": "pnpm -r --filter='./packages/*' run build && pnpm -r run build-post"
  }
}
```

**Step 2: 验证完整构建**

运行: `pnpm build`

预期输出: 所有包构建成功

**Step 3: 提交**

```bash
git add package.json
git commit -m "build: update root build script"
```

---

## 阶段 2：运行时开发

### Task 4: 实现 WebSocket 客户端

**Files:**
- Modify: `packages/runtime/src/client/ws.ts`

**Step 1: 编写 WebSocket 客户端**

修改文件 `packages/runtime/src/client/ws.ts`:

```typescript
export interface DiagnosticData {
  file: string
  errors: Array<{
    line: number
    column: number
    message: string
    severity: 'error' | 'warning'
    ruleId?: string
  }>
}

export type MessageHandler = (data: DiagnosticData) => void

let ws: WebSocket | null = null
const messageHandlers: MessageHandler[] = []

export function createWebSocket(serverUrl: string): WebSocket {
  ws = new WebSocket(serverUrl)

  ws.onopen = () => {
    console.log('[ESLint Runtime] WebSocket connected')
    // 通知运行时加载完成
    ws?.send(JSON.stringify({ type: 'runtime-loaded' }))
  }

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data)
      if (message.type === 'diagnostic' && message.payload) {
        messageHandlers.forEach(handler => handler(message.payload))
      }
    } catch (error) {
      console.error('[ESLint Runtime] Failed to parse message:', error)
    }
  }

  ws.onclose = () => {
    console.log('[ESLint Runtime] WebSocket disconnected')
  }

  ws.onerror = (error) => {
    console.error('[ESLint Runtime] WebSocket error:', error)
  }

  return ws
}

export function onDiagnostic(handler: MessageHandler) {
  messageHandlers.push(handler)
}

export function disconnect() {
  ws?.close()
  ws = null
}
```

**Step 2: 提交**

```bash
git add packages/runtime/src/client/ws.ts
git commit -m "feat(runtime): implement WebSocket client"
```

---

### Task 5: 实现 Overlay UI 组件

**Files:**
- Create: `packages/runtime/src/client/components/ErrorList.vue`
- Modify: `packages/runtime/src/client/overlay.ts`

**Step 1: 创建 ErrorList 组件**

创建文件 `packages/runtime/src/client/components/ErrorList.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'

interface ErrorItem {
  line: number
  column: number
  message: string
  severity: 'error' | 'warning'
  ruleId?: string
}

interface FileErrors {
  file: string
  errors: ErrorItem[]
}

const props = defineProps<{
  errors: FileErrors[]
  maxIssues?: number
}>()

const emit = defineEmits<{
  close: []
}>()

const totalErrors = computed(() =>
  props.errors.reduce((sum, file) => sum + file.errors.filter(e => e.severity === 'error').length, 0)
)

const totalWarnings = computed(() =>
  props.errors.reduce((sum, file) => sum + file.errors.filter(e => e.severity === 'warning').length, 0)
)

const displayErrors = computed(() => {
  if (!props.maxIssues) return props.errors
  return props.errors.map(file => ({
    ...file,
    errors: file.errors.slice(0, props.maxIssues)
  }))
})
</script>

<template>
  <div class="eslint-overlay">
    <div class="eslint-overlay-header">
      <div class="eslint-overlay-title">
        <span class="error-count">{{ totalErrors }} errors</span>
        <span v-if="totalWarnings > 0" class="warning-count">{{ totalWarnings }} warnings</span>
      </div>
      <button @click="emit('close')" class="close-button">×</button>
    </div>

    <div class="eslint-overlay-content">
      <div v-for="file in displayErrors" :key="file.file" class="file-section">
        <div class="file-name">{{ file.file }}</div>
        <div v-for="(error, index) in file.errors" :key="index" :class="['error-item', error.severity]">
          <span class="error-location">Line {{ error.line }}:{{ error.column }}</span>
          <span class="error-message">{{ error.message }}</span>
          <span v-if="error.ruleId" class="error-rule">{{ error.ruleId }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.eslint-overlay {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  max-height: 400px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  color: #fff;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

.eslint-overlay-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #333;
}

.eslint-overlay-title {
  display: flex;
  gap: 12px;
  font-weight: 600;
}

.error-count {
  color: #ff6b6b;
}

.warning-count {
  color: #ffd93d;
}

.close-button {
  background: none;
  border: none;
  color: #999;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-button:hover {
  color: #fff;
}

.eslint-overlay-content {
  max-height: 320px;
  overflow-y: auto;
  padding: 8px 0;
}

.eslint-overlay-content::-webkit-scrollbar {
  width: 8px;
}

.eslint-overlay-content::-webkit-scrollbar-track {
  background: #1a1a1a;
}

.eslint-overlay-content::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 4px;
}

.file-section {
  padding: 8px 16px;
  border-bottom: 1px solid #2a2a2a;
}

.file-section:last-child {
  border-bottom: none;
}

.file-name {
  font-weight: 600;
  margin-bottom: 8px;
  color: #ddd;
}

.error-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 4px;
  margin-bottom: 4px;
}

.error-item.error {
  background: rgba(255, 107, 107, 0.1);
}

.error-item.warning {
  background: rgba(255, 217, 61, 0.1);
}

.error-location {
  color: #888;
  font-size: 11px;
}

.error-message {
  color: #fff;
}

.error-rule {
  color: #666;
  font-size: 10px;
}
</style>
```

**Step 2: 实现 overlay 逻辑**

修改文件 `packages/runtime/src/client/overlay.ts`:

```typescript
import { createRef, shallowRef } from 'vue'
import type { DiagnosticData } from './ws'
import { createWebSocket, onDiagnostic, disconnect } from './ws'

export interface OverlayConfig {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  initialIsOpen?: boolean
  maxIssues?: number
}

export function createOverlay(config: OverlayConfig = {}) {
  const {
    position = 'bottom-right',
    initialIsOpen = true,
    maxIssues = 50
  } = config

  const errors = shallowRef<DiagnosticData[]>([])
  const isOpen = shallowRef(initialIsOpen)
  const containerRef = createRef<HTMLElement | null>(null)

  // 监听诊断信息
  onDiagnostic((data) => {
    const existingIndex = errors.value.findIndex(e => e.file === data.file)

    if (data.errors.length === 0) {
      // 如果没有错误，移除该文件
      if (existingIndex !== -1) {
        errors.value.splice(existingIndex, 1)
      }
    } else {
      // 更新或添加错误
      if (existingIndex !== -1) {
        errors.value[existingIndex] = data
      } else {
        errors.value.push(data)
      }
    }

    // 有错误时自动打开
    if (data.errors.length > 0 && isOpen.value === false) {
      isOpen.value = true
    }
  })

  function close() {
    isOpen.value = false
  }

  function clear() {
    errors.value = []
  }

  function destroy() {
    disconnect()
    clear()
    if (containerRef.value) {
      containerRef.value.remove()
    }
  }

  return {
    errors,
    isOpen,
    containerRef,
    close,
    clear,
    destroy
  }
}
```

**Step 3: 提交**

```bash
git add packages/runtime/src/client/
git commit -m "feat(runtime): implement overlay UI"
```

---

### Task 6: 实现运行时主入口

**Files:**
- Modify: `packages/runtime/src/main.ts`

**Step 1: 实现主入口**

修改文件 `packages/runtime/src/main.ts`:

```typescript
import { createApp } from 'vue'
import { createWebSocket } from './client/ws'
import { createOverlay, type OverlayConfig } from './client/overlay'
import ErrorList from './client/components/ErrorList.vue'

export interface RuntimeConfig {
  base: string
  overlayConfig?: OverlayConfig
}

let overlayInstance: ReturnType<typeof createOverlay> | null = null

export function inject(config: RuntimeConfig) {
  // 等待 DOM 加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initialize(config))
  } else {
    initialize(config)
  }
}

function initialize(config: RuntimeConfig) {
  const { base, overlayConfig } = config

  // 创建 WebSocket 连接
  const wsUrl = getWebSocketUrl(base)
  createWebSocket(wsUrl)

  // 创建 overlay
  overlayInstance = createOverlay(overlayConfig)

  // 创建 Vue 应用
  const container = document.createElement('div')
  container.id = 'eslint-overlay-container'
  document.body.appendChild(container)

  const app = createApp(ErrorList, {
    errors: overlayInstance.errors.value,
    maxIssues: overlayConfig?.maxIssues,
    onClose: () => overlayInstance?.close()
  })

  app.mount(container)
  overlayInstance.containerRef = container
}

function getWebSocketUrl(base: string): string {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = location.host
  return `${protocol}//${host}${base}__eslint_ws`
}

// 导出供外部使用
if (typeof window !== 'undefined') {
  (window as any).__eslint_runtime__ = {
    inject,
    createOverlay,
    createWebSocket
  }
}
```

**Step 2: 构建运行时**

运行: `cd packages/runtime && pnpm build`

预期输出: 成功构建到 `packages/core/dist/@runtime/main.js`

**Step 3: 提交**

```bash
git add packages/runtime/src/main.ts
git commit -m "feat(runtime): implement main entry point"
```

---

## 阶段 3：插件核心重构

### Task 7: 添加类型定义

**Files:**
- Modify: `packages/core/src/types.ts`

**Step 1: 添加运行时相关类型**

在文件 `packages/core/src/types.ts` 末尾添加:

```typescript
// === Runtime Overlay Types ===

export interface OverlayConfig {
  /**
   * 位置：'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
   * @default 'bottom-right'
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

  /**
   * 初始是否展开
   * @default true（有错误时）
   */
  initialIsOpen?: boolean

  /**
   * 单文件最大显示问题数
   * @default 50
   */
  maxIssues?: number

  /**
   * 自定义样式
   */
  style?: Record<string, string>
}

// === WebSocket Server Types ===

export interface WebSocketServer {
  close(): void
  clients: Set<any>
  broadcast(data: string): void
}

export interface DiagnosticMessage {
  type: 'diagnostic'
  payload: {
    file: string
    errors: Array<{
      line: number
      column: number
      message: string
      severity: 'error' | 'warning'
      ruleId?: string
    }>
  }
}

export interface ClearMessage {
  type: 'clear'
}
```

**Step 2: 更新 ESLintPluginOptions**

在文件 `packages/core/src/types.ts` 的 `ESLintPluginOptions` 接口中添加:

```typescript
export interface ESLintPluginOptions extends ESLint.ESLint.Options {
  // ... 现有选项 ...

  /**
   * 是否在 dev 模式启用运行时 overlay
   * @default true（在支持的环境下）
   */
  overlay?: boolean | OverlayConfig

  /**
   * 是否在终端输出
   * @default true
   */
  terminal?: boolean
}
```

**Step 3: 提交**

```bash
git add packages/core/src/types.ts
git commit -m "feat(types): add runtime and overlay types"
```

---

### Task 8: 实现环境检测

**Files:**
- Create: `packages/core/src/env.ts`

**Step 1: 实现环境检测函数**

创建文件 `packages/core/src/env.ts`:

```typescript
import type * as Vite from 'vite'

export async function supportsRuntimeInjection(
  config: Vite.ResolvedConfig
): Promise<boolean> {
  // build 模式不注入
  if (config.command === 'build') return false

  try {
    const { isMp, isApp } = await import('@uni-helper/uni-env')
    // 小程序和 App 不支持运行时注入
    return !(isMp || isApp)
  } catch {
    // 无法导入时，默认为支持注入的 Web 环境
    return true
  }
}
```

**Step 2: 编写单元测试**

创建文件 `packages/core/src/env.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { supportsRuntimeInjection } from './env'

describe('supportsRuntimeInjection', () => {
  it('应该为 build 模式返回 false', async () => {
    const config = {
      command: 'build'
    } as any

    const result = await supportsRuntimeInjection(config)
    expect(result).toBe(false)
  })

  it('应该为 serve 模式返回 true（当无法导入 uni-env 时）', async () => {
    const config = {
      command: 'serve'
    } as any

    vi.mock('@uni-helper/uni-env', () => {
      throw new Error('Cannot find module')
    })

    const result = await supportsRuntimeInjection(config)
    expect(result).toBe(true)
  })
})
```

**Step 3: 运行测试**

运行: `cd packages/core && pnpm test`

预期输出: 测试通过

**Step 4: 提交**

```bash
git add packages/core/src/env.ts packages/core/src/env.test.ts
git commit -m "feat(core): implement environment detection"
```

---

### Task 9: 实现 WebSocket 服务器

**Files:**
- Create: `packages/core/src/server/ws-server.ts`

**Step 1: 实现 WebSocket 服务器**

创建文件 `packages/core/src/server/ws-server.ts`:

```typescript
import { WebSocketServer as WS } from 'ws'
import type { Server } from 'http'
import debugWrap from 'debug'
import type { ViteDevServer } from 'vite'
import type { WebSocketServer as IWebSocketServer } from '../types'

const debug = debugWrap('vite-plugin-eslint2:ws')

export function createWebSocketServer(
  server: ViteDevServer
): IWebSocketServer {
  const wss = new WS({ noServer: true })

  // 处理 HTTP 升级请求
  server.httpServer?.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url!, `http://${request.headers.host}`).pathname

    if (pathname === '/__eslint_ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request)
      })
    }
  })

  wss.on('connection', (ws) => {
    debug('WebSocket client connected')

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString())
        debug('Received message:', message)

        // 处理客户端消息
        if (message.type === 'runtime-loaded') {
          debug('Runtime loaded, sending current diagnostics if any')
          // 可以在这里发送缓存的诊断信息
        }
      } catch (error) {
        debug('Failed to parse message:', error)
      }
    })

    ws.on('close', () => {
      debug('WebSocket client disconnected')
    })
  })

  return {
    close() {
      wss.close()
    },
    clients: wss.clients,
    broadcast(data: string) {
      wss.clients.forEach((client) => {
        if (client.readyState === 1) { // OPEN
          client.send(data)
        }
      })
    }
  }
}
```

**Step 2: 提交**

```bash
git add packages/core/src/server/ws-server.ts
git commit -m "feat(core): implement WebSocket server"
```

---

### Task 10: 实现诊断信息格式化

**Files:**
- Create: `packages/core/src/server/diagnostics.ts`

**Step 1: 实现诊断信息转换**

创建文件 `packages/core/src/server/diagnostics.ts`:

```typescript
import type { ESLintLintResults } from '../types'
import type { DiagnosticMessage } from '../types'

export function formatDiagnostics(
  lintResults: ESLintLintResults
): DiagnosticMessage {
  const payload = {
    file: lintResults[0]?.filePath || '',
    errors: lintResults.flatMap((result) =>
      result.messages.map((message) => ({
        line: message.line,
        column: message.column,
        message: message.message,
        severity: message.severity === 2 ? 'error' : 'warning',
        ruleId: message.ruleId
      }))
    )
  }

  return {
    type: 'diagnostic',
    payload
  }
}

export function createClearMessage() {
  return { type: 'clear' }
}
```

**Step 2: 提交**

```bash
git add packages/core/src/server/diagnostics.ts
git commit -m "feat(core): implement diagnostics formatting"
```

---

### Task 11: 重构插件主逻辑

**Files:**
- Modify: `packages/core/src/index.ts`
- Modify: `packages/core/src/utils.ts`

**Step 1: 更新 getOptions 函数**

修改文件 `packages/core/src/utils.ts`，在 `getOptions` 函数中添加:

```typescript
export const getOptions = ({
  // ... 现有解构 ...
  overlay,
  terminal,
  ...eslintConstructorOptions
}: ESLintPluginUserOptions): ESLintPluginOptions => ({
  // ... 现有返回值 ...
  overlay: overlay ?? true,
  terminal: terminal ?? true,
  ...eslintConstructorOptions,
});
```

**Step 2: 更新 lintFiles 函数**

修改文件 `packages/core/src/utils.ts`，修改 `lintFiles` 函数签名:

```typescript
export const lintFiles: LintFiles = async (
  { files, eslintInstance, formatter, outputFixes, options },
  context,
  callback?: (results: ESLintLintResults) => void
) =>
  await eslintInstance
    .lintFiles(files)
    .then(async (lintResults: ESLintLintResults) => {
      // do nothing if there are no results
      if (!lintResults || lintResults.length === 0) return;

      // 调用回调（用于发送到 WebSocket）
      if (callback) {
        callback(lintResults);
      }

      // output fixes
      if (options.fix) outputFixes(lintResults);

      // ... 其余逻辑保持不变 ...
    });
```

**Step 3: 重构插件主文件**

修改文件 `packages/core/src/index.ts`:

```typescript
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import fs from 'node:fs'
import { Worker } from "node:worker_threads";
import debugWrap from "debug";
import type * as Vite from "vite";
import { PLUGIN_NAME } from "./constants";
import type {
  ESLintFormatter,
  ESLintInstance,
  ESLintOutputFixes,
  ESLintPluginUserOptions,
  WebSocketServer,
} from "./types";
import { getFilePath, getFilter, getOptions, initializeESLint, lintFiles, shouldIgnoreModule } from "./utils";
import { supportsRuntimeInjection } from "./env";
import { createWebSocketServer } from "./server/ws-server";
import { formatDiagnostics } from "./server/diagnostics";

const debug = debugWrap(PLUGIN_NAME);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ext = extname(__filename);
const RUNTIME_PATH = '/@vite-plugin-eslint/runtime';

export default function ESLintPlugin(
  userOptions: ESLintPluginUserOptions = {},
): Vite.Plugin {
  const options = getOptions(userOptions);

  let worker: Worker;
  let wsServer: WebSocketServer | null = null;
  let shouldInjectRuntime = false;

  const filter = getFilter(options);
  let eslintInstance: ESLintInstance;
  let formatter: ESLintFormatter;
  let outputFixes: ESLintOutputFixes;

  return {
    name: PLUGIN_NAME,
    apply(config, { command }) {
      debug("==== apply hook ====");
      if (config.mode === "test" || process.env.VITEST) return options.test;
      const shouldApply =
        (command === "serve" && options.dev) ||
        (command === "build" && options.build);
      debug(`should apply this plugin: ${shouldApply}`);
      return shouldApply;
    },

    async configResolved(config) {
      // 检测是否应该注入运行时
      shouldInjectRuntime = await supportsRuntimeInjection(config);
      debug(`Runtime injection: ${shouldInjectRuntime}`);

      // 如果禁用 overlay 或不支持注入，则不使用 WebSocket
      if (!options.overlay || !shouldInjectRuntime) {
        debug('Overlay disabled or runtime not supported');
        return;
      }
    },

    async configureServer(server) {
      // 仅在支持运行时且启用 overlay 时启动 WebSocket 服务器
      if (!shouldInjectRuntime || !options.overlay) return;

      debug('Starting WebSocket server');
      wsServer = createWebSocketServer(server);
    },

    async buildStart() {
      debug("==== buildStart hook ====");

      // 初始化 worker
      if (options.lintInWorker) {
        if (worker) return;
        debug("Initialize worker");
        worker = new Worker(resolve(__dirname, `worker${ext}`), {
          workerData: { options },
        });
        return;
      }

      // 初始化 ESLint
      debug("Initial ESLint");
      const result = await initializeESLint(options);
      eslintInstance = result.eslintInstance;
      formatter = result.formatter;
      outputFixes = result.outputFixes;

      // lint on start 如果需要
      if (options.lintOnStart) {
        debug("Lint on start");
        const hasError = await lintFilesWithCheck(
          {
            files: options.include,
            eslintInstance,
            formatter,
            outputFixes,
            options,
          },
          this
        );

        // build 模式下有错误时中断
        if (hasError && this.meta?.command === 'build') {
          this.error('ESLint found errors. Build failed.');
        }
      }
    },

    async transform(_, id) {
      debug("==== transform hook ====");

      // worker 模式
      if (worker) return worker.postMessage(id);

      // 不使用 worker
      debug(`id: ${id}`);
      const shouldIgnore = await shouldIgnoreModule(id, filter, eslintInstance);
      debug(`should ignore: ${shouldIgnore}`);
      if (shouldIgnore) return;

      const filePath = getFilePath(id);
      debug(`filePath: ${filePath}`);

      return await lintFilesWithCheck(
        {
          files: options.lintDirtyOnly ? filePath : options.include,
          eslintInstance,
          formatter,
          outputFixes,
          options,
        },
        this
      );
    },

    resolveId(id) {
      if (id === RUNTIME_PATH) {
        return '\0' + id;
      }
    },

    load(id) {
      if (id === '\0' + RUNTIME_PATH) {
        // 读取预构建的运行时代码
        const runtimeCode = fs.readFileSync(
          resolve(__dirname, '../dist/@runtime/main.js'),
          'utf-8'
        );
        return runtimeCode;
      }
    },

    transformIndexHtml() {
      // 仅在支持运行时且启用 overlay 时注入
      if (!shouldInjectRuntime || !options.overlay) return;

      const overlayConfig = typeof options.overlay === 'object'
        ? options.overlay
        : {};

      return [
        {
          tag: 'script',
          attrs: { type: 'module' },
          children: `
            import { inject } from '${RUNTIME_PATH}';
            inject({
              base: '${this.meta?.base || '/'}',
              overlayConfig: ${JSON.stringify(overlayConfig)}
            });
          `
        }
      ];
    },

    async buildEnd() {
      debug("==== buildEnd hook ====");
      if (worker) await worker.terminate();
      if (wsServer) {
        wsServer.close();
        wsServer = null;
      }
    },
  };
}

// 辅助函数：带检查的 lint
async function lintFilesWithCheck(
  config: Parameters<typeof lintFiles>[0],
  context: Vite.Rollup.PluginContext
): Promise<boolean> {
  let hasError = false;

  await lintFiles(config, context, (results) => {
    // 通过 WebSocket 发送诊断信息
    if (wsServer) {
      const message = formatDiagnostics(results);
      wsServer.broadcast(JSON.stringify(message));
    }

    // 检查是否有错误
    hasError = results.some(r => r.errorCount > 0);
  });

  return hasError;
}

export type {
  ESLintPluginOptions,
  ESLintPluginUserOptions,
} from "./types";
```

**Step 4: 提交**

```bash
git add packages/core/src/index.ts packages/core/src/utils.ts
git commit -m "feat(core): refactor plugin main logic with runtime support"
```

---

### Task 12: 移除 worker 支持（可选）

**Files:**
- Delete: `packages/core/src/worker.ts`
- Modify: `packages/core/src/types.ts`
- Modify: `packages/core/src/utils.ts`
- Modify: `packages/core/src/index.ts`

**Step 1: 从 types.ts 移除 lintInWorker 选项**

修改文件 `packages/core/src/types.ts`，删除 `lintInWorker` 相关定义。

**Step 2: 从 utils.ts 移除 lintInWorker 处理**

修改文件 `packages/core/src/utils.ts`，从 `getOptions` 中移除 `lintInWorker`。

**Step 3: 从 index.ts 移除 worker 逻辑**

修改文件 `packages/core/src/index.ts`，删除所有 `worker` 相关代码。

**Step 4: 删除 worker.ts**

删除: `packages/core/src/worker.ts`

**Step 5: 提交**

```bash
git add packages/core/
git commit -m "refactor(core): remove worker support"
```

---

## 阶段 4：测试和文档

### Task 13: 更新文档

**Files:**
- Modify: `README.md`
- Create: `docs/guide/overlay.md`

**Step 1: 更新主 README**

在根目录 `README.md` 中添加 overlay 功能说明。

**Step 2: 创建 overlay 使用文档**

创建文件 `docs/guide/overlay.md`，详细说明 overlay 配置和使用。

**Step 3: 提交**

```bash
git add README.md docs/guide/overlay.md
git commit -m "docs: add overlay documentation"
```

---

### Task 14: 最终验证和发布准备

**Step 1: 完整构建测试**

运行: `pnpm build`

预期输出: 所有包成功构建

**Step 2: 运行所有测试**

运行: `pnpm test`

预期输出: 所有测试通过

**Step 3: 类型检查**

运行: `pnpm type-check`

预期输出: 无类型错误

**Step 4: 更新 CHANGELOG**

更新 `CHANGELOG.md`，记录新功能和破坏性变更。

**Step 5: 提交**

```bash
git add CHANGELOG.md
git commit -m "chore: update changelog for runtime refactor"
```

---

## 完成检查清单

- [ ] 所有包成功构建
- [ ] 所有测试通过
- [ ] 类型检查通过
- [ ] 文档完整更新
- [ ] CHANGELOG 已更新

## 回滚计划

如果需要回滚:

```bash
# 删除 worktree
git worktree remove .worktrees/runtime-refactor

# 删除分支
git branch -D feature/runtime-refactor

# 回到主分支
git checkout main
```

---

**实施此计划前，请确保:**
1. 已在 worktree 中工作
2. 已阅读并理解设计文档
3. 已备份重要数据（如有）
