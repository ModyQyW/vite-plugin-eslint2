/**
 * ESLint Runtime Main Entry
 *
 * This module provides the inject() function to initialize the ESLint overlay
 * and WebSocket connection in the browser.
 */

import type { DiagnosticData } from "./client/overlay";
import { createDefaultOverlay } from "./client/overlay";
import { createWebSocket, disconnect, onDiagnostic } from "./client/ws";

interface RuntimeInstance {
  disconnect: () => void;
}

// Singleton instance to prevent multiple injections
let instance: RuntimeInstance | null = null;
let isDisconnected = false;

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
  // Singleton protection - return existing instance if already injected
  if (instance) {
    console.warn(
      "[ESLint Runtime] Already injected, returning existing instance",
    );
    return instance;
  }

  console.log("[ESLint Runtime] Injecting runtime...");

  // Get WebSocket server URL
  const wsUrl = getWebSocketServerUrl();
  console.log(`[ESLint Runtime] Connecting to ${wsUrl}`);

  // Create WebSocket connection
  const ws = createWebSocket(wsUrl);

  // Create overlay UI
  overlayInstance = createDefaultOverlay();

  // Subscribe to diagnostic messages with connection state check
  unsubscribeDiagnostic = onDiagnostic((data: DiagnosticData) => {
    // Check if WebSocket is still connected before updating overlay
    if (ws.readyState === WebSocket.OPEN && overlayInstance) {
      overlayInstance.updateDiagnostics([data]);
    } else if (ws.readyState === WebSocket.CLOSED) {
      console.error(
        "[ESLint Runtime] WebSocket disconnected. Disabling overlay.",
      );
      performCleanup();
    }
  });

  // Listen for WebSocket close event to trigger cleanup
  ws.addEventListener("close", () => {
    console.error(
      "[ESLint Runtime] WebSocket connection closed. Cleaning up resources.",
    );
    performCleanup();
  });

  // Create and store the singleton instance
  instance = {
    disconnect: () => {
      if (isDisconnected) {
        console.warn("[ESLint Runtime] Already disconnected");
        return;
      }
      performCleanup();
    },
  };

  return instance;
}

/**
 * Perform complete cleanup of all resources
 */
function performCleanup(): void {
  if (isDisconnected) {
    return;
  }

  isDisconnected = true;

  if (overlayInstance) {
    overlayInstance.destroy();
    overlayInstance = null;
  }

  if (unsubscribeDiagnostic) {
    unsubscribeDiagnostic();
    unsubscribeDiagnostic = null;
  }

  disconnect();
  instance = null;
}

// Re-export overlay and WebSocket APIs for external use
export * from "./client";
