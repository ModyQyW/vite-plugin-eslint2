import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts', 'src/worker.ts'],
    format: ['esm', 'cjs'],
    dts: {
      entry: 'src/index.ts',
    },
    minify: true,
    shims: true,
    splitting: false,
    target: 'node14.18',
    banner: ({ format }) => {
      if (format === 'esm') {
        return {
          // eslint-disable-next-line no-useless-escape
          js: `import {createRequire as __createRequire} from 'module';var require=__createRequire(import\.meta.url);`,
        };
      }
    },
    footer: ({ format }) => {
      if (format === 'cjs') {
        return {
          js: `if (module.exports.default) module.exports = module.exports.default;`,
        };
      }
    },
  },
]);
