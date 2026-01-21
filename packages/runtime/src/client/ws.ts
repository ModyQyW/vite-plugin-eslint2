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

interface WebSocketMessage {
  type: 'diagnostic' | string
  payload?: DiagnosticData
}

let ws: WebSocket | null = null
const messageHandlers: MessageHandler[] = []

export function createWebSocket(serverUrl: string): WebSocket {
  // 先关闭现有连接
  if (ws) {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close()
    }
  }

  ws = new WebSocket(serverUrl)

  ws.onopen = () => {
    console.log('[ESLint Runtime] WebSocket connected')
    // 通知运行时加载完成
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'runtime-loaded' }))
    }
  }

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data) as WebSocketMessage
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

  ws.onerror = () => {
    console.error('[ESLint Runtime] WebSocket error occurred')
  }

  return ws
}

export function onDiagnostic(handler: MessageHandler): () => void {
  messageHandlers.push(handler)
  // 返回取消订阅函数
  return () => {
    const index = messageHandlers.indexOf(handler)
    if (index > -1) {
      messageHandlers.splice(index, 1)
    }
  }
}

export function disconnect() {
  ws?.close()
  ws = null
}
