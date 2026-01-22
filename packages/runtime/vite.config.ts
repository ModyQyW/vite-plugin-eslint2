import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue()],
  build: {
    minify: false,
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      formats: ["es"],
      fileName: "main",
    },
    outDir: resolve(__dirname, "../core/dist/@runtime"),
    emptyOutDir: true,
  },
});
