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
