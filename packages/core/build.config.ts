import { unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/index", "src/worker"],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
    esbuild: {
      target: "node18",
    },
  },
  hooks: {
    "build:done": (ctx) => {
      unlinkSync(resolve(ctx.options.outDir, "worker.d.ts"));
    },
  },
});
