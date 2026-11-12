import { RUNTIME_CLIENT_RUNTIME_PATH } from "../constants";
import type { CustomOverlayOptions } from "../types";

/**
 * Build the inline script that boots the custom overlay.
 *
 * The script imports the runtime virtual module (handled by the plugin's
 * `resolveId` and `load` hooks) and calls `inject()` with the resolved overlay
 * config. The config is JSON-serialized into the script, so no extra request is
 * needed.
 *
 * vite-plugin-checker boots its overlay the same way, minus the reconnect and
 * buffer protocol a single linter does not need.
 */
export const composePreambleCode = ({
  overlayConfig,
}: {
  overlayConfig: false | true | CustomOverlayOptions;
}): string => `
import { inject } from "${RUNTIME_CLIENT_RUNTIME_PATH}";
inject({ overlayConfig: ${JSON.stringify(overlayConfig)} });
`;
