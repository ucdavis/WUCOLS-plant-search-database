// filepath: vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
  optimizeDeps: {
    include: ['xlsx'],
  },
  define: {
    global: 'globalThis',
  },
});