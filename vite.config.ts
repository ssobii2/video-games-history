import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { apiDevServer } from './vite-plugins/api-dev';

export default defineConfig({
  plugins: [react(), apiDevServer()],
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          vendor: ['react', 'react-dom', 'gsap'],
        },
      },
    },
  },
});
