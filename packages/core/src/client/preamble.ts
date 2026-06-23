import { RUNTIME_CLIENT_RUNTIME_PATH } from "../constants";
import type { CustomOverlayOptions } from "../types";

/**
 * Compose the inline script that bootstraps the custom overlay.
 *
 * The script dynamically imports the runtime virtual module (resolved by the
 * plugin's `resolveId`/`load` hooks) and calls `inject()` with the resolved
 * overlay config. `overlayConfig` is JSON-serialized into the script so no
 * additional request round-trip is needed.
 *
 * Mirrors vite-plugin-checker's preamble approach, minus its reconnect/buffer
 * protocol (single linter needs no cross-reconnect resume).
 */
export const composePreambleCode = ({
  overlayConfig,
}: {
  overlayConfig: false | true | CustomOverlayOptions;
}): string => `
import { inject } from "${RUNTIME_CLIENT_RUNTIME_PATH}";
inject({ overlayConfig: ${JSON.stringify(overlayConfig)} });
`;
