import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint2";

export default defineConfig({
  plugins: [
    // Demonstrates the custom overlay (replaces Vite's native error overlay,
    // works with lintInWorker). Edit src/main.ts to introduce/fix lint errors
    // and watch the overlay update.
    eslint({
      customOverlay: true,
      // customOverlay: {
      //   position: "tl",
      //   initialIsOpen: true,
      //   zIndex: 99999,
      //   theme: {
      //     "--vite-plugin-eslint2-bg": "#1a1a2e",
      //     "--vite-plugin-eslint2-panel-bg": "#16213e",
      //     "--vite-plugin-eslint2-error": "#ff6b6b",
      //   },
      // },
      // To verify worker-mode overlay support:
      // lintInWorker: true,
      // lintOnStart: true,
    }),
  ],
});
