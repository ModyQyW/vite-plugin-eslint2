// Entry point for ESLint runtime
// This file is loaded by the browser and initializes the overlay and WebSocket connection

console.log('[ESLint Runtime] Loaded')

// Re-export overlay and WebSocket APIs for external use
export * from './client'
