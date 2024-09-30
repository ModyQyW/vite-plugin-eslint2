import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint2";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), eslint()],
});
