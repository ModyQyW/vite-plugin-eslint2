/**
 * ESLint Runtime Main Entry
 *
 * This module provides the inject() function to initialize the ESLint overlay
 * and WebSocket connection in the browser.
 */

import { createDefaultOverlay } from "./client/overlay";
import { createWebSocket, disconnect, onDiagnostic } from "./client/ws";
import type { DiagnosticData } from "./client/overlay";

interface RuntimeInstance {
  disconnect: () => void;
}

let overlayInstance: ReturnType<typeof createDefaultOverlay> | null = null;
let unsubscribeDiagnostic: (() => void) | null = null;

/**
 * Get WebSocket server URL from current page location
 */
function getWebSocketServerUrl(): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.hostname;
  const port = window.location.port;
  const portStr = port ? `:${port}` : "";
  return `${protocol}//${host}${portStr}/__eslint_ws`;
}

/**
 * Inject ESLint runtime into the page
 *
 * This function:
 * 1. Detects WebSocket server address from current page
 * 2. Connects to WebSocket server at /__eslint_ws
 * 3. Creates overlay UI
 * 4. Subscribes to diagnostic messages and updates overlay
 * 5. Sends 'runtime-loaded' event to server
 *
 * @returns Runtime instance with disconnect method for cleanup
 */
export function inject(): RuntimeInstance {
  console.log("[ESLint Runtime] Injecting runtime...");

  // Get WebSocket server URL
  const wsUrl = getWebSocketServerUrl();
  console.log(`[ESLint Runtime] Connecting to ${wsUrl}`);

  // Create WebSocket connection
  const ws = createWebSocket(wsUrl);

  // Create overlay UI
  overlayInstance = createDefaultOverlay();

  // Subscribe to diagnostic messages
  unsubscribeDiagnostic = onDiagnostic((data: DiagnosticData) => {
    if (overlayInstance) {
      overlayInstance.updateDiagnostics([data]);
    }
  });

  // Handle connection errors - silently fail without overlay
  ws.onerror = () => {
    console.error("[ESLint Runtime] WebSocket connection failed. Disabling overlay.");
    if (overlayInstance) {
      overlayInstance.destroy();
      overlayInstance = null;
    }
    if (unsubscribeDiagnostic) {
      unsubscribeDiagnostic();
      unsubscribeDiagnostic = null;
    }
  };

  return {
    disconnect: () => {
      if (overlayInstance) {
        overlayInstance.destroy();
        overlayInstance = null;
      }
      if (unsubscribeDiagnostic) {
        unsubscribeDiagnostic();
        unsubscribeDiagnostic = null;
      }
      disconnect();
    },
  };
}

// Re-export overlay and WebSocket APIs for external use
export * from "./client";
