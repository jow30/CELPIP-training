import { defineConfig } from 'vite';

export default defineConfig({
  base: '/CELPIP-training/',
  root: '.',
  server: {
    open: true,
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
