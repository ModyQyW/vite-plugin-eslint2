import type { DiagnosticData } from './overlay'

export type { DiagnosticData }

export type MessageHandler = (data: DiagnosticData) => void

interface WebSocketMessage {
  type: 'diagnostic' | string
  payload?: DiagnosticData
}

let ws: WebSocket | null = null
const messageHandlers: MessageHandler[] = []

export function createWebSocket(serverUrl: string): WebSocket {
  // 先关闭现有连接并清理回调，防止资源泄漏
  if (ws) {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      // 在关闭前记录日志
      console.log('[ESLint Runtime] Closing old connection to reconnect')
      ws.close(1000, 'Reconnecting to new server')
    }
    // 清理旧连接的所有回调，防止竞态条件
    ws.onopen = null
    ws.onmessage = null
    ws.onclose = null
    ws.onerror = null
  }

  ws = new WebSocket(serverUrl)

  ws.onopen = () => {
    console.log('[ESLint Runtime] WebSocket connected')
    // 通知运行时加载完成
    if (ws) {
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
