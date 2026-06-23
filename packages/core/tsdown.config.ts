import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: ["src/index.ts", "src/worker.ts"],
    clean: true,
    format: ["esm", "cjs"],
    target: "node18",
  },
  {
    // Browser-side custom overlay runtime. Built to a single standalone ESM
    // bundle (no node imports, zero runtime deps) and inlined into the served
    // page via fs.readFileSync at runtime. Kept separate from the node entries
    // so it can target the browser platform and emit only ESM.
    entry: { "client-runtime": "src/client/runtime.ts" },
    format: ["esm"],
    platform: "browser",
    target: "es2020",
    outDir: "dist",
    // Avoid emitting a .d.ts for the runtime; it is browser-only and inlined.
    dts: false,
  },
]);
