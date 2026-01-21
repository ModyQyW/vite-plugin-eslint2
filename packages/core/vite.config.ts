import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true
    })
  ],
  resolve: {
    alias: {
      'node:worker_threads': 'worker_threads',
      'node:path': 'path',
      'node:url': 'url',
      'node:fs': 'fs'
    }
  },
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: [
        'eslint',
        'vite',
        'debug',
        'picocolors',
        '@rollup/pluginutils',
        'ws',
        '@uni-helper/uni-env',
        'fs',
        'path',
        'url',
        'worker_threads',
        'node:worker_threads',
        'node:path',
        'node:url',
        'node:fs'
      ]
    },
    target: 'node18',
    minify: false
  }
})
