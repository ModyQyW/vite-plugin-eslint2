import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import eslint from '@modyqyw/vite-plugin-eslint';
import inspect from 'vite-plugin-inspect';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), eslint(), inspect()],
});
