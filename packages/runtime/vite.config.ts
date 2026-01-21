import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    minify: false,
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      formats: ['es'],
      fileName: 'main'
    },
    outDir: resolve(__dirname, '../core/dist/@runtime'),
    emptyOutDir: true
  }
})
