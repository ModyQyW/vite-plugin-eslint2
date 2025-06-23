import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/worker.ts"],
  clean: true,
  format: ["esm", "cjs"],
  target: "node18",
});
