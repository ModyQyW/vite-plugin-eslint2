import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import eslint from '@modyqyw/vite-plugin-eslint';
import inspect from 'vite-plugin-inspect';

export default defineConfig({
  plugins: [solid(), eslint(), inspect()],
  build: {
    target: 'esnext',
    polyfillDynamicImport: false,
  },
});
