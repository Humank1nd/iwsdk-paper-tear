import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    https: true, // Required for WebXR on Quest
  },
  build: {
    target: 'esnext',
  },
});
