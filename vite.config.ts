import { defineConfig } from 'vite';

export default defineConfig({
  base: '/iwsdk-paper-tear/',
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
});
