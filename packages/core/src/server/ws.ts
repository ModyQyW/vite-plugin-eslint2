import type { IncomingMessage } from 'node:http'
import type { WebSocket as WebSocketType } from 'ws'
import { WebSocketServer } from 'ws'
import type { ViteDevServer } from 'vite'
import debugWrap from 'debug'
import { PLUGIN_NAME } from '../constants'
import type { DiagnosticData } from '../format'

const debug = debugWrap(PLUGIN_NAME)

export interface ESLintWebSocketServer {
  sendDiagnostic(data: DiagnosticData): void
  close(): void
}

const WS_PATH = '/__eslint_ws'

export function createWebSocketServer(
  viteServer: ViteDevServer,
): ESLintWebSocketServer {
  const httpServer = viteServer.httpServer

  if (!httpServer) {
    debug('HTTP server not found, WebSocket server not created')
    return {
      sendDiagnostic() {},
      close() {},
    }
  }

  debug('Creating WebSocket server on path: %s', WS_PATH)

  const wss = new WebSocketServer({ noServer: true })

  let ws: WebSocketType | null = null

  const handleUpgrade = (request: IncomingMessage, socket: any, head: Buffer) => {
    const { pathname } = new URL(request.url || '', 'http://localhost')
    if (pathname === WS_PATH) {
      wss.handleUpgrade(request, socket, head, (websocket) => {
        wss.emit('connection', websocket, request)
      })
    }
  }

  httpServer.on('upgrade', handleUpgrade)

  wss.on('connection', (socket: WebSocketType) => {
    debug('WebSocket client connected')
    ws = socket

    socket.on('error', (error) => {
      debug('WebSocket error: %o', error)
    })

    socket.on('close', () => {
      debug('WebSocket client disconnected')
      ws = null
    })

    socket.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString())
        debug('Received message: %o', message)

        if (message.type === 'runtime-loaded') {
          debug('Runtime loaded event received')
        }
      } catch (error) {
        debug('Failed to parse message: %o', error)
      }
    })
  })

  wss.on('error', (error) => {
    debug('WebSocket server error: %o', error)
  })

  return {
    sendDiagnostic(data: DiagnosticData) {
      if (!ws || ws.readyState !== 1) {
        debug('No active WebSocket connection, diagnostic not sent')
        return
      }

      try {
        const message = JSON.stringify({
          type: 'diagnostic',
          data,
        })
        ws.send(message)
        debug('Diagnostic sent for file: %s', data.file)
      } catch (error) {
        debug('Failed to send diagnostic: %o', error)
      }
    },

    close() {
      debug('Closing WebSocket server')
      httpServer.off('upgrade', handleUpgrade)
      wss.close()
      if (ws) {
        ws.close()
        ws = null
      }
    },
  }
}
