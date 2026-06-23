import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint2";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // Only for tests
    eslint(),

    // Only for tests
    // eslint({
    //   fix: true,
    // }),

    // Only for tests
    // eslint({
    //   lintInWorker: true,
    //   lintOnStart: true,
    // }),

    // Only for tests
    // eslint({
    //   customOverlay: true,
    //   // customOverlay: {
    //   //   position: "tl",
    //   //   initialIsOpen: true,
    //   //   zIndex: 99999,
    //   //   theme: {
    //   //     "--vite-plugin-eslint2-bg": "#1a1a2e",
    //   //     "--vite-plugin-eslint2-panel-bg": "#16213e",
    //   //     "--vite-plugin-eslint2-error": "#ff6b6b",
    //   //   },
    //   // },
    // }),

    // Recommended
    // eslint({
    //   fix: true,
    //   lintInWorker: true,
    //   lintOnStart: true,
    //   customOverlay: true,
    // }),
  ],
});
