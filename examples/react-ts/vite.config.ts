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
    // Only for test
    // eslint({
    //   lintInWorker: true,
    //   lintOnStart: true,
    // }),
    // Recommended
    // eslint({
    //   fix: true,
    //   lintInWorker: true,
    //   lintOnStart: true,
    // }),
  ],
});
