import { unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/index', 'src/worker'],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
    esbuild: {
      target: 'node14.18',
    },
  },
  hooks: {
    'build:done': async (ctx) => {
      await Promise.all(
        ['ts', 'cts', 'mts'].map((ext) =>
          unlink(resolve(ctx.options.outDir, `worker.d.${ext}`)),
        ),
      );
    },
  },
});
