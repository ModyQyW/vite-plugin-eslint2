/* eslint-disable no-useless-escape */
import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: 'esm',
    dts: true,
    minify: true,
    shims: true,
    target: 'node12',
    banner: {
      js: `import {createRequire} from 'module';var require=createRequire(import\.meta.url);`,
    },
  },
  {
    entry: ['src/index.ts'],
    format: 'cjs',
    minify: true,
    shims: true,
    target: 'node12',
  },
]);
